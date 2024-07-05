import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event): Promise<string> => {
  const publicUrl = useRuntimeConfig().url
  const stripe = await useServerStripe(event)
  const { name, amount, quantity, reservation } = await readBody(event)

  if (!reservation) {
    throw createError({
      status: 400,
      message: 'No reservation id provided',
    })
  }

  const id = reservation.toString()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'nl',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name },
        unit_amount: amount * 100,
      },
      quantity,
    }],
    success_url: `${publicUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicUrl}?session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
    metadata: { reservation: id },
    payment_intent_data: {
      metadata: { reservation: id },
    },
  })

  if (!session.url) {
    throw createError({
      status: 400,
      message: 'No session url returned',
    })
  }

  return session.url
})
