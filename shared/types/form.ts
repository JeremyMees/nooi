export interface ReservationForm {
  day?: string
  name?: string
  number?: string
  mail?: string
  spots?: string
  exclusive?: boolean
}

export interface AdminForm {
  password: string
}

export interface Option<T> {
  value: T
  label: string
}
