type EventRow = Database['public']['Tables']['events']['Row']

type EventInsert = Database['public']['Tables']['events']['Insert']

type EventUpdate = Database['public']['Tables']['events']['Update']

type ReservationRow = Database['public']['Tables']['reservations']['Row']

type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

type EventTheme = Database['public']['Enums']['eventTheme']

type BookingType = Database['public']['Enums']['bookingType']

interface EventReservation extends EventRow {
  reservations: {
    id: number
  }[]
}

interface SbFetchOptions {
  table: 'events' | 'reservations'
  select?: string
}
