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

  if (error) {
    return 'Error while fetching reminders'
  }

  if (data?.length) {
    for (const reservation of data) {
      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          from: 'Nooi <zin@nooi.be>',
          to: reservation.email,
          subject: 'We zien je snel in Nooi!',
          template: 'Reminder.vue',
          props: {
            name: reservation.name,
            date: formatDateMail(reservation.day),
            time: formatHour(reservation.start),
          },
        },
      })
    }

    return `Reminders sent for ${day}`
  }
  else {
    return `No reminders for ${day}`
  }
})
