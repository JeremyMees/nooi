const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export function mailProps(reservation: ReservationWithEvent): MailProps {
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

const itemStyle = 'margin: 16px 0; font-size: 14px; line-height: 24px;'
const highlightStyle = 'color: #305445;'

function reportList(
  items: ReminderOutcome[],
  line: (item: ReminderOutcome) => { html: string; text: string },
): RawEmailValue {
  const lines = items.map(line)

  return {
    html: lines
      .map(({ html }) => `<p style="${itemStyle}">${html}</p>`)
      .join(''),
    text: lines.map(({ text }) => text).join('\n\n'),
  }
}

export function reportValues(report: ReminderReport): ReportValues {
  const { date, total, sent, failed, skipped } = report

  return {
    date,
    total: String(total),
    sentCount: String(sent.length),
    failedCount: String(failed.length),
    skippedCount: String(skipped.length),
    nothingToDo: total ? undefined : 'ja',
    failedList: reportList(failed, ({ id, name, email, reason }) => ({
      html: `${escapeHTML(name)} &middot; ${escapeHTML(email)} &middot; #${id}<br><span style="${highlightStyle}">${escapeHTML(reason ?? '')}</span>`,
      text: `${name} · ${email} · #${id}\n${reason ?? ''}`,
    })),
    skippedList: reportList(skipped, ({ id, name, email }) => ({
      html: `${escapeHTML(name)} &middot; #${id}${email ? ` &middot; <span style="${highlightStyle}">${escapeHTML(email)}</span>` : ''}`,
      text: `${name} · #${id}${email ? ` · ${email}` : ''}`,
    })),
    sentList: reportList(sent, ({ id, name, email }) => ({
      html: `${escapeHTML(name)} &middot; ${escapeHTML(email)} &middot; #${id}`,
      text: `${name} · ${email} · #${id}`,
    })),
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
