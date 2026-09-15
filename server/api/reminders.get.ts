import { Resend } from 'resend'
import { render } from '@vue-email/render'
import { serverSupabaseServiceRole } from '#supabase/server'
import Template from '~~/emails/Reminder.vue'
import ReportTemplate from '~~/emails/ReminderReport.vue'

const throttle = 600

export default defineEventHandler(async event => {
  const { resendApiKey, reminderEmails, cronSecret } = useRuntimeConfig()

  if (
    cronSecret &&
    getHeader(event, 'authorization') !== `Bearer ${cronSecret}`
  ) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }

  const supabase = serverSupabaseServiceRole<Database>(event)
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

  const resend = new Resend(resendApiKey)
  const sent: ReminderOutcome[] = []
  const failed: ReminderOutcome[] = []

  for (const [index, reservation] of recipients.entries()) {
    if (index > 0) {
      await new Promise(resolve => setTimeout(resolve, throttle))
    }

    const html = await render(Template, reminderProps(reservation))

    // The idempotency key expires after 24h, so a retried or manually
    // triggered run can never send the same reminder twice.
    const { error: sendError } = await resend.emails.send(
      {
        from: 'Nooi <zin@nooi.be>',
        to: reservation.email as string,
        subject: 'We zien je snel in Nooi!',
        html,
      },
      { idempotencyKey: `reminder/${reservation.id}` },
    )

    if (sendError) {
      failed.push(reminderOutcome(reservation, sendError.message))
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
    resend,
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
  resend: Resend,
  day: string,
  report: ReminderReport,
  emails?: string,
): Promise<{ sentTo: string[]; error: string | null }> {
  const to = reportRecipients(emails)

  if (!to.length) {
    return { sentTo: [], error: null }
  }

  const html = await render(ReportTemplate, report)

  const { error } = await resend.emails.send(
    {
      from: 'Nooi <zin@nooi.be>',
      to,
      subject: reportSubject(report),
      html,
    },
    { idempotencyKey: reportKey(day, report) },
  )

  return { sentTo: to, error: error ? error.message : null }
}
