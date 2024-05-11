export type EventRow = Database['public']['Tables']['events']['Row']

export type EventInsert = Database['public']['Tables']['events']['Insert']

export type EventUpdate = Database['public']['Tables']['events']['Update']

export type ReservationRow = Database['public']['Tables']['reservations']['Row']

export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

export type EventTheme = Database['public']['Enums']['eventTheme']

export type BookingType = Database['public']['Enums']['bookingType']

export type RosterRow = Database['public']['Tables']['roster']['Row']

export type RosterInsert = Database['public']['Tables']['roster']['Insert']

export type RosterUpdate = Database['public']['Tables']['roster']['Update']

export type DatabaseTable = 'events' | 'reservations' | 'roster'

export interface EventReservation extends EventRow {
  reservations: {
    id: number
    spots: number
  }[]
}

export interface SbFetchOptions {
  table: DatabaseTable
  select?: string,
  date?: Date
}
