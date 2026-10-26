import { beforeEach, describe, expect, it } from 'vitest'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockSend, send } from '~~/test/unit/stubs/mail'
import { sendConfirmation } from '~~/server/utils/mail'
import type { ReservationWithEvent } from '~~/shared/types/supabase'

function reservation(
  overrides: Partial<ReservationWithEvent> = {},
): ReservationWithEvent {
  return {
    id: 7,
    created_at: '2026-09-10T09:00:00+00',
    day: '2026-09-14',
    start: '19:00:00',
    end: null,
    email: 'jef@example.com',
    name: 'Jef Van Laer',
    number: null,
    info: null,
    exclusive: false,
    paymentIdentifier: null,
    paymentNeeded: false,
    spots: 2,
    type: 'reservation',
    event: null,
    ...overrides,
  }
}

beforeEach(() => {
  mockRuntimeConfig({ resendApiKey: 're_test' })
  mockSend()
})

describe('sendConfirmation', () => {
  it.each([
    ['event', 'Jouw inschrijving bij Nooi'],
    ['game', 'Jouw boeking voor Nooi'],
    ['reservation', 'Jouw reservatie voor Nooi'],
  ] as const)('mails a %s confirmation', async (type, subject) => {
    await expect(sendConfirmation(reservation({ type }))).resolves.toEqual({
      error: null,
    })

    expect(send).toHaveBeenCalledWith(
      {
        from: 'Nooi <zin@nooi.be>',
        to: 'jef@example.com',
        subject,
        html: '<html>rendered</html>',
      },
      { idempotencyKey: 'confirmation/7' },
    )
  })

  it('reports a reservation without an email address', async () => {
    await expect(
      sendConfirmation(reservation({ email: null })),
    ).resolves.toEqual({ error: 'Reservation has no email address' })
    expect(send).not.toHaveBeenCalled()
  })

  it('passes on the error Resend reports', async () => {
    mockSend({ error: { message: 'suppressed recipient' } })

    await expect(sendConfirmation(reservation())).resolves.toEqual({
      error: 'suppressed recipient',
    })
  })
})
