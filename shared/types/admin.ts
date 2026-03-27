export interface AdminDataChild<T> {
  data: T[]
  loading: boolean
  count?: number
  error?: string
}

export interface AdminData {
  events: AdminDataChild<EventReservation>
  reservations: AdminDataChild<ReservationRow>
  rosters: AdminDataChild<RosterRow>
}

export interface AdminConstantChild {
  title: string
  table: TableColumn[]
  filter: string[]
}

export type AdminConstants = Record<DatabaseTable, AdminConstantChild>
