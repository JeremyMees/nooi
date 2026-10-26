import { Stripe } from 'stripe'

export const stripe = new Stripe(useRuntimeConfig().stripeSk, {
  apiVersion: '2026-09-30.endive',
  typescript: true,
})
