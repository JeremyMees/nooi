import { addDay } from '@formkit/tempo'
import { padDate } from '~/utils/date-helpers'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  const date = addDay(new Date(), -30)
  const day = `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`

  const { data, error } = await supabase
    .from('reservations')
    .select('*, event(name)')
    .lte('created_at', day)
    .eq('paymentNeeded', true)

  if (error) {
    return 'Error while fetching reminders'
  }

  if (data?.length) {
    for (const reservation of data) {
      await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation.id)
    }

    return `Removed ${data?.length} items from the database`
  }
  else {
    return 'No clean up needed'
  }
})
