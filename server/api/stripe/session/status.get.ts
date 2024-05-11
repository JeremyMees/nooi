import Stripe from 'stripe'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event): Promise<Stripe.Checkout.Session> => {
  const stripe = await useServerStripe(event)
  const { id } = getQuery(event)

  return await stripe.checkout.sessions.retrieve(id as string)
})
