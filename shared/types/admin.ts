export interface AdminDataChild<T> {
  data: T[]
  loading: boolean
  count?: number
  error?: string
}

export type AdminReservationRow = Omit<ReservationRow, 'event'> & {
  event: Pick<EventRow, 'id' | 'name'> | null
}

export interface AdminData {
  events: AdminDataChild<EventReservation>
  reservations: AdminDataChild<AdminReservationRow>
  rosters: AdminDataChild<RosterRow>
}

export interface AdminConstantChild {
  title: string
  table: TableColumn[]
  filter: string[]
}

export type AdminConstants = Record<DatabaseTable, AdminConstantChild>
