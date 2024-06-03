export type EventRow = Database['public']['Tables']['events']['Row']

export type EventInsert = Database['public']['Tables']['events']['Insert']

export type EventUpdate = Database['public']['Tables']['events']['Update']

export type ReservationRow = Database['public']['Tables']['reservations']['Row']

export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

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
  select?: string
  date?: Date
}

export interface SbQueryOptions {
  table: DatabaseTable
  fields?: string[]
  select?: string
  page?: number
  perPage?: number
  search?: string
  eq?: SbEq
  fuzzy?: boolean
}

export interface SbEq {
  field: string
  value: string | number
}

export interface SbRange {
  from: number
  to: number
}

export interface SbQuery<T> {
  data: T[]
  count: number
}
