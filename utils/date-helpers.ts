import { format, range, monthDays, sameDay, addDay, addYear, isBefore } from '@formkit/tempo'
import type { Format } from '@formkit/tempo'

const formatDefault: Format = { date: 'medium', time: 'short' }
const locale = 'nl'
const gridSize = 42

export function padDate (date: number): string {
  return date.toString().padStart(2, '0')
}

export function isValidDateString (dateString: string): boolean {
  const date = new Date(dateString)

  return (
    dateString.length === 10 &&
    !isNaN(date.getTime()) &&
    !dateInPast(date)
  )
}

export function isBeforeDeadline (date: Date, deadline: Date): boolean {
  return isBefore(date, deadline) || sameDay(date, deadline)
}

export function dateInPast (date: Date): boolean {
  return isBefore(date, addDay(new Date(), -1))
}

export function sameYear (date: DisplayDate, current: Date): boolean {
  return current.getFullYear() === date.year
}

export function sameMonth (date: DisplayDate, current: Date): boolean {
  return current.getMonth() === date.month && sameYear(date, current)
}

export function createDate ({ year, month, day }: DisplayDate): Date {
  let dateString = `${year}-${padDate(month)}`

  if (day) {
    dateString += `-${padDate(day)}`
  }

  return new Date(dateString)
}

export function createFormattedDate (date: DisplayDate): string {
  return format(createDate(date), formatDefault, locale)
}

export function formatDateUI (date: string): string {
  return format(new Date(date), { date: 'medium' }, locale)
}

export function formatDateUrl (date: string): string {
  return date.split('-').reverse().join('-')
}

export function formatDay (date: Date): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return `${year}-${padDate(month)}-${padDate(day)}`
}

export function formatHour (time: string): string {
  const { hour, minutes } = splitTime(time)

  return `${padDate(hour)}:${padDate(minutes)}`
}

export function getYesterday (): Date {
  return addDay(new Date(), -1)
}

export function getNextYear (): Date {
  return addYear(new Date(), 1)
}

export function roundTime (time: string): string {
  const [hour, minutes] = time.split(':')

  if (+minutes <= 15) {
    return `${hour}:00`
  } else if (+minutes >= 45) {
    const newHour = +hour + 1
    return `${newHour === 24 ? '00' : padDate(newHour)}:00`
  } else {
    return `${hour}:30`
  }
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
  const firstDay = new Date(currentDate).getDay()
  const totalDaysInMonth = monthDays(currentDate)
  const totalDaysInPrevMonth = monthDays(createDate(date))

  const dates: CalendarTile[] = []

  // Add days from previous month
  for (let i = 1; i < firstDay; i++) {
    const prevMonthDate = totalDaysInPrevMonth - firstDay + i + 1
    const createdDate = createDate(addMonth({ ...date, day: prevMonthDate }, 0))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: prevMonthDate,
      dateFull: createdDate
    })
  }

  // Add days from current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const createdDate = createDate(addMonth({ ...date, day: i }, 1))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: i,
      currentMonth: true,
      today: sameDay(createdDate, today),
      dateFull: createdDate
    })
  }

  // Add days from next month
  const daysToAdd = gridSize - dates.length

  for (let i = 1; i <= daysToAdd; i++) {
    const createdDate = createDate(addMonth({ ...date, day: i }, 2))

    dates.push({
      key: format(createdDate, formatDefault, locale),
      date: i,
      dateFull: createdDate
    })
  }

  return dates
}

export function splitTime (time: string): Time {
  const [hour, minutes] = time.split(':')

  return { hour: +hour, minutes: +minutes }
}

export function beforeTime (time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour < compareHour || (hour === compareHour && minutes < compareMinutes)
}

export function afterTime (time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour > compareHour || (hour === compareHour && minutes > compareMinutes)
}

export function sameTime (time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour === compareHour && minutes === compareMinutes
}
