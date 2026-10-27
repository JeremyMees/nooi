export default defineEventHandler(async event => {
  requireCron(event)

  const supabase = serviceClient()

  const day = formatDay(addDay(new Date(), -30))

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
