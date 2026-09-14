import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import { mockSend, send } from '~~/test/unit/stubs/mail'
import handler from '~~/server/api/reminders.get'
import type { H3Event } from 'h3'
import type { ReservationRow } from '~~/shared/types/supabase'

const day = '2026-09-14'

function reservation(overrides: Partial<ReservationRow> = {}) {
  return {
    id: 1,
    created_at: '2026-09-10T09:00:00+00',
    day,
    start: '19:00:00',
    end: '22:00:00',
    email: 'jef@example.com',
    name: 'Jef Van Laer',
    number: '0496264466',
    info: null,
    exclusive: false,
    paymentIdentifier: 'pi_123',
    paymentNeeded: false,
    spots: 1,
    type: 'event',
    event: { name: 'Minipainting' },
    ...overrides,
  }
}

async function run(event: H3Event = mockEvent()) {
  const settled = handler(event).then(
    data => () => data,
    (error: unknown) => () => {
      throw error
    },
  )

  await vi.runAllTimersAsync()

  return (await settled)()
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-14T06:00:00Z'))
  mockRuntimeConfig({ resendApiKey: 're_test' })
  mockSend()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GET /api/reminders', () => {
  describe('authorisation', () => {
    it('rejects a request without the cron secret', async () => {
      mockRuntimeConfig({ resendApiKey: 're_test', cronSecret: 'topsecret' })

      await expect(run()).rejects.toMatchObject({ statusCode: 401 })
      expect(send).not.toHaveBeenCalled()
    })

    it('rejects a request with the wrong cron secret', async () => {
      mockRuntimeConfig({ resendApiKey: 're_test', cronSecret: 'topsecret' })
      const event = mockEvent({ headers: { authorization: 'Bearer nope' } })

      await expect(run(event)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('accepts a request carrying the cron secret', async () => {
      mockRuntimeConfig({ resendApiKey: 're_test', cronSecret: 'topsecret' })
      mockFrom({ reservations: mockChain({ data: [], error: null }) })
      const event = mockEvent({
        headers: { authorization: 'Bearer topsecret' },
      })

      await expect(run(event)).resolves.toMatchObject({ day, total: 0 })
    })

    it('runs unauthenticated when no cron secret is configured', async () => {
      mockFrom({ reservations: mockChain({ data: [], error: null }) })

      await expect(run()).resolves.toMatchObject({ day, total: 0 })
    })
  })

  describe('fetching reservations', () => {
    it('queries confirmed reservations for today in Brussels', async () => {
      const chain = mockChain({ data: [], error: null })
      const from = mockFrom({ reservations: chain })

      await run()

      expect(from).toHaveBeenCalledWith('reservations')
      expect(chain.select).toHaveBeenCalledWith('*, event(name)')
      expect(chain.eq).toHaveBeenCalledWith('day', day)
      expect(chain.eq).toHaveBeenCalledWith('paymentNeeded', false)
    })

    it('throws when the query fails', async () => {
      mockFrom({
        reservations: mockChain({ data: null, error: { message: 'boom' } }),
      })

      await expect(run()).rejects.toMatchObject({
        statusCode: 500,
        message: `Could not fetch reservations for ${day}: boom`,
      })
    })
  })

  describe('sending reminders', () => {
    it('sends one reminder per reservation with an idempotency key', async () => {
      mockFrom({
        reservations: mockChain({ data: [reservation()], error: null }),
      })

      const result = await run()

      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Nooi <zin@nooi.be>',
          to: 'jef@example.com',
          subject: 'We zien je snel in Nooi!',
        }),
        { idempotencyKey: 'reminder/1' },
      )
      expect(result.sent).toEqual([
        { id: 1, name: 'Jef Van Laer', email: 'jef@example.com' },
      ])
    })

    it('waits between sends so Resend is not rate limited', async () => {
      mockFrom({
        reservations: mockChain({
          data: [reservation({ id: 1 }), reservation({ id: 2 })],
          error: null,
        }),
      })

      const settled = handler(mockEvent()).catch(() => undefined)

      await vi.advanceTimersByTimeAsync(0)
      expect(send).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(600)
      expect(send).toHaveBeenCalledTimes(2)

      await settled
    })

    it('skips reservations without a usable email address', async () => {
      mockFrom({
        reservations: mockChain({
          data: [reservation({ id: 2, email: null })],
          error: null,
        }),
      })

      const result = await run()

      expect(send).not.toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'We zien je snel in Nooi!' }),
        expect.anything(),
      )
      expect(result.skipped).toEqual([
        { id: 2, name: 'Jef Van Laer', email: '' },
      ])
      expect(result.total).toBe(1)
    })

    it('records the reason when a send fails and surfaces a 500', async () => {
      mockFrom({
        reservations: mockChain({ data: [reservation()], error: null }),
      })
      mockSend({ error: { message: 'rate_limit_exceeded' } }, {})

      await expect(run()).rejects.toMatchObject({
        statusCode: 500,
        data: expect.objectContaining({
          failed: [
            {
              id: 1,
              name: 'Jef Van Laer',
              email: 'jef@example.com',
              reason: 'rate_limit_exceeded',
            },
          ],
        }),
      })
    })

    it('keeps sending after one reservation fails', async () => {
      mockFrom({
        reservations: mockChain({
          data: [reservation({ id: 1 }), reservation({ id: 2 })],
          error: null,
        }),
      })
      mockSend({ error: { message: 'bounced' } }, {}, {})

      await expect(run()).rejects.toMatchObject({
        data: expect.objectContaining({
          sent: [expect.objectContaining({ id: 2 })],
          failed: [expect.objectContaining({ id: 1, reason: 'bounced' })],
        }),
      })
    })
  })

  describe('daily report', () => {
    it('mails the report to every configured address', async () => {
      mockRuntimeConfig({
        resendApiKey: 're_test',
        reminderEmails: 'a@nooi.be, b@nooi.be',
      })
      mockFrom({
        reservations: mockChain({ data: [reservation()], error: null }),
      })

      await run()

      expect(send).toHaveBeenLastCalledWith(
        expect.objectContaining({
          to: ['a@nooi.be', 'b@nooi.be'],
          subject:
            'Herinneringen maandag 14 september 2026: 1 verstuurd, 0 mislukt',
        }),
        { idempotencyKey: 'reminder-report/2026-09-14-1-0-0' },
      )
    })

    it('still reports on a day without reservations', async () => {
      mockRuntimeConfig({
        resendApiKey: 're_test',
        reminderEmails: 'a@nooi.be',
      })
      mockFrom({ reservations: mockChain({ data: [], error: null }) })

      const result = await run()

      expect(send).toHaveBeenCalledTimes(1)
      expect(result).toMatchObject({ total: 0, sent: [], reportError: null })
    })

    it('skips the report when no addresses are configured', async () => {
      mockFrom({ reservations: mockChain({ data: [], error: null }) })

      const result = await run()

      expect(send).not.toHaveBeenCalled()
      expect(result.reportError).toBeNull()
    })

    it('surfaces a 500 when the report itself fails', async () => {
      mockRuntimeConfig({
        resendApiKey: 're_test',
        reminderEmails: 'a@nooi.be',
      })
      mockFrom({ reservations: mockChain({ data: [], error: null }) })
      mockSend({ error: { message: 'report failed' } })

      await expect(run()).rejects.toMatchObject({
        statusCode: 500,
        data: expect.objectContaining({ reportError: 'report failed' }),
      })
    })
  })
})
