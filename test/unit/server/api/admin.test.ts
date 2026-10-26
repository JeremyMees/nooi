import { beforeEach, describe, expect, it } from 'vitest'
import type { H3Event } from 'h3'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import login from '~~/server/api/admin/login.post'
import session from '~~/server/api/admin/session.get'
import list from '~~/server/api/admin/[table].get'
import create from '~~/server/api/admin/[table].post'
import remove from '~~/server/api/admin/[table].delete'
import update from '~~/server/api/admin/[table]/[id].patch'

const secret = 'a-test-secret-that-is-long-enough-for-h3'

function withParams(event: H3Event, params: Record<string, string>) {
  event.context.params = params
  return event
}

async function sessionCookie(password = 'hunter22'): Promise<string> {
  const event = mockEvent({ method: 'POST', body: { password } })

  await login(event)

  const cookie = [event.node.res.getHeader('set-cookie')].flat()[0] as string

  expect(cookie).toContain('HttpOnly')
  expect(cookie).toContain('SameSite=Strict')

  return cookie.split(';')[0] as string
}

function adminEvent(
  cookie: string,
  options: Parameters<typeof mockEvent>[0] = {},
) {
  return mockEvent({
    ...options,
    headers: { ...options.headers, cookie },
  })
}

beforeEach(() => {
  mockRuntimeConfig({ adminPassword: 'hunter22', appSecret: secret })
})

describe('POST /api/admin/login', () => {
  it('rejects a wrong password', async () => {
    await expect(
      login(mockEvent({ method: 'POST', body: { password: 'admin' } })),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('rejects every password when none is configured', async () => {
    mockRuntimeConfig({ adminPassword: '', appSecret: secret })

    await expect(
      login(mockEvent({ method: 'POST', body: { password: '' } })),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('refuses to issue a session without a strong app secret', async () => {
    mockRuntimeConfig({ adminPassword: 'hunter22', appSecret: 'short' })

    await expect(
      login(mockEvent({ method: 'POST', body: { password: 'hunter22' } })),
    ).rejects.toMatchObject({ statusCode: 500 })
  })

  it('issues an http-only session cookie for the right password', async () => {
    const cookie = await sessionCookie()

    expect(cookie).toMatch(/^nooi-admin=/)
  })
})

describe('GET /api/admin/session', () => {
  it('reports an anonymous visitor', async () => {
    await expect(session(mockEvent())).resolves.toEqual({
      authenticated: false,
    })
  })

  it('reports a logged in admin', async () => {
    const cookie = await sessionCookie()

    await expect(session(adminEvent(cookie))).resolves.toEqual({
      authenticated: true,
    })
  })

  it('does not trust a forged cookie', async () => {
    await expect(
      session(adminEvent('nooi-admin=authenticated')),
    ).resolves.toEqual({ authenticated: false })
  })
})

describe('admin table endpoints', () => {
  it('refuses anonymous reads', async () => {
    const from = mockFrom({})
    const event = withParams(mockEvent(), { table: 'reservations' })

    await expect(list(event)).rejects.toMatchObject({ statusCode: 401 })
    expect(from).not.toHaveBeenCalled()
  })

  it('refuses anonymous deletes', async () => {
    const from = mockFrom({})
    const event = withParams(
      mockEvent({ method: 'DELETE', body: { ids: [1] } }),
      { table: 'reservations' },
    )

    await expect(remove(event)).rejects.toMatchObject({ statusCode: 401 })
    expect(from).not.toHaveBeenCalled()
  })

  it('refuses a table that is not managed here', async () => {
    const cookie = await sessionCookie()
    const event = withParams(adminEvent(cookie), { table: 'users' })

    await expect(list(event)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('lists paid reservations with their event', async () => {
    const cookie = await sessionCookie()
    const chain = mockChain({ data: [{ id: 1 }], count: 1, error: null })
    mockFrom({ reservations: chain })
    const event = withParams(
      adminEvent(cookie, {
        query: { page: '2', search: 'Jef', day: '2026-09-14' },
      }),
      { table: 'reservations' },
    )

    await expect(list(event)).resolves.toEqual({ data: [{ id: 1 }], count: 1 })
    expect(chain.select).toHaveBeenCalledWith('*, event(id, name)', {
      count: 'exact',
    })
    expect(chain.eq).toHaveBeenCalledWith('day', '2026-09-14')
    expect(chain.eq).toHaveBeenCalledWith('paymentNeeded', false)
    expect(chain.or).toHaveBeenCalledWith('name.ilike.*Jef*')
    expect(chain.range).toHaveBeenCalledWith(20, 29)
  })

  it('inserts a row without client controlled ids', async () => {
    const cookie = await sessionCookie()
    const chain = mockChain({ data: null, error: null })
    mockFrom({ rosters: chain })
    const event = withParams(
      adminEvent(cookie, {
        method: 'POST',
        body: { id: 5, created_at: 'x', day: '2026-09-14' },
      }),
      { table: 'rosters' },
    )

    await expect(create(event)).resolves.toEqual({ ok: true })
    expect(chain.insert).toHaveBeenCalledWith({ day: '2026-09-14' })
  })

  it('updates the row named in the url', async () => {
    const cookie = await sessionCookie()
    const chain = mockChain({ data: null, error: null })
    mockFrom({ events: chain })
    const event = withParams(
      adminEvent(cookie, {
        method: 'PATCH',
        body: { name: 'Quiz', reservations: [] },
      }),
      { table: 'events', id: '7' },
    )

    await expect(update(event)).resolves.toEqual({ ok: true })
    expect(chain.update).toHaveBeenCalledWith({ name: 'Quiz' })
    expect(chain.eq).toHaveBeenCalledWith('id', 7)
  })

  it('deletes the given ids', async () => {
    const cookie = await sessionCookie()
    const chain = mockChain({ data: null, error: null })
    mockFrom({ events: chain })
    const event = withParams(
      adminEvent(cookie, { method: 'DELETE', body: { ids: [1, 3] } }),
      { table: 'events' },
    )

    await expect(remove(event)).resolves.toEqual({ ok: true })
    expect(chain.in).toHaveBeenCalledWith('id', [1, 3])
  })

  it('rejects ids that are not integers', async () => {
    const cookie = await sessionCookie()
    mockFrom({ events: mockChain({ data: null, error: null }) })
    const event = withParams(
      adminEvent(cookie, { method: 'DELETE', body: { ids: ['1 or 1=1'] } }),
      { table: 'events' },
    )

    await expect(remove(event)).rejects.toMatchObject({ statusCode: 400 })
  })
})
