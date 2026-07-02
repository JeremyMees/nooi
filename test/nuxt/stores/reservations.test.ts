import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useReservationStore } from '~/stores/reservations'
import {
  createSupabaseMock,
  mockEventReservation,
  type SupabaseMock,
} from '~~/test/mock'

let supabase: SupabaseMock
const query = reactive<Record<string, unknown>>({})

mockNuxtImport('useSupabaseClient', () => () => supabase)
mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))
mockNuxtImport('useCookie', () => () => ref())
mockNuxtImport('useRoute', () => () => ({ query }))
mockNuxtImport('useRosterStore', () => () => ({
  getDayRoster: () => [],
}))

const event = { ...mockEventReservation, id: 1, spots: 20 }

async function createStore() {
  const store = useReservationStore()
  await flushPromises()
  return store
}

describe('useReservationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    supabase = createSupabaseMock({ data: [event] })
    Object.keys(query).forEach(key => delete query[key])
  })

  it('loads events into state on creation', async () => {
    const store = await createStore()

    expect(store.events).toEqual([event])
  })

  describe('selectedEvent', () => {
    it('returns the matching event when status is reservation', async () => {
      const store = await createStore()

      query.event = '1'
      query.status = 'reservation'

      expect(store.selectedEvent).toEqual(event)
    })

    it('is undefined when the status is not reservation', async () => {
      const store = await createStore()

      query.event = '1'
      query.status = 'info'

      expect(store.selectedEvent).toBeUndefined()
    })

    it('is undefined for an unknown event id', async () => {
      const store = await createStore()

      query.event = '999'
      query.status = 'reservation'

      expect(store.selectedEvent).toBeUndefined()
    })
  })

  describe('informationEvent', () => {
    it('returns the matching event when status is info', async () => {
      const store = await createStore()

      query.event = '1'
      query.status = 'info'

      expect(store.informationEvent).toEqual(event)
    })

    it('is undefined when the status is not info', async () => {
      const store = await createStore()

      query.event = '1'
      query.status = 'reservation'

      expect(store.informationEvent).toBeUndefined()
    })
  })

  it('fills the form day from a date query parameter', async () => {
    query.date = '2026-07-10'

    const store = await createStore()

    expect(store.form.day).toBe('2026-07-10')
  })
})
