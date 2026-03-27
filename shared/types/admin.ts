interface AdminDataChild<T> {
  data: T[]
  loading: boolean
  count?: number
  error?: string
}

interface AdminData {
  events: AdminDataChild<EventReservation>
  reservations: AdminDataChild<ReservationRow>
  rosters: AdminDataChild<RosterRow>
}

interface AdminConstantChild {
  title: string
  table: TableColumn[]
  filter: string[]
}

type AdminConstants = Record<DatabaseTable, AdminConstantChild>
