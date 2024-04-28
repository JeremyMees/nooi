import type { BookingType } from './supabase'

export interface BasicForm {
  type: BookingType
  day?: string
  name?: string
  number?: string
  mail?: string
}
