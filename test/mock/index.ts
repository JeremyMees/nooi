import { vi } from 'vitest'
import type {
  EventRow,
  EventReservation,
  ReservationRow,
  RosterRow,
} from '~~/shared/types/supabase'

export interface SupabaseResult {
  data?: unknown
  error?: unknown
  count?: number | null
}

export function createSupabaseMock(result: SupabaseResult = { data: [] }) {
  const builder = {
    result,
    from: vi.fn(() => builder),
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    in: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    or: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    channel: vi.fn(() => builder),
    on: vi.fn(() => builder),
    subscribe: vi.fn(() => builder),
    removeAllChannels: vi.fn(),
    then: (resolve: (value: SupabaseResult) => unknown) =>
      resolve(builder.result),
  }

  return builder
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>

export function mockRoute(query: Record<string, unknown> = {}) {
  return {
    path: '/',
    fullPath: '/',
    hash: '',
    name: undefined,
    params: {},
    meta: {},
    matched: [],
    redirectedFrom: undefined,
    query,
  }
}

export const mockEvent: EventRow = {
  id: 1,
  created_at: '2026-06-01T10:00:00.000Z',
  name: 'Bordspellen avond',
  day: '2026-07-10',
  start: '19:00',
  end: '23:00',
  bookingDeadline: '2026-07-09',
  description: 'Een gezellige avond vol bordspellen.',
  external: false,
  minSpots: 1,
  onlinePayment: true,
  price: 5,
  spots: 20,
  theme: 'strategie, familie',
  unitPrice: false,
}

export const mockEventReservation: EventReservation = {
  ...mockEvent,
  reservations: [
    { id: 1, spots: 2 },
    { id: 2, spots: 3 },
  ],
}

export const mockReservation: ReservationRow = {
  id: 1,
  created_at: '2026-06-15T12:00:00.000Z',
  name: 'Jan Jansen',
  day: '2026-07-10',
  start: '19:00',
  end: '23:00',
  email: 'jan@example.com',
  number: '+32470123456',
  event: 1,
  exclusive: false,
  info: null,
  paymentIdentifier: null,
  paymentNeeded: false,
  spots: 4,
  type: 'reservation',
}

export const mockRoster: RosterRow = {
  id: 1,
  created_at: '2026-06-01T10:00:00.000Z',
  day: '2026-07-10',
  start: '18:00',
  end: '23:00',
  status: 'game',
  minSpots: 1,
  allowReservation: true,
}

export const mockRosters: RosterRow[] = [
  { ...mockRoster, id: 1, status: 'game', start: '18:00', end: '20:00' },
  {
    ...mockRoster,
    id: 2,
    status: 'reservation',
    start: '20:00',
    end: '22:00',
  },
  { ...mockRoster, id: 3, status: 'occupied', start: '22:00', end: '23:00' },
]
