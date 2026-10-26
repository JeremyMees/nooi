import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import { mockSend } from '~~/test/unit/stubs/mail'
import handler from '~~/server/api/reservations.post'

beforeEach(() => {
  mockRuntimeConfig({ resendApiKey: 're_test' })
  mockSend()
})

describe('POST /api/reservations', () => {
  it('rejects an invalid booking before touching the database', async () => {
    const from = mockFrom({})

    await expect(
      handler(mockEvent({ method: 'POST', body: { type: 'game' } })),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(from).not.toHaveBeenCalled()
  })

  it('books through the service role', async () => {
    const reservations = mockChain({
      data: {
        id: 1,
        type: 'game',
        name: 'Jef Van Laer',
        email: 'jef@example.com',
        day: '2099-09-14',
        start: '19:00',
        paymentNeeded: false,
        event: null,
      },
      error: null,
    })
    mockFrom({ reservations })

    const body = {
      type: 'game',
      name: 'Jef Van Laer',
      email: 'jef@example.com',
      number: '0496264466',
      spots: 2,
      day: '2099-09-14',
      start: '19:00',
    }

    await expect(handler(mockEvent({ method: 'POST', body }))).resolves.toEqual(
      { status: 'confirmed' },
    )
    expect(reservations.insert).toHaveBeenCalled()
  })
})
