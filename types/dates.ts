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
  minutes: number
}

export type CalendarStatus = 'full' | 'game' | 'reservation'
