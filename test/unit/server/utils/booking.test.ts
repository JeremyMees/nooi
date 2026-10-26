import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import {
  mockChain,
  mockFrom,
  serverSupabaseServiceRole,
} from '~~/test/unit/stubs/supabase'
import { mockSend, send } from '~~/test/unit/stubs/mail'
import { createSession } from '~~/test/unit/stubs/stripe'
import { createBooking, parseBooking } from '~~/server/utils/booking'

const contact = {
  name: 'Jef Van Laer',
  email: 'jef@example.com',
  number: '0496264466',
  spots: 2,
}

const event = {
  id: 9,
  name: 'Minipainting',
  day: '2026-09-14',
  start: '19:00:00',
  end: '22:00:00',
  bookingDeadline: '2026-09-12',
  minSpots: 1,
  spots: 10,
  price: 12.5,
  onlinePayment: true,
  unitPrice: true,
  reservations: [{ id: 1, spots: 3 }],
}

function reservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 2599,
    ...contact,
    type: 'event',
    day: event.day,
    start: event.start,
    paymentNeeded: true,
    event: { name: event.name },
    ...overrides,
  }
}

function client() {
  return serverSupabaseServiceRole() as never
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-01T10:00:00Z'))
  mockRuntimeConfig({ url: 'https://kalendar.nooi.be', resendApiKey: 're' })
  mockSend()
  createSession.mockReset()
  createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/cs' })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('parseBooking', () => {
  const game = {
    ...contact,
    type: 'game',
    day: '2026-09-14',
    start: '19:00',
  }

  it('accepts a valid table booking', () => {
    expect(parseBooking({ ...game, spots: '2' })).toEqual({
      ...game,
      type: 'game',
      spots: 2,
      exclusive: false,
      event: undefined,
      end: undefined,
      info: undefined,
    })
  })

  it('ignores fields a visitor must not set', () => {
    const parsed = parseBooking({
      ...game,
      paymentNeeded: false,
      paymentIdentifier: 'pi_fake',
      price: 0,
    })

    expect(parsed).not.toHaveProperty('paymentNeeded')
    expect(parsed).not.toHaveProperty('paymentIdentifier')
    expect(parsed).not.toHaveProperty('price')
  })

  it.each([
    ['an unknown type', { type: 'vip' }],
    ['a short name', { name: 'Jef' }],
    ['a broken email', { email: 'jef@' }],
    ['a phone number with letters', { number: '04962644ab' }],
    ['zero spots', { spots: 0 }],
    ['fractional spots', { spots: 1.5 }],
    ['too many spots for a table', { spots: 9 }],
    ['a day in the past', { day: '2026-01-01' }],
    ['a malformed day', { day: '14-09-2026' }],
    ['a malformed start', { start: '7pm' }],
    ['too much info', { info: 'x'.repeat(501) }],
  ])('rejects %s', (_label, override) => {
    expect(() => parseBooking({ ...game, ...override })).toThrow(
      expect.objectContaining({ statusCode: 400 }),
    )
  })

  it('requires an event id for an event booking', () => {
    expect(() => parseBooking({ ...contact, type: 'event' })).toThrow(
      'Invalid event',
    )
  })

  it('rejects a body that is not an object', () => {
    expect(() => parseBooking(null)).toThrow('Invalid booking')
  })
})

describe('createBooking', () => {
  describe('for an event', () => {
    const request = {
      ...contact,
      type: 'event' as const,
      event: 9,
      exclusive: true,
    }

    it('takes timing and payment from the event, not the request', async () => {
      const reservations = mockChain({ data: reservation(), error: null })
      mockFrom({
        events: mockChain({ data: event, error: null }),
        reservations,
      })

      await createBooking(client(), request)

      expect(reservations.insert).toHaveBeenCalledWith({
        ...contact,
        type: 'event',
        exclusive: false,
        info: undefined,
        day: '2026-09-14',
        start: '19:00:00',
        end: '22:00:00',
        event: 9,
        paymentNeeded: true,
      })
    })

    it('charges the event price per person', async () => {
      mockFrom({
        events: mockChain({ data: event, error: null }),
        reservations: mockChain({ data: reservation(), error: null }),
      })

      await expect(createBooking(client(), request)).resolves.toEqual({
        status: 'payment',
        url: 'https://checkout.stripe.com/cs',
      })

      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: { name: 'Minipainting' },
                unit_amount: 1250,
              },
              quantity: 2,
            },
          ],
          metadata: { reservation: '2599' },
        }),
      )
      expect(send).not.toHaveBeenCalled()
    })

    it('charges once for an event without a unit price', async () => {
      mockFrom({
        events: mockChain({
          data: { ...event, unitPrice: false },
          error: null,
        }),
        reservations: mockChain({ data: reservation(), error: null }),
      })

      await createBooking(client(), request)

      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [expect.objectContaining({ quantity: 1 })],
        }),
      )
    })

    it('confirms a free event straight away', async () => {
      mockFrom({
        events: mockChain({
          data: { ...event, onlinePayment: false },
          error: null,
        }),
        reservations: mockChain({
          data: reservation({ paymentNeeded: false }),
          error: null,
        }),
      })

      await expect(createBooking(client(), request)).resolves.toEqual({
        status: 'confirmed',
      })
      expect(createSession).not.toHaveBeenCalled()
      expect(send).toHaveBeenCalledTimes(1)
    })

    it('removes the reservation when the checkout cannot be created', async () => {
      const insert = mockChain({ data: reservation(), error: null })
      const remove = mockChain({ data: null, error: null })
      mockFrom({
        events: mockChain({ data: event, error: null }),
        reservations: [insert, remove],
      })
      createSession.mockRejectedValue(new Error('stripe down'))

      await expect(createBooking(client(), request)).rejects.toThrow(
        'stripe down',
      )
      expect(remove.delete).toHaveBeenCalled()
      expect(remove.eq).toHaveBeenCalledWith('id', 2599)
    })

    it('refuses an unknown event', async () => {
      mockFrom({ events: mockChain({ data: null, error: null }) })

      await expect(createBooking(client(), request)).rejects.toMatchObject({
        statusCode: 404,
      })
    })

    it('refuses more spots than are left', async () => {
      const reservations = mockChain({ data: reservation(), error: null })
      mockFrom({
        events: mockChain({ data: { ...event, spots: 4 }, error: null }),
        reservations,
      })

      await expect(createBooking(client(), request)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Event is full',
      })
      expect(reservations.insert).not.toHaveBeenCalled()
    })

    it('refuses fewer spots than the event minimum', async () => {
      mockFrom({
        events: mockChain({ data: { ...event, minSpots: 4 }, error: null }),
      })

      await expect(createBooking(client(), request)).rejects.toMatchObject({
        statusCode: 400,
      })
    })

    it('refuses a booking after the deadline', async () => {
      vi.setSystemTime(new Date('2026-09-13T10:00:00Z'))
      mockFrom({ events: mockChain({ data: event, error: null }) })

      await expect(createBooking(client(), request)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Event is closed',
      })
    })
  })

  describe('for a table or room', () => {
    const request = {
      ...contact,
      type: 'reservation' as const,
      day: '2026-09-14',
      start: '19:00',
      end: '21:00',
      exclusive: true,
    }

    it('never asks for payment and mails a confirmation', async () => {
      const reservations = mockChain({
        data: reservation({ type: 'reservation', paymentNeeded: false }),
        error: null,
      })
      mockFrom({ reservations })

      await expect(createBooking(client(), request)).resolves.toEqual({
        status: 'confirmed',
      })
      expect(reservations.insert).toHaveBeenCalledWith(
        expect.objectContaining({ paymentNeeded: false, exclusive: true }),
      )
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Jouw reservatie voor Nooi' }),
        { idempotencyKey: 'confirmation/2599' },
      )
    })

    it('only lets a room reservation be exclusive', async () => {
      const reservations = mockChain({
        data: reservation({ type: 'game', paymentNeeded: false }),
        error: null,
      })
      mockFrom({ reservations })

      await createBooking(client(), { ...request, type: 'game' })

      expect(reservations.insert).toHaveBeenCalledWith(
        expect.objectContaining({ exclusive: false }),
      )
    })

    it('still confirms the booking when the mail fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFrom({
        reservations: mockChain({
          data: reservation({ type: 'reservation', paymentNeeded: false }),
          error: null,
        }),
      })
      mockSend({ error: { message: 'mail down' } })

      await expect(createBooking(client(), request)).resolves.toEqual({
        status: 'confirmed',
      })
      expect(console.error).toHaveBeenCalled()
    })

    it('surfaces a 500 when the insert fails', async () => {
      mockFrom({
        reservations: mockChain({ data: null, error: { message: 'boom' } }),
      })

      await expect(createBooking(client(), request)).rejects.toMatchObject({
        statusCode: 500,
        message: 'Could not create reservation: boom',
      })
    })
  })
})
