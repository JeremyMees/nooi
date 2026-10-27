import { beforeEach, describe, expect, it } from 'vitest'
import { Stripe } from 'stripe'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { mockChain, mockFrom } from '~~/test/unit/stubs/supabase'
import { mockSend, send } from '~~/test/unit/stubs/mail'
import handler from '~~/server/api/stripe/webhooks'

const reservation = {
  id: 2599,
  name: 'Jef Van Laer',
  email: 'jef@example.com',
  day: '2026-09-14',
  start: '19:00:00',
  paymentNeeded: true,
  paymentIdentifier: null,
  type: 'event',
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
  mockRuntimeConfig({ stripeWebhook: secret, resendApiKey: 're_test' })
  mockSend()
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
    expect(send).not.toHaveBeenCalled()
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
      message: 'No reservation id found',
    })
  })

  it('ignores a reservation that no longer exists', async () => {
    mockFrom({ reservations: mockChain({ data: null, error: null }) })

    await expect(
      handler(stripeEvent('payment_intent.succeeded')),
    ).resolves.toBe('Reservation not found. Ignoring.')
    expect(send).not.toHaveBeenCalled()
  })

  it('surfaces a 500 when the reservation cannot be fetched', async () => {
    mockFrom({
      reservations: mockChain({ data: null, error: { message: 'db down' } }),
    })

    await expect(
      handler(stripeEvent('payment_intent.succeeded')),
    ).rejects.toMatchObject({
      statusCode: 500,
      message: 'Could not fetch reservation: db down',
    })
  })

  describe('payment_intent.succeeded', () => {
    it('marks the reservation paid and mails the confirmation', async () => {
      const chain = mockChain({ data: reservation, error: null })
      mockFrom({ reservations: chain })

      await expect(
        handler(stripeEvent('payment_intent.succeeded')),
      ).resolves.toBe('Reservation paid')

      expect(chain.update).toHaveBeenCalledWith({
        paymentIdentifier: 'pi_123',
        paymentNeeded: false,
      })
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'jef@example.com',
          subject: 'Jouw inschrijving bij Nooi',
          html: '<p>Jef Van Laer|maandag 14 september 2026|19:00|Minipainting</p>',
        }),
        { idempotencyKey: 'confirmation/2599' },
      )
    })

    it('only resends the confirmation when the payment was already recorded', async () => {
      const chain = mockChain({
        data: { ...reservation, paymentIdentifier: 'pi_123' },
        error: null,
      })
      mockFrom({ reservations: chain })

      await handler(stripeEvent('payment_intent.succeeded'))

      expect(chain.update).not.toHaveBeenCalled()
      expect(send).toHaveBeenCalledWith(expect.anything(), {
        idempotencyKey: 'confirmation/2599',
      })
    })

    it('surfaces a 500 so Stripe retries when the mail fails', async () => {
      mockFrom({
        reservations: mockChain({ data: reservation, error: null }),
      })
      mockSend({ error: { message: 'mail down' } })

      await expect(
        handler(stripeEvent('payment_intent.succeeded')),
      ).rejects.toMatchObject({
        statusCode: 500,
        message: 'Could not send confirmation: mail down',
      })
    })
  })

  describe.each(['payment_intent.canceled', 'checkout.session.expired'])(
    '%s',
    type => {
      it('removes a reservation that was never paid', async () => {
        const chain = mockChain({ data: reservation, error: null })
        mockFrom({ reservations: chain })

        await expect(handler(stripeEvent(type))).resolves.toBe(
          'Unpaid reservation removed',
        )
        expect(chain.delete).toHaveBeenCalled()
        expect(chain.eq).toHaveBeenCalledWith('id', 2599)
      })

      it('keeps a reservation that was already paid', async () => {
        const chain = mockChain({
          data: { ...reservation, paymentNeeded: false },
          error: null,
        })
        mockFrom({ reservations: chain })

        await expect(handler(stripeEvent(type))).resolves.toBe(
          'Reservation already paid. Ignoring.',
        )
        expect(chain.delete).not.toHaveBeenCalled()
      })
    },
  )
})
