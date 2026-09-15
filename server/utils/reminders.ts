import { addDay } from '@formkit/tempo'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ReminderProps {
  name: string
  date: string
  time: string
  event?: string
}

export interface SplitReminders {
  recipients: ReservationWithEvent[]
  skipped: ReservationWithEvent[]
}

export function brusselsDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels',
  }).format(date)
}

export function reminderDay(date: Date): string {
  return brusselsDay(addDay(date, 1))
}

export function splitReminders(
  reservations: ReservationWithEvent[],
): SplitReminders {
  const recipients: ReservationWithEvent[] = []
  const skipped: ReservationWithEvent[] = []

  for (const reservation of reservations) {
    if (reservation.email && emailPattern.test(reservation.email)) {
      recipients.push(reservation)
    } else {
      skipped.push(reservation)
    }
  }

  return { recipients, skipped }
}

export function reminderProps(
  reservation: ReservationWithEvent,
): ReminderProps {
  return {
    name: reservation.name,
    date: formatDateMail(reservation.day),
    time: formatHour(reservation.start),
    event: reservation.event?.name ?? undefined,
  }
}

export function reminderOutcome(
  reservation: ReservationWithEvent,
  reason?: string,
): ReminderOutcome {
  return {
    id: reservation.id,
    name: reservation.name,
    email: reservation.email ?? '',
    ...(reason ? { reason } : {}),
  }
}

export function reportRecipients(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map(email => email.trim())
    .filter(email => emailPattern.test(email))
}

export function reportSubject(report: ReminderReport): string {
  return `Herinneringen ${report.date}: ${report.sent.length} verstuurd, ${report.failed.length} mislukt`
}

// Folding the counts into the key means an identical re-run is deduplicated by
// Resend, while a run with different results still gets its own report.
export function reportKey(day: string, report: ReminderReport): string {
  const { sent, failed, skipped } = report

  return `reminder-report/${day}-${sent.length}-${failed.length}-${skipped.length}`
}
