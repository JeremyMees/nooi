import { serverSupabaseServiceRole } from '#supabase/server'

// Only the outcome leaves the server: the session itself carries the
// customer's details.
export default defineEventHandler(async (event): Promise<{ paid: boolean }> => {
  const { id } = getQuery(event)

  if (typeof id !== 'string' || !id.startsWith('cs_')) {
    throw createError({ status: 400, message: 'Invalid session id' })
  }

  const session = await stripe.checkout.sessions.retrieve(id)

  if (session.payment_status !== 'unpaid') {
    return { paid: true }
  }

  if (session.status === 'open') {
    await stripe.checkout.sessions.expire(id)
  }

  const reservation = Number(session.metadata?.reservation)

  if (Number.isInteger(reservation)) {
    await serverSupabaseServiceRole<Database>(event)
      .from('reservations')
      .delete()
      .eq('id', reservation)
      .eq('paymentNeeded', true)
  }

  return { paid: false }
})
