import { serverSupabaseClient } from '#supabase/server'
import { useServerStripe } from '#stripe/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event): Promise<any> => {
  const client = await serverSupabaseClient<Database>(event)
  const webhookSecret = useRuntimeConfig().stripeWebhook
  const stripe = await useServerStripe(event)
  const raw = await readRawBody(event) as string
  const signature = event.headers.get('stripe-signature') || ''

  try {
    const webhookEvent = stripe.webhooks.constructEvent(raw, signature, webhookSecret)

    if (
      ![
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'checkout.session.expired',
      ].includes(webhookEvent.type)
    ) {
      return `Webhook received but this event is not handled -> ${webhookEvent.type}`
    }

    let reservationId

    if ('metadata' in webhookEvent.data.object && webhookEvent.data.object.metadata?.reservation) {
      reservationId = +webhookEvent.data.object.metadata.reservation
    }
    else {
      throw createError({ status: 400, message: 'No reservation id found' })
    }

    if (webhookEvent.type === 'payment_intent.succeeded') {
      await updateReservation(
        client,
        reservationId,
        webhookEvent.data.object.id,
      )
    }
    else {
      await removeReservation(
        client,
        reservationId,
      )
    }
  }
  catch (err) {
    const { message } = err as Error

    throw createError({ status: 400, message: `Webhook Error: ${message}` })
  }
})

async function updateReservation(client: any, id: number, payment: string): Promise<void> {
  try {
    await client
      .from('reservations')
      .update({
        paymentIdentifier: payment,
        paymentNeeded: false,
      })
      .eq('id', id)
  }
  catch (error) {
    throw createError({ status: 400, message: 'Error updating reservation' })
  }
}

async function removeReservation(client: any, id: number): Promise<void> {
  try {
    await client
      .from('reservations')
      .delete()
      .eq('id', id)
  }
  catch (error) {
    throw createError({ status: 400, message: 'Error removing temporary reservation' })
  }
}
