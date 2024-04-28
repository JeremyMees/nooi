export interface CalendarTile {
  key: string
  date: number
  dateFull: Date
  today?: boolean
  currentMonth?: boolean
}

export interface DisplayDate {
  year: number
  month: number
  day?: number
}

export interface Time {
  hour: number
  minute?: number
}

export interface Info {
  open: Time
  close: Time
  minSpots: number
}
