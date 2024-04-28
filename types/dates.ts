interface CalendarTile {
  key: string
  date: number
  dateFull: Date
  today?: boolean
  currentMonth?: boolean
}

interface DisplayDate {
  year: number
  month: number
  day?: number
}

interface Time {
  hour: number
  minute?: number
}

interface Info {
  open: Time
  close: Time
  minSpots: number
}
