import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useRosterStore } from '~/stores/roster'
import { createSupabaseMock, mockRoster, type SupabaseMock } from '~~/test/mock'

let supabase: SupabaseMock
const toast = { add: vi.fn() }

mockNuxtImport('onMounted', () => () => {})
mockNuxtImport('useSupabaseClient', () => () => supabase)
mockNuxtImport('useToast', () => () => toast)
mockNuxtImport('useReservationStore', () => () => ({
  shownDate: { year: 2026, month: 6 },
  form: { day: '2026-07-10' },
}))

const rosters: RosterRow[] = [
  { ...mockRoster, id: 1, day: '2026-07-10', status: 'game', start: '20:00' },
  { ...mockRoster, id: 2, day: '2026-07-10', status: 'game', start: '18:00' },
  {
    ...mockRoster,
    id: 3,
    day: '2026-07-11',
    status: 'occupied',
    start: '19:00',
  },
]

describe('useRosterStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    supabase = createSupabaseMock({ data: rosters })
    toast.add.mockClear()
  })

  describe('getData', () => {
    it('loads the rosters into state', async () => {
      const store = useRosterStore()

      await store.getData()

      expect(store.getDayRoster('2026-07-10')).toHaveLength(2)
      expect(store.loading).toBe(false)
    })
  })

  describe('getDayRoster', () => {
    it('returns only the rosters for the given day, sorted by start', async () => {
      const store = useRosterStore()
      await store.getData()

      const day = store.getDayRoster('2026-07-10')

      expect(day.map(r => r.start)).toEqual(['18:00', '20:00'])
    })

    it('returns an empty array for a day without rosters', async () => {
      const store = useRosterStore()
      await store.getData()

      expect(store.getDayRoster('2026-07-15')).toEqual([])
    })
  })

  describe('checkIfOpen', () => {
    it('is true for a day that has rosters', async () => {
      const store = useRosterStore()
      await store.getData()

      expect(store.checkIfOpen(new Date(2026, 6, 10))).toBe(true)
    })

    it('is false for a day without rosters', async () => {
      const store = useRosterStore()
      await store.getData()

      expect(store.checkIfOpen(new Date(2026, 6, 15))).toBe(false)
    })
  })

  describe('current', () => {
    it('returns the rosters for the reservation form day', async () => {
      const store = useRosterStore()
      await store.getData()

      expect(store.current).toHaveLength(2)
    })
  })

  describe('fetchRoster', () => {
    it('queries the rosters for the given day', async () => {
      supabase.result = { data: [rosters[0]], error: null }
      const store = useRosterStore()

      const result = await store.fetchRoster(new Date(2026, 6, 10))

      expect(supabase.eq).toHaveBeenCalledWith('day', '2026-07-10')
      expect(result).toHaveLength(1)
    })

    it('returns an empty array when the query errors', async () => {
      supabase.result = { error: new Error('boom') }
      const store = useRosterStore()

      expect(await store.fetchRoster(new Date(2026, 6, 10))).toEqual([])
    })
  })
})
