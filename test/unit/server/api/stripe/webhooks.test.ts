import { beforeEach, describe, expect, it } from 'vitest'
import { Stripe } from 'stripe'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import { mockFetch } from '~~/test/unit/stubs/fetch'
import handler from '~~/server/api/stripe/webhooks'

const reservation = {
  id: 2599,
  name: 'Jef Van Laer',
  email: 'jef@example.com',
  day: '2026-09-14',
  start: '19:00:00',
  paymentNeeded: true,
  paymentIdentifier: null,
  event: { name: 'Minipainting' },
}

const secret = 'whsec_test'
const { webhooks } = new Stripe('sk_test_placeholder')

function signedEvent(payload: string, signingSecret = secret) {
  return mockEvent({
    method: 'POST',
    body: payload,
    headers: {
      'stripe-signature': webhooks.generateTestHeaderString({
        payload,
        secret: signingSecret,
      }),
    },
  })
}

function stripeEvent(type: string, object: Record<string, unknown> = {}) {
  return signedEvent(
    JSON.stringify({
      type,
      data: {
        object: { id: 'pi_123', metadata: { reservation: '2599' }, ...object },
      },
    }),
  )
}

beforeEach(() => {
  mockRuntimeConfig({ stripeWebhook: secret })
  mockFetch.mockReset()
  mockFetch.mockResolvedValue({ message: 'Email sent' })
})

describe('POST /api/stripe/webhooks', () => {
  it('rejects a request without a signature', async () => {
    const event = mockEvent({
      method: 'POST',
      body: JSON.stringify({ type: 'payment_intent.succeeded' }),
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid signature',
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('rejects a request signed with another secret', async () => {
    const payload = JSON.stringify({ type: 'payment_intent.succeeded' })

    await expect(
      handler(signedEvent(payload, 'whsec_other')),
    ).rejects.toMatchObject({ statusCode: 400, message: 'Invalid signature' })
  })

  it('rejects a payload that was altered after signing', async () => {
    const event = signedEvent(
      JSON.stringify({ type: 'payment_intent.canceled' }),
    )
    ;(event as unknown as { _requestBody: string })._requestBody =
      JSON.stringify({ type: 'payment_intent.succeeded' })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid signature',
    })
  })

  it('ignores event types it does not handle', async () => {
    await expect(handler(stripeEvent('invoice.paid'))).resolves.toBe(
      'Webhook received but this event is not handled -> invoice.paid',
    )
  })

  it('fails when the event carries no reservation id', async () => {
    const event = signedEvent(
      JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: {} },
      }),
    )

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Webhook Error: No reservation id found',
    })
  })

  describe('payment_intent.succeeded', () => {
    it('marks the reservation paid and mails the confirmation', async () => {
      const chain = mockChain({ data: [reservation], error: null })
      mockFrom({ reservations: chain })

      await handler(stripeEvent('payment_intent.succeeded'))

      expect(chain.update).toHaveBeenCalledWith({
        paymentIdentifier: 'pi_123',
        paymentNeeded: false,
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/mail/reservation-success', {
        method: 'POST',
        body: {
          to: 'jef@example.com',
          props: {
            name: 'Jef Van Laer',
            date: 'maandag 14 september 2026',
            time: '19:00',
          },
        },
      })
    })

    it('does nothing when the webhook was already processed', async () => {
      mockFrom({
        reservations: mockChain({
          data: [{ ...reservation, paymentIdentifier: 'pi_123' }],
          error: null,
        }),
      })

      await expect(
        handler(stripeEvent('payment_intent.succeeded')),
      ).resolves.toBe('Webhook already processed for this reservation')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('fails loudly when the confirmation mail cannot be sent', async () => {
      mockFrom({
        reservations: mockChain({ data: [reservation], error: null }),
      })
      mockFetch.mockRejectedValue(new Error('mail down'))

      await expect(
        handler(stripeEvent('payment_intent.succeeded')),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Error updating reservation'),
      })
    })
  })

  describe('payment_intent.canceled', () => {
    it('removes the reservation', async () => {
      const chain = mockChain({ data: [], error: null })
      mockFrom({ reservations: chain })

      await handler(stripeEvent('payment_intent.canceled'))

      expect(chain.delete).toHaveBeenCalled()
      expect(chain.eq).toHaveBeenCalledWith('id', 2599)
    })
  })

  describe('checkout.session.expired', () => {
    it('removes a reservation that was never paid', async () => {
      const chain = mockChain({ data: [reservation], error: null })
      mockFrom({ reservations: chain })

      await handler(stripeEvent('checkout.session.expired'))

      expect(chain.delete).toHaveBeenCalled()
    })

    it('keeps a reservation that was already paid', async () => {
      const chain = mockChain({
        data: [{ ...reservation, paymentNeeded: false }],
        error: null,
      })
      mockFrom({ reservations: chain })

      await handler(stripeEvent('checkout.session.expired'))

      expect(chain.delete).not.toHaveBeenCalled()
    })

    it('ignores an expired session for an unknown reservation', async () => {
      mockFrom({
        reservations: mockChain({ data: null, error: { message: 'gone' } }),
      })

      await expect(
        handler(stripeEvent('checkout.session.expired')),
      ).resolves.toBe('Session expired but reservation not found. Ignoring.')
    })
  })
})
