import { Resend } from 'resend'

const from = 'Nooi <zin@nooi.be>'

const confirmations: Record<
  BookingType,
  { template: EmailTemplate; subject: string }
> = {
  event: { template: 'EventSuccess', subject: 'Jouw inschrijving bij Nooi' },
  game: { template: 'BookingSuccess', subject: 'Jouw boeking voor Nooi' },
  reservation: {
    template: 'ReservationSuccess',
    subject: 'Jouw reservatie voor Nooi',
  },
}

export interface MailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  idempotencyKey?: string
}

export async function sendMail({
  idempotencyKey,
  ...message
}: MailOptions): Promise<{ error: string | null }> {
  const resend = new Resend(useRuntimeConfig().resendApiKey)

  const email = { from, ...message }
  const { error } = idempotencyKey
    ? await resend.emails.send(email, { idempotencyKey })
    : await resend.emails.send(email)

  return { error: error ? error.message : null }
}

export async function sendTemplateMail<T extends EmailTemplate>(
  template: T,
  values: EmailValues[T],
  options: Omit<MailOptions, 'html' | 'text'>,
): Promise<{ error: string | null }> {
  try {
    return await sendMail({
      ...options,
      ...(await renderEmail(template, values)),
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendConfirmation(
  reservation: ReservationWithEvent,
): Promise<{ error: string | null }> {
  if (!reservation.email) {
    return { error: 'Reservation has no email address' }
  }

  const { template, subject } = confirmations[reservation.type]

  return sendTemplateMail(template, mailProps(reservation), {
    to: reservation.email,
    subject,
    idempotencyKey: `confirmation/${reservation.id}`,
  })
}
