import { addDay } from '@formkit/tempo'
import { Client, resend } from '@upstash/qstash'
import { render } from '@vue-email/render'
import ReminderTemplate from '~~/emails/Reminder.vue'

export default defineEventHandler(async (event) => {
  const { resendApiKey, qStashToken, qStashUrl } = useRuntimeConfig()

  const reservation = await readBody<ReservationWithEvent>(event)

  if (!reservation) {
    throw createError({ status: 400, message: 'No reservation provided' })
  }

  const client = new Client({
    token: qStashToken,
    baseUrl: qStashUrl,
  })

  const reminderDate = addDay(new Date(reservation.day), -2)
  reminderDate.setUTCHours(8, 0, 0, 0)

  if (reminderDate.getTime() <= Date.now()) {
    return
  }

  const html = await render(ReminderTemplate, {
    name: reservation.name,
    date: formatDateMail(reservation.day),
    time: formatHour(reservation.start),
    event: reservation?.event?.name ?? undefined,
  })

  await client.publishJSON({
    api: {
      name: 'email',
      provider: resend({ token: resendApiKey }),
    },
    body: {
      from: 'Nooi <zin@nooi.be>',
      to: reservation.email,
      subject: 'We zien je snel in Nooi!',
      html,
    },
    notBefore: Math.floor(reminderDate.getTime() / 1000),
  })
})
