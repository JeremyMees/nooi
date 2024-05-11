import Stripe from 'stripe'
import dayjs from 'dayjs'

export function stripePrice (price: number): string {
  if (price === 0) {
    return '0'
  }

  return (price / 100).toFixed(2)
}

export function formatStripeDate (date: number): string {
  return dayjs(new Date(date * 1000)).format('DD/MM/YYYY')
}

export function stripeDatePassed (date: number): boolean {
  return date * 1000 < Date.now()
}
