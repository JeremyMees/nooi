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
    .select('*, event(name)')
    .eq('day', day)

  if (error) {
    return 'Error while fetching reminders'
  }

  if (data?.length) {
    for (const reservation of data) {
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

      const event = (reservation?.event as unknown as { name: string })?.name || undefined

      await $fetch('/api/mail', {
        method: 'POST',
        body: {
          to: reservation.email,
          props: {
            name: reservation.name,
            date: formatDateUI(reservation.day),
            time: formatHour(reservation.start),
            ...(event ? { event } : {}),
          },
          ...options,
        },
      })
    }

    return `Reminders sent for ${day}`
  }
  else {
    return `No reminders for ${day}`
  }
})
