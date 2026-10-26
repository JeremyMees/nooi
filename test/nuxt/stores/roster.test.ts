import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useRosterStore } from '~/stores/roster'
import { mockRoster } from '~~/test/mock'

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
  })

  function createStore() {
    const store = useRosterStore()
    store.rosters = rosters

    return store
  }

  describe('getDayRoster', () => {
    it('returns only the rosters for the given day, sorted by start', async () => {
      const store = createStore()

      const day = store.getDayRoster('2026-07-10')

      expect(day.map(r => r.start)).toEqual(['18:00', '20:00'])
    })

    it('returns an empty array for a day without rosters', async () => {
      const store = createStore()

      expect(store.getDayRoster('2026-07-15')).toEqual([])
    })
  })

  describe('checkIfOpen', () => {
    it('is true for a day that has rosters', async () => {
      const store = createStore()

      expect(store.checkIfOpen(new Date(2026, 6, 10))).toBe(true)
    })

    it('is false for a day without rosters', async () => {
      const store = createStore()

      expect(store.checkIfOpen(new Date(2026, 6, 15))).toBe(false)
    })
  })

  describe('current', () => {
    it('returns the rosters for the reservation form day', async () => {
      const store = createStore()

      expect(store.current).toHaveLength(2)
    })
  })
})
