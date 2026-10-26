import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event): Promise<BookingResult> => {
  const request = parseBooking(await readBody(event))

  return createBooking(serverSupabaseServiceRole<Database>(event), request)
})
