import type Stripe from 'stripe'

export default defineEventHandler(async (event): Promise<Stripe.Checkout.Session> => {
  const { id } = getQuery(event)

  return await stripe.checkout.sessions.retrieve(id as string)
})
