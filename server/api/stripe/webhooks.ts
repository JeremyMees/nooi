import { serverSupabaseClient } from '#supabase/server'
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

function isHandled(webhookEvent: Stripe.Event): webhookEvent is HandledEvent {
  return (HANDLED_TYPES as readonly string[]).includes(webhookEvent.type)
}

export default defineEventHandler(async (event): Promise<any> => {
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

  const client = await serverSupabaseClient<Database>(event)

  try {
    if (!isHandled(webhookEvent)) {
      return `Webhook received but this event is not handled -> ${webhookEvent.type}`
    }

    const id = webhookEvent.data.object.metadata?.reservation

    if (!id) {
      throw createError({ status: 400, message: 'No reservation id found' })
    }

    const reservationId = +id

    if (webhookEvent.type === 'payment_intent.succeeded') {
      const existing = await getReservation(client, reservationId)

      if (existing.paymentIdentifier) {
        return 'Webhook already processed for this reservation'
      }

      await updateReservation(
        client,
        reservationId,
        webhookEvent.data.object.id,
      )
    } else if (webhookEvent.type === 'payment_intent.canceled') {
      await removeReservation(client, reservationId)
    } else {
      try {
        const reservation = await getReservation(client, reservationId)

        if (reservation.paymentNeeded) {
          await removeReservation(client, reservationId)
        }
      } catch (error) {
        return 'Session expired but reservation not found. Ignoring.'
      }
    }
  } catch (err) {
    const { message } = err as Error

    throw createError({ status: 400, message: `Webhook Error: ${message}` })
  }
})

async function getReservation(client: any, id: number): Promise<any> {
  const { error, data } = await client
    .from('reservations')
    .select('*, event(name)')
    .eq('id', id)

  if (error) {
    throw error
  }

  return data?.[0]
}

async function updateReservation(
  client: any,
  id: number,
  payment: string,
): Promise<void> {
  try {
    await client
      .from('reservations')
      .update({
        paymentIdentifier: payment,
        paymentNeeded: false,
      })
      .eq('id', id)

    const reservation = await getReservation(client, id)

    await $fetch('/api/mail/reservation-success', {
      method: 'POST',
      body: {
        to: reservation.email,
        props: {
          name: reservation.name,
          date: formatDateMail(reservation.day),
          time: formatHour(reservation.start),
        },
      },
    })
  } catch (error) {
    const { message } = error as Error

    throw createError({
      status: 400,
      message: `Error updating reservation: ${message}`,
    })
  }
}

async function removeReservation(client: any, id: number): Promise<void> {
  try {
    await client.from('reservations').delete().eq('id', id)
  } catch (error) {
    const { message } = error as Error

    throw createError({
      status: 400,
      message: `Error removing temporary reservation: ${message}`,
    })
  }
}
