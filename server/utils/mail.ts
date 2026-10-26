import { Resend } from 'resend'
import { render } from '@vue-email/render'
import type { Component } from 'vue'
import BookingSuccess from '~~/emails/BookingSuccess.vue'
import EventSuccess from '~~/emails/EventSuccess.vue'
import ReservationSuccess from '~~/emails/ReservationSuccess.vue'

const from = 'Nooi <zin@nooi.be>'

const confirmations: Record<
  BookingType,
  { template: Component; subject: string }
> = {
  event: { template: EventSuccess, subject: 'Jouw inschrijving bij Nooi' },
  game: { template: BookingSuccess, subject: 'Jouw boeking voor Nooi' },
  reservation: {
    template: ReservationSuccess,
    subject: 'Jouw reservatie voor Nooi',
  },
}

export interface MailOptions {
  to: string | string[]
  subject: string
  template: Component
  props: object
  idempotencyKey?: string
}

export async function sendMail({
  template,
  props,
  idempotencyKey,
  ...message
}: MailOptions): Promise<{ error: string | null }> {
  const resend = new Resend(useRuntimeConfig().resendApiKey)
  const html = await render(template, props)

  const email = { from, ...message, html }
  const { error } = idempotencyKey
    ? await resend.emails.send(email, { idempotencyKey })
    : await resend.emails.send(email)

  return { error: error ? error.message : null }
}

// Keyed on the reservation, so a retried webhook never mails the same
// confirmation twice.
export async function sendConfirmation(
  reservation: ReservationWithEvent,
): Promise<{ error: string | null }> {
  if (!reservation.email) {
    return { error: 'Reservation has no email address' }
  }

  const { template, subject } = confirmations[reservation.type]

  return sendMail({
    to: reservation.email,
    subject,
    template,
    props: mailProps(reservation),
    idempotencyKey: `confirmation/${reservation.id}`,
  })
}
