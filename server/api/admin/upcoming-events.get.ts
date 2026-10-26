export default defineEventHandler(
  async (event): Promise<EventReservation[]> => {
    await requireAdmin(event)

    const { data, error } = await serviceClient()
      .from('events')
      .select('*, reservations:reservations(id, spots)')
      .gte('day', formatDay(new Date()))
      .order('day', { ascending: true })

    if (error) {
      throw createError({ status: 500, message: error.message })
    }

    return data as EventReservation[]
  },
)
