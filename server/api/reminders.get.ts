const throttle = 600

export default defineEventHandler(async event => {
  requireCron(event)

  const { reminderEmails } = useRuntimeConfig()
  const supabase = serviceClient()
  const day = reminderDay(new Date())

  const { data, error } = await supabase
    .from('reservations')
    .select('*, event(name)')
    .eq('day', day)
    .eq('paymentNeeded', false)

  if (error) {
    throw createError({
      status: 500,
      message: `Could not fetch reservations for ${day}: ${error.message}`,
    })
  }

  const reservations = (data ?? []) as unknown as ReservationWithEvent[]
  const { recipients, skipped } = splitReminders(reservations)

  const sent: ReminderOutcome[] = []
  const failed: ReminderOutcome[] = []

  for (const [index, reservation] of recipients.entries()) {
    if (index > 0) {
      await new Promise(resolve => setTimeout(resolve, throttle))
    }

    // The idempotency key expires after 24h, so a retried or manually
    // triggered run can never send the same reminder twice.
    const { error: sendError } = await sendTemplateMail(
      'Reminder',
      mailProps(reservation),
      {
        to: reservation.email as string,
        subject: 'We zien je snel in Nooi!',
        idempotencyKey: `reminder/${reservation.id}`,
      },
    )

    if (sendError) {
      failed.push(reminderOutcome(reservation, sendError))
    } else {
      sent.push(reminderOutcome(reservation))
    }
  }

  const report: ReminderReport = {
    date: formatDateMail(day),
    total: reservations.length,
    sent,
    failed,
    skipped: skipped.map(reservation => reminderOutcome(reservation)),
  }

  const { sentTo, error: reportError } = await sendReport(
    day,
    report,
    reminderEmails,
  )
  const summary = { day, ...report, reportSentTo: sentTo, reportError }

  if (failed.length || reportError) {
    throw createError({
      status: 500,
      message: `Reminders for ${day}: ${sent.length} sent, ${failed.length} failed`,
      data: summary,
    })
  }

  return summary
})

async function sendReport(
  day: string,
  report: ReminderReport,
  emails?: string,
): Promise<{ sentTo: string[]; error: string | null }> {
  const to = reportRecipients(emails)

  if (!to.length) {
    return { sentTo: [], error: null }
  }

  const { error } = await sendTemplateMail(
    'ReminderReport',
    reportValues(report),
    {
      to,
      subject: reportSubject(report),
      idempotencyKey: reportKey(day, report),
    },
  )

  return { sentTo: to, error }
}
