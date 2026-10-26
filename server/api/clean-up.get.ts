import { addDay } from '@formkit/tempo'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async event => {
  requireCron(event)

  const supabase = serverSupabaseServiceRole<Database>(event)

  const date = addDay(new Date(), -30)
  const day = `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`

  const { data, error } = await supabase
    .from('reservations')
    .delete()
    .lte('created_at', day)
    .eq('paymentNeeded', true)
    .select('id')

  if (error) {
    throw createError({
      status: 500,
      message: `Could not clean up reservations: ${error.message}`,
    })
  }

  return data.length
    ? `Removed ${data.length} items from the database`
    : 'No clean up needed'
})
