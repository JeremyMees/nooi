import { format, range, sameDay, addDay, addYear, isBefore } from '@formkit/tempo'
import type { Format } from '@formkit/tempo'

const formatDefault: Format = { date: 'medium', time: 'short' }
const locale = 'nl'
const gridSize = 42

export function padDate(date: number): string {
  return date.toString().padStart(2, '0')
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString)

  return (
    dateString.length === 10
    && !isNaN(date.getTime())
    && !dateInPast(date)
  )
}

export function isBeforeDeadline(date: Date, deadline: Date): boolean {
  return isBefore(date, deadline) || sameDay(date, deadline)
}

export function dateInPast(date: Date): boolean {
  return isBefore(date, addDay(new Date(), -1))
}

export function sameYear(date: DisplayDate, current: Date): boolean {
  return current.getFullYear() === date.year
}

export function sameMonth(date: DisplayDate, current: Date): boolean {
  return current.getMonth() === date.month && sameYear(date, current)
}

export function formatDateUI(date: string): string {
  return format(new Date(date), { date: 'medium' }, locale)
}

export function formatDateMail(date: string): string {
  return format(new Date(date), { date: 'full' }, locale)
}

export function formatDateUrl(date: string): string {
  return date.split('-').reverse().join('-')
}

export function formatDay(date: Date): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  return `${year}-${padDate(month)}-${padDate(day)}`
}

export function formatHour(time: string): string {
  const { hour, minutes } = splitTime(time)

  return `${padDate(hour)}:${padDate(minutes)}`
}

export function getYesterday(): Date {
  return addDay(new Date(), -1)
}

export function getNextYear(): Date {
  return addYear(new Date(), 1)
}

export function roundTime(time: string): string {
  const [hour, minutes] = time.split(':')

  if (+minutes <= 15) {
    return `${hour}:00`
  }
  else if (+minutes >= 45) {
    const newHour = +hour + 1
    return `${newHour === 24 ? '00' : padDate(newHour)}:00`
  }
  else {
    return `${hour}:30`
  }
}

export function getMonths(): string[] {
  return range('MMMM', locale)
}

export function getDaysOfWeek(): string[] {
  const [sunday, ...remainingDays] = range('ddd', locale)

  return [...remainingDays, sunday]
}

export function addMonth(date: DisplayDate, increment: number): DisplayDate {
  let month = date.month + increment
  let year = date.year

  if (month > 12) {
    year = +1
    month -= 12
  }
  else if (month < 1) {
    year -= 1
    month = 12
  }

  return { ...date, year, month }
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getCalenderDays({ year, month }: DisplayDate): CalendarTile[] {
  const today = new Date()
  const firstDayOfMonth = new Date(year, month, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInCurrentMonth = daysInMonth(year, month)
  const addDaysToStart = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1
  const addDaysToEnd = gridSize - (daysInCurrentMonth + addDaysToStart)
  const dates: CalendarTile[] = []

  const addTile = (date: Date, currentMonth: boolean = false) => {
    dates.push({
      key: format(date, formatDefault, locale),
      date: date.getDate(),
      dateFull: date,
      currentMonth,
      today: currentMonth && sameDay(date, today),
    })
  }

  // Add dates from the previous month
  const previousMonth = new Date(year, month, 1)
  previousMonth.setDate(1 - addDaysToStart)
  for (let i = 0; i < addDaysToStart; i++) {
    addTile(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), previousMonth.getDate() + i))
  }

  // Add dates for the current month
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    addTile(new Date(year, month, i), true)
  }

  // Add dates from the next month
  const nextMonth = new Date(year, month + 1, 1)
  for (let i = 1; i <= addDaysToEnd; i++) {
    addTile(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextMonth.getDate() + i - 1))
  }

  return dates
}

export function splitTime(time: string): Time {
  const [hour, minutes] = time.split(':')

  return { hour: +hour, minutes: +minutes }
}

export function beforeTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour < compareHour || (hour === compareHour && minutes < compareMinutes)
}

export function afterTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour > compareHour || (hour === compareHour && minutes > compareMinutes)
}

export function sameTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour === compareHour && minutes === compareMinutes
}
