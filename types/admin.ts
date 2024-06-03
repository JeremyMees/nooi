type AdminDataTypes = 'events' | 'reservations' | 'rosters'

interface AdminDataChild<T> {
  data: T[]
  loading: boolean
  date: string
  search: string
  count?: number
  error?: string
}

interface AdminData {
  events: AdminDataChild<EventReservation>
  reservations: AdminDataChild<ReservationRow>
  rosters: AdminDataChild<RosterRow>
}

interface AdminConstants {
  title: Record<AdminDataTypes, string>
  table: Record<AdminDataTypes, TableColumn[]>
}
