interface AdminDataChild<T> {
  data: T[]
  loading: boolean
  date: string
  count?: number
  error?: string
}

interface AdminData {
  events: AdminDataChild<EventReservation>
  reservations: AdminDataChild<ReservationRow>
  rosters: AdminDataChild<RosterRow>
}

interface AdminConstants {
  title: Record<DatabaseTable, string>
  table: Record<DatabaseTable, TableColumn[]>
  filter: Record<DatabaseTable, string[]>
}
