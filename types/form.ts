interface ReservationForm {
  day?: string
  name?: string
  number?: string
  mail?: string
  spots?: string
  exclusive?: boolean
}

interface AdminForm {
  password: string
}

interface Option<T> {
  value: T
  label: string
}
