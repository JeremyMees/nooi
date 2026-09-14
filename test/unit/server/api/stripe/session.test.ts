import { beforeEach, describe, expect, it } from 'vitest'
import { mockEvent } from '~~/test/unit/stubs/api-event'
import { mockRuntimeConfig } from '~~/test/unit/stubs/runtime-config'
import { createSession } from '~~/test/unit/stubs/stripe'
import handler from '~~/server/api/stripe/session'

const body = {
  name: 'Minipainting',
  amount: 12.5,
  quantity: 2,
  reservation: 2599,
}

beforeEach(() => {
  mockRuntimeConfig({ url: 'https://kalendar.nooi.be' })
  createSession.mockReset()
  createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs' })
})

describe('POST /api/stripe/session', () => {
  it('creates a checkout session and returns its url', async () => {
    await expect(handler(mockEvent({ method: 'POST', body }))).resolves.toBe(
      'https://checkout.stripe.com/pay/cs',
    )

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        locale: 'nl',
        metadata: { reservation: '2599' },
        payment_intent_data: { metadata: { reservation: '2599' } },
      }),
    )
  })

  it('converts the amount to cents', async () => {
    await handler(mockEvent({ method: 'POST', body }))

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
      }),
    )
  })

  it('appends the session id to a url without a query string', async () => {
    await handler(mockEvent({ method: 'POST', body }))

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          'https://kalendar.nooi.be?session_id={CHECKOUT_SESSION_ID}',
      }),
    )
  })

  it('appends the session id to a url that already has a query string', async () => {
    mockRuntimeConfig({ url: 'https://kalendar.nooi.be?type=game' })

    await handler(mockEvent({ method: 'POST', body }))

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          'https://kalendar.nooi.be?type=game&session_id={CHECKOUT_SESSION_ID}',
      }),
    )
  })

  it('throws when no reservation id is given', async () => {
    const event = mockEvent({
      method: 'POST',
      body: { ...body, reservation: undefined },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: 'No reservation id provided',
    })
    expect(createSession).not.toHaveBeenCalled()
  })

  it('throws when Stripe returns a session without a url', async () => {
    createSession.mockResolvedValue({ url: null })

    await expect(
      handler(mockEvent({ method: 'POST', body })),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'No session url returned',
    })
  })
})
