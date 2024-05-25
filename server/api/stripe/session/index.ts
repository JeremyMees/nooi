import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event): Promise<{ clientSecret: string | null }> => {
  const publicUrl = useRuntimeConfig().url
  const stripe = await useServerStripe(event)
  const { name, amount, quantity, url } = await readBody(event)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    locale: 'nl',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name },
        unit_amount: amount * 100,
      },
      quantity,
    }],
    return_url: `${publicUrl}${url}&session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
  })

  return { clientSecret: session.client_secret }
})
