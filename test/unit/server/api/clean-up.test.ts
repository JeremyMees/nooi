import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockCronEvent, mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import handler from '~~/server/api/clean-up.get'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-14T00:00:00Z'))
  mockRuntimeConfig({})
})

describe('GET /api/clean-up', () => {
  it('rejects a request without the cron secret', async () => {
    const from = mockFrom({
      reservations: mockChain({ data: [], error: null }),
    })

    await expect(handler(mockEvent())).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects every request when no cron secret is configured', async () => {
    mockRuntimeConfig({ cronSecret: '' })
    const event = mockEvent({ headers: { authorization: 'Bearer ' } })

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('deletes unpaid reservations older than thirty days in one query', async () => {
    const chain = mockChain({ data: [], error: null })
    const from = mockFrom({ reservations: chain })

    await handler(mockCronEvent())

    expect(from).toHaveBeenCalledTimes(1)
    expect(from).toHaveBeenCalledWith('reservations')
    expect(chain.delete).toHaveBeenCalledTimes(1)
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2026-08-15')
    expect(chain.eq).toHaveBeenCalledWith('paymentNeeded', true)
  })

  it('reports when there is nothing to clean up', async () => {
    mockFrom({ reservations: mockChain({ data: [], error: null }) })

    await expect(handler(mockCronEvent())).resolves.toBe('No clean up needed')
  })

  it('reports how many reservations were removed', async () => {
    mockFrom({
      reservations: mockChain({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        error: null,
      }),
    })

    await expect(handler(mockCronEvent())).resolves.toBe(
      'Removed 3 items from the database',
    )
  })

  it('surfaces a 500 when the delete fails', async () => {
    mockFrom({
      reservations: mockChain({ data: null, error: { message: 'boom' } }),
    })

    await expect(handler(mockCronEvent())).rejects.toMatchObject({
      statusCode: 500,
      message: 'Could not clean up reservations: boom',
    })
  })
})
