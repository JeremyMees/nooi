import { addDay } from '@formkit/tempo'
import { formatDateUI, formatHour, padDate } from '~/utils/date-helpers'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  const date = addDay(new Date(), 2)
  const day = `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('day', day)

  if (error) {
    return 'Error while fetching reminders'
  }

  if (data?.length) {
    await Promise.all(data.map(async (reservation) => {
      const options = {
        from: 'Nooi <zin@nooi.be>',
        subject: 'Reservatie Nooi',
        template: 'ReservationSuccess.vue',
      }

      if (reservation.type === 'event') {
        options.subject = 'Event reservatie Nooi'
        options.template = 'EventSuccess.vue'
      }
      else if (reservation.type === 'game') {
        options.subject = 'Boeking Nooi'
        options.template = 'BookingSuccess.vue'
      }

      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          to: reservation.email,
          props: {
            name: reservation.name,
            date: formatDateUI(reservation.day),
            time: formatHour(reservation.start),
          },
          ...options,
        },
      })
    }))

    return 'Reminders sent'
  }
  else {
    return 'No reminders to send'
  }
})
