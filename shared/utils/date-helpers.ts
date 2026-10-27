const locale = 'nl'
const gridSize = 42
const dateOnly = /^\d{4}-\d{2}-\d{2}$/

const tileKey = new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const mediumDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' })
const monthName = new Intl.DateTimeFormat(locale, { month: 'long' })
const weekdayName = new Intl.DateTimeFormat(locale, { weekday: 'short' })

export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  if (!dateOnly.test(value)) return new Date(value)

  const [year, month, day] = value.split('-').map(Number)

  return new Date(year!, month! - 1, day!)
}

export function sameDay(a: string | Date, b: string | Date): boolean {
  const first = toDate(a)
  const second = toDate(b)

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

export function addDay(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)

  return next
}

export function padDate(date: number): string {
  return date.toString().padStart(2, '0')
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString)

  return dateString.length === 10 && !isNaN(date.getTime()) && !dateInPast(date)
}

export function isBeforeDeadline(date: Date, deadline: Date): boolean {
  return date < deadline || sameDay(date, deadline)
}

export function isAfterDeadline(date: Date, deadline: Date): boolean {
  return deadline < date && !sameDay(date, deadline)
}

export function dateInPast(date: Date): boolean {
  return date < addDay(new Date(), -1)
}

export function sameYear(date: DisplayDate, current: Date): boolean {
  return current.getFullYear() === date.year
}

export function sameMonth(date: DisplayDate, current: Date): boolean {
  return current.getMonth() === date.month && sameYear(date, current)
}

export function formatDateUI(date: string): string {
  return mediumDate.format(new Date(date))
}

export function formatDateMail(date: string): string {
  return fullDate.format(new Date(date))
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

export function formatHourText(time: string): string {
  const { hour, minutes } = splitTime(time)

  return minutes ? `${hour}u${padDate(minutes)}` : `${hour}u`
}

export function getYesterday(): Date {
  return addDay(new Date(), -1)
}

export function getNextYear(): Date {
  const next = new Date()
  const month = next.getMonth()
  next.setFullYear(next.getFullYear() + 1)

  if (next.getMonth() !== month) next.setDate(0)

  return next
}

export function roundTime(time: string): string {
  const [hour, minutes] = time.split(':')

  if (!hour || !minutes) {
    return '_'
  }

  if (+minutes <= 15) {
    return `${hour}:00`
  } else if (+minutes >= 45) {
    const newHour = +hour + 1
    return `${newHour === 24 ? '00' : padDate(newHour)}:00`
  } else {
    return `${hour}:30`
  }
}

export function getMonths(): string[] {
  return Array.from({ length: 12 }, (_, month) =>
    monthName.format(new Date(2026, month, 1)),
  )
}

export function getDaysOfWeek(): string[] {
  return Array.from({ length: 7 }, (_, day) =>
    weekdayName.format(new Date(2026, 0, 5 + day)),
  )
}

export function addMonth(date: DisplayDate, increment: number): DisplayDate {
  let month = date.month + increment
  let year = date.year

  if (month > 12) {
    year += 1
    month -= 12
  } else if (month < 1) {
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
  const addDaysToStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const addDaysToEnd = gridSize - (daysInCurrentMonth + addDaysToStart)
  const dates: CalendarTile[] = []

  const addTile = (date: Date, currentMonth: boolean = false) => {
    dates.push({
      key: tileKey.format(date),
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
    addTile(
      new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth(),
        previousMonth.getDate() + i,
      ),
    )
  }

  // Add dates for the current month
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    addTile(new Date(year, month, i), true)
  }

  // Add dates from the next month
  const nextMonth = new Date(year, month + 1, 1)
  for (let i = 1; i <= addDaysToEnd; i++) {
    addTile(
      new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        nextMonth.getDate() + i - 1,
      ),
    )
  }

  return dates
}

export function splitTime(time: string): Time {
  const [hour, minutes] = time.split(':')

  return {
    hour: hour ? +hour : 0,
    minutes: minutes ? +minutes : 0,
  }
}

export function beforeTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)
  let adjustedCompareHour = compareHour
  let adjustedHour = hour

  if (adjustedCompareHour < 6) {
    adjustedCompareHour += 24
  }

  if (adjustedHour < 6) {
    adjustedHour += 24
  }

  return (
    adjustedHour < adjustedCompareHour ||
    (adjustedHour === adjustedCompareHour && minutes < compareMinutes)
  )
}

export function afterTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return (
    hour > compareHour || (hour === compareHour && minutes > compareMinutes)
  )
}

export function sameTime(time: string, compare: string): boolean {
  const { hour, minutes } = splitTime(time)
  const { hour: compareHour, minutes: compareMinutes } = splitTime(compare)

  return hour === compareHour && minutes === compareMinutes
}

export function timeToMinutes(time: string): number {
  const { hour, minutes } = splitTime(time)

  return (hour < 6 ? hour + 24 : hour) * 60 + minutes
}

export function isWithinRoster(
  time: string,
  rosters: Pick<RosterRow, 'start' | 'end'>[],
): boolean {
  const minutes = timeToMinutes(time)

  return rosters.some(
    ({ start, end }) =>
      timeToMinutes(start) <= minutes && minutes <= timeToMinutes(end),
  )
}
