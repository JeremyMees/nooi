export interface CalendarQuery {
  year: number
  month: number
  event?: number
}

function invalid(): never {
  throw createError({ status: 400, message: 'Invalid calendar query' })
}

export function parseCalendarQuery(
  query: Record<string, unknown>,
): CalendarQuery {
  const year = Number(query.year)
  const month = Number(query.month)
  const event = query.event === undefined ? undefined : Number(query.event)

  if (!Number.isInteger(year) || year < 2000 || year > 2100) invalid()
  if (!Number.isInteger(month) || month < 0 || month > 11) invalid()
  if (event !== undefined && !Number.isInteger(event)) invalid()

  return { year, month, event }
}

export function calendarRange(year: number, month: number) {
  const prev = new Date(year, month - 1, 1)
  const next = new Date(year, month + 1, 1)
  const edge = (date: Date) =>
    formatDay(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        daysInMonth(date.getFullYear(), date.getMonth()) - 10,
      ),
    )

  return { from: edge(prev), to: edge(next) }
}

const eventSelect = '*, reservations:reservations(id, spots)'

export async function loadCalendar(
  client: ReturnType<typeof serviceClient>,
  { year, month, event }: CalendarQuery,
): Promise<Calendar> {
  const { from, to } = calendarRange(year, month)

  const [events, rosters] = await Promise.all([
    client
      .from('events')
      .select(eventSelect)
      .gte('day', from)
      .lte('day', to)
      .eq('reservations.paymentNeeded', false),
    client.from('rosters').select('*').gte('day', from).lte('day', to),
  ])

  if (events.error || rosters.error) {
    throw createError({
      status: 500,
      message: `Could not load calendar: ${(events.error ?? rosters.error)?.message}`,
    })
  }

  const calendar: Calendar = {
    events: events.data as EventReservation[],
    rosters: rosters.data,
  }

  if (event !== undefined && !calendar.events.some(({ id }) => id === event)) {
    const { data } = await client
      .from('events')
      .select(eventSelect)
      .eq('id', event)
      .eq('reservations.paymentNeeded', false)
      .maybeSingle()

    if (data) {
      calendar.events.push(data as EventReservation)
    }
  }

  return calendar
}
