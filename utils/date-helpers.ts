import { format, range, monthDays, sameDay } from '@formkit/tempo'
import type { Format } from '@formkit/tempo'

const formatDefault: Format = { date: 'medium', time: 'short' }
const locale = 'nl'
const gridSize = 42

export function sameYear (date: DisplayDate, current: Date): boolean {
  return current.getFullYear() === date.year
}

export function sameMonth (date: DisplayDate, current: Date): boolean {
  return current.getMonth() === date.month && sameYear(date, current)
}

export function createDate ({ year, month, day }: DisplayDate): Date {
  let dateString = `${year}-${month.toString().padStart(2, '0')}`

  if (day) {
    dateString += `-${day.toString().padStart(2, '0')}`
  }

  return new Date(dateString)
}

export function createFormattedDate (date: DisplayDate): string {
  return format(createDate(date), formatDefault, locale)
}

export function firstDayOfWeek (date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay() // Adjust if first day is Sunday
}

export function getMonths (): string[] {
  return range('MMMM', locale)
}

export function getDaysOfWeek (): string[] {
  const [sunday, ...remainingDays] = range('ddd', locale)

  return [...remainingDays, sunday]
}

export function addMonth (date: DisplayDate, increment: number): DisplayDate {
  let month = date.month + increment
  let year = date.year

  if (month > 12) {
    year = +1
    month -= 12
  } else if (month < 1) {
    year -= 1
    month = 12
  }

  return { ...date, year, month }
}

export function getCalenderDays (date: DisplayDate): CalendarTile[] {
  const today = new Date()
  const currentDate = createDate(addMonth(date, 1))
  const firstDay = firstDayOfWeek(currentDate)
  const totalDaysInMonth = monthDays(currentDate)
  const totalDaysInPrevMonth = monthDays(createDate(addMonth(date, -1)))

  const dates: CalendarTile[] = []

  // Add days from previous month
  for (let i = 1; i < firstDay; i++) {
    const prevMonthDate = totalDaysInPrevMonth - firstDay + i + 1
    const createdDate = createDate(addMonth({ ...date, day: prevMonthDate }, 0))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: prevMonthDate
    })
  }

  // Add days from current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const createdDate = createDate(addMonth({ ...date, day: i }, 1))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: i,
      currentMonth: true,
      today: sameDay(createdDate, today)
    })
  }

  // Add days from next month
  const daysToAdd = gridSize - dates.length

  for (let i = 1; i <= daysToAdd; i++) {
    const createdDate = createDate(addMonth({ ...date, day: i }, 2))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: i
    })
  }

  return dates
}
