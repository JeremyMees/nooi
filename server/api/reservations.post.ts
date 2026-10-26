export default defineEventHandler(async (event): Promise<BookingResult> => {
  const request = parseBooking(await readBody(event))

  return createBooking(serviceClient(), request)
})
