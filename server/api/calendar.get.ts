export default defineEventHandler(async (event): Promise<Calendar> => {
  const query = parseCalendarQuery(getQuery(event))

  setHeader(event, 'cache-control', 'no-store')

  return loadCalendar(serviceClient(), query)
})
