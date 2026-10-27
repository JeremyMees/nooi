export interface ReservationForm {
  day?: string
  name?: string
  number?: string
  mail?: string
}

export interface Option<T> {
  value: T
  label: string
}
