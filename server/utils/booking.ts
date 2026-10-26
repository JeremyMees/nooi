import type { SupabaseClient } from '@supabase/supabase-js'
import { maxSpots } from '~~/shared/constants/info'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dayPattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^\d{2}:\d{2}(:\d{2})?$/
const numberPattern = /^[0-9]{10,12}$/
const maxGameSpots = 8

type Client = SupabaseClient<Database>

function invalid(message: string): never {
  throw createError({ status: 400, message })
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') invalid(`Invalid ${field}`)

  return value.trim()
}

export function parseBooking(body: unknown): BookingRequest {
  if (!body || typeof body !== 'object') invalid('Invalid booking')

  const input = body as Record<string, unknown>
  const type = input.type

  if (type !== 'event' && type !== 'game' && type !== 'reservation') {
    invalid('Invalid type')
  }

  const name = optionalString(input.name, 'name')
  const email = optionalString(input.email, 'email')
  const number = optionalString(input.number, 'number')
  const info = optionalString(input.info, 'info')
  const day = optionalString(input.day, 'day')
  const start = optionalString(input.start, 'start')
  const end = optionalString(input.end, 'end')
  const spots = Number(input.spots)
  const event = input.event === undefined ? undefined : Number(input.event)

  if (!name || name.length < 5 || name.length > 45) invalid('Invalid name')
  if (!email || email.length > 65 || !emailPattern.test(email)) {
    invalid('Invalid email')
  }
  if (!number || !numberPattern.test(number)) invalid('Invalid number')
  if (info && info.length > 500) invalid('Invalid info')
  if (!Number.isInteger(spots) || spots < 1 || spots > maxSpots) {
    invalid('Invalid spots')
  }

  if (type === 'event') {
    if (!Number.isInteger(event)) invalid('Invalid event')
  } else {
    if (!day || !dayPattern.test(day) || !isValidDateString(day)) {
      invalid('Invalid day')
    }
    if (!start || !timePattern.test(start)) invalid('Invalid start')
    if (end && !timePattern.test(end)) invalid('Invalid end')
    if (type === 'game' && spots > maxGameSpots) invalid('Invalid spots')
  }

  return {
    type,
    event,
    day,
    start,
    end,
    name,
    email,
    number,
    spots,
    exclusive: input.exclusive === true,
    info,
  }
}

export async function createBooking(
  client: Client,
  request: BookingRequest,
): Promise<BookingResult> {
  const { event: eventId, ...contact } = request
  let insert: ReservationInsert
  let event: EventReservation | undefined

  if (request.type === 'event') {
    event = await bookableEvent(client, eventId as number, request.spots)

    insert = {
      ...contact,
      exclusive: false,
      event: event.id,
      day: event.day,
      start: event.start,
      end: event.end,
      paymentNeeded: !!(event.onlinePayment && event.price),
    }
  } else {
    insert = {
      ...contact,
      day: request.day as string,
      start: request.start as string,
      end: request.end ?? null,
      exclusive: request.type === 'reservation' && request.exclusive,
      paymentNeeded: false,
    }
  }

  const { data, error } = await client
    .from('reservations')
    .insert(insert)
    .select('*, event(name)')
    .single()

  if (error || !data) {
    throw createError({
      status: 500,
      message: `Could not create reservation: ${error?.message}`,
    })
  }

  const reservation = data as unknown as ReservationWithEvent

  if (event && reservation.paymentNeeded) {
    try {
      return { status: 'payment', url: await checkoutUrl(reservation, event) }
    } catch (checkoutError) {
      await client.from('reservations').delete().eq('id', reservation.id)

      throw checkoutError
    }
  }

  const { error: mailError } = await sendConfirmation(reservation)

  if (mailError) {
    console.error(
      `Confirmation for reservation ${reservation.id} failed: ${mailError}`,
    )
  }

  return { status: 'confirmed' }
}

async function bookableEvent(
  client: Client,
  id: number,
  spots: number,
): Promise<EventReservation> {
  const { data, error } = await client
    .from('events')
    .select('*, reservations:reservations(id, spots)')
    .eq('id', id)
    .eq('reservations.paymentNeeded', false)
    .maybeSingle()

  if (error) {
    throw createError({
      status: 500,
      message: `Could not fetch event: ${error.message}`,
    })
  }

  if (!data) {
    throw createError({ status: 404, message: 'Event not found' })
  }

  const event = data as EventReservation
  const now = new Date()

  if (
    dateInPast(new Date(event.day)) ||
    (event.bookingDeadline &&
      isAfterDeadline(now, new Date(event.bookingDeadline)))
  ) {
    throw createError({ status: 409, message: 'Event is closed' })
  }

  if (spots < (event.minSpots || 1)) invalid('Invalid spots')

  const reserved = event.reservations.reduce((sum, r) => sum + r.spots, 0)

  if (event.spots && reserved + spots > event.spots) {
    throw createError({ status: 409, message: 'Event is full' })
  }

  return event
}

async function checkoutUrl(
  reservation: ReservationWithEvent,
  event: EventReservation,
): Promise<string> {
  const publicUrl = useRuntimeConfig().url
  const params = publicUrl.includes('?') ? '&' : '?'
  const id = reservation.id.toString()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'nl',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: event.name },
          unit_amount: Math.round((event.price as number) * 100),
        },
        quantity: event.unitPrice ? reservation.spots : 1,
      },
    ],
    success_url: `${publicUrl}${params}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${publicUrl}${params}session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
    metadata: { reservation: id },
    payment_intent_data: {
      metadata: { reservation: id },
    },
  })

  if (!session.url) {
    throw createError({ status: 502, message: 'No session url returned' })
  }

  return session.url
}
