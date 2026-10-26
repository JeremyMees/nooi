export interface BookingRequest {
  type: BookingType
  event?: number
  day?: string
  start?: string
  end?: string
  name: string
  email: string
  number: string
  spots: number
  exclusive: boolean
  info?: string
}

export type BookingResult =
  { status: 'confirmed' } | { status: 'payment'; url: string }
