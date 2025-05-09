import { addDay } from '@formkit/tempo'
import { formatDateMail, formatHour, padDate } from '~/utils/date-helpers'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

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

  const mailNotProvided: string[] = []
  const mailErrors: string[] = []
  const adminMailErrors: string[] = []

  const mailPromises = data.map(async (reservation) => {
    if (!reservation.email) {
      mailNotProvided.push(reservation.name)
      return
    }

    try {
      await $fetch('/api/mail/reminder', {
        method: 'POST',
        body: {
          to: reservation.email,
          props: {
            name: reservation.name,
            date: formatDateMail(reservation.day),
            time: formatHour(reservation.start),
          },
        },
      })
    }
    catch (error) {
      mailErrors.push(`Failed to send email to ${reservation.name} (${reservation.email})`)
    }
  })

  await Promise.all(mailPromises)

  const errorAmount = mailNotProvided.length + mailErrors.length
  const sentAmount = data.length - errorAmount

  try {
    await $fetch('/api/mail/reminder-stats', {
      method: 'POST',
      body: {
        to: 'jeremymees123@gmail.com',
        props: {
          date: formatDateMail(day),
          success: sentAmount,
          errors: mailErrors.length,
          noMailAddress: mailNotProvided,
        },
      },
    })
  }
  catch (error) {
    adminMailErrors.push((error as Error).message)
  }

  return {
    message: `${sentAmount} reminders sent for ${day} with ${errorAmount} errors`,
    mailNotProvided,
    mailErrors,
    adminMailErrors,
  }
})
