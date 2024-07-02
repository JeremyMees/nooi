import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event): Promise<string> => {
  const publicUrl = useRuntimeConfig().url
  const stripe = await useServerStripe(event)
  const { name, amount, quantity, url } = await readBody(event)

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
    success_url: `${publicUrl}${url}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicUrl}${url}&session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
  })

  if (!session.url) {
    throw createError({
      status: 500,
      message: 'No session url returned',
    })
  }

  return session.url
})
