export type EventRow = Database['public']['Tables']['events']['Row']

export type EventInsert = Database['public']['Tables']['events']['Insert']

export type EventUpdate = Database['public']['Tables']['events']['Update']

export type ReservationRow = Database['public']['Tables']['reservations']['Row']

export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

export type EventTheme = Database['public']['Enums']['eventTheme']

export type BookingType = Database['public']['Enums']['bookingType']

export interface EventReservation extends EventRow {
  reservations: {
    id: number
  }[]
}

export interface SbFetchOptions {
  table: 'events' | 'reservations'
  select?: string
}
