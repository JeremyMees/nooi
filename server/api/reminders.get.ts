import { addDay } from '@formkit/tempo'
import { Resend } from 'resend'
import { render } from '@vue-email/render'
import { serverSupabaseServiceRole } from '#supabase/server'
import ReminderTemplate from '~~/emails/Reminder.vue'
import ReminderStatsTemplate from '~~/emails/ReminderStats.vue'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const { resendApiKey } = useRuntimeConfig()

  const date = addDay(new Date(), 2)
  const day = `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`

  const { data, error } = await supabase
    .from('reservations')
    .select('*, event(name)')
    .eq('day', day)
    .eq('paymentNeeded', false)

  if (error) {
    return 'Error while fetching reminders'
  }

  if (data.length === 0) {
    return 'No reminders needed'
  }

  const resend = new Resend(resendApiKey)

  const mailNotProvided: string[] = []
  const mailErrors: string[] = []
  const adminMailErrors: string[] = []
  const emailsToSend = []

  for (const reservation of data) {
    if (!reservation.email) {
      mailNotProvided.push(reservation.name)
      continue
    }

    try {
      const html = await render(ReminderTemplate, {
        name: reservation.name,
        date: formatDateMail(reservation.day),
        time: formatHour(reservation.start),
        event: reservation?.event?.name ?? undefined,
      })

      emailsToSend.push({
        from: 'Nooi <zin@nooi.be>',
        to: reservation.email,
        subject: 'We zien je snel in Nooi!',
        html,
      })
    }
    catch (compileError) {
      mailErrors.push(`Failed to compile email template for ${reservation.name} (${reservation.email})`)
    }
  }

  let reminderSendSuccess = 0

  if (emailsToSend.length > 0) {
    try {
      const { data: batchData } = await resend.batch.send(emailsToSend)
      reminderSendSuccess = batchData?.data?.length ?? 0
    }
    catch (batchError) {
      mailErrors.push(`Batch send failed: ${(batchError as Error).message}`)
    }
  }

  try {
    const html = await render(ReminderStatsTemplate, {
      date: formatDateMail(day),
      success: reminderSendSuccess,
      errors: mailErrors.length,
      noMailAddress: mailNotProvided,
    })

    const statsRecipients = ['jeremymees123@gmail.com', 'mail@thomasgoyvaerts.be']

    await resend.batch.send(
      statsRecipients.map(recipient => ({
        from: 'Nooi <zin@nooi.be>',
        to: recipient,
        subject: `Herinnering statistieken voor ${formatDateMail(day)}`,
        html,
      })),
    )
  }
  catch (statsError) {
    adminMailErrors.push(`Failed to send stats email: ${(statsError as Error).message}`)
  }

  return {
    mailNotProvided,
    mailErrors,
    adminMailErrors,
  }
})
