import type { SupabaseClient } from '@supabase/supabase-js'
import type { Stripe } from 'stripe'

const HANDLED_TYPES = [
  'payment_intent.succeeded',
  'payment_intent.canceled',
  'checkout.session.expired',
] as const

type HandledEvent = Extract<
  Stripe.Event,
  { type: (typeof HANDLED_TYPES)[number] }
>

type Client = SupabaseClient<Database>

function isHandled(webhookEvent: Stripe.Event): webhookEvent is HandledEvent {
  return (HANDLED_TYPES as readonly string[]).includes(webhookEvent.type)
}

export default defineEventHandler(async (event): Promise<string> => {
  const raw = (await readRawBody(event)) as string
  const signature = getHeader(event, 'stripe-signature') || ''

  let webhookEvent: Stripe.Event

  try {
    webhookEvent = stripe.webhooks.constructEvent(
      raw,
      signature,
      useRuntimeConfig().stripeWebhook,
    )
  } catch {
    throw createError({ status: 400, message: 'Invalid signature' })
  }

  if (!isHandled(webhookEvent)) {
    return `Webhook received but this event is not handled -> ${webhookEvent.type}`
  }

  const id = Number(webhookEvent.data.object.metadata?.reservation)

  if (!Number.isInteger(id)) {
    throw createError({ status: 400, message: 'No reservation id found' })
  }

  const client = serviceClient()
  const reservation = await getReservation(client, id)

  if (!reservation) {
    return 'Reservation not found. Ignoring.'
  }

  if (webhookEvent.type === 'payment_intent.succeeded') {
    if (!reservation.paymentIdentifier) {
      await markPaid(client, id, webhookEvent.data.object.id)
    }
    const { error } = await sendConfirmation(reservation)

    if (error) {
      throw createError({
        status: 500,
        message: `Could not send confirmation: ${error}`,
      })
    }

    return 'Reservation paid'
  }

  if (!reservation.paymentNeeded) {
    return 'Reservation already paid. Ignoring.'
  }

  await removeReservation(client, id)

  return 'Unpaid reservation removed'
})

async function getReservation(
  client: Client,
  id: number,
): Promise<ReservationWithEvent | null> {
  const { error, data } = await client
    .from('reservations')
    .select('*, event(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({
      status: 500,
      message: `Could not fetch reservation: ${error.message}`,
    })
  }

  return data as ReservationWithEvent | null
}

async function markPaid(
  client: Client,
  id: number,
  payment: string,
): Promise<void> {
  const { error } = await client
    .from('reservations')
    .update({ paymentIdentifier: payment, paymentNeeded: false })
    .eq('id', id)

  if (error) {
    throw createError({
      status: 500,
      message: `Could not update reservation: ${error.message}`,
    })
  }
}

async function removeReservation(client: Client, id: number): Promise<void> {
  const { error } = await client.from('reservations').delete().eq('id', id)

  if (error) {
    throw createError({
      status: 500,
      message: `Could not remove reservation: ${error.message}`,
    })
  }
}
