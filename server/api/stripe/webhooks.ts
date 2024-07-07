import { serverSupabaseClient } from '#supabase/server'
// import { useServerStripe } from '#stripe/server'
import type { Database } from '~/types/database'
import { formatDateMail, formatHour } from '~/utils/date-helpers'

export default defineEventHandler(async (event): Promise<any> => {
  const client = await serverSupabaseClient<Database>(event)
  // const config = useRuntimeConfig()
  // const stripe = await useServerStripe(event)
  const body = await readBody(event)
  // const raw = await readRawBody(event) as string
  // const signature = event.headers.get('stripe-signature') || ''

  try {
    // const webhookSecret = config.stripeWebhook
    // const webhookEvent = stripe.webhooks.constructEvent(raw, signature, webhookSecret)

    if (
      ![
        'payment_intent.succeeded',
        'payment_intent.canceled',
        'checkout.session.expired',
      ].includes(body.type)
    ) {
      return `Webhook received but this event is not handled -> ${body.type}`
    }

    let reservationId

    if ('metadata' in body.data.object && body.data.object.metadata?.reservation) {
      reservationId = +body.data.object.metadata.reservation
    }
    else {
      throw createError({ status: 400, message: 'No reservation id found' })
    }

    if (body.type === 'payment_intent.succeeded') {
      await updateReservation(
        client,
        reservationId,
        body.data.object.id,
      )
    }
    else if (body.type === 'payment_intent.canceled') {
      await removeReservation(
        client,
        reservationId,
      )
    }
    else {
      try {
        const reservation = await getReservation(client, reservationId)

        if (reservation.paymentNeeded) {
          await removeReservation(
            client,
            reservationId,
          )
        }
      }
      catch (error) {
        return 'Session expired but reservation not found. Ignoring.'
      }
    }
  }
  catch (err) {
    const { message } = err as Error

    throw createError({ status: 400, message: `Webhook Error: ${message}` })
  }
})

async function getReservation(client: any, id: number): Promise<any> {
  const { error, data } = await client
    .from('reservations')
    .select('*')
    .eq('id', id)

  if (error) {
    throw error
  }

  return data?.[0]
}

async function updateReservation(client: any, id: number, payment: string): Promise<void> {
  try {
    await client
      .from('reservations')
      .update({
        paymentIdentifier: payment,
        paymentNeeded: false,
      })
      .eq('id', id)

    const reservation = await getReservation(client, id)

    await $fetch('/api/mail', {
      method: 'POST',
      body: {
        from: 'Nooi <zin@nooi.be>',
        to: reservation.email,
        subject: 'Jouw reservatie voor Nooi',
        template: 'ReservationSuccess.vue',
        props: {
          name: reservation.name,
          date: formatDateMail(reservation.day),
          time: formatHour(reservation.start),

        },
      },
    })
  }
  catch (error) {
    const { message } = error as Error

    throw createError({
      status: 400,
      message: `Error updating reservation: ${message}`,
    })
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
    const { message } = error as Error

    throw createError({
      status: 400,
      message: `Error removing temporary reservation: ${message}`,
    })
  }
}
