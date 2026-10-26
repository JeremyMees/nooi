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

const hoisted = vi.hoisted(() => ({
  toastAdd: vi.fn(),
  removeQuery: vi.fn(),
  navigateTo: vi.fn(),
  cookie: { value: undefined as Record<string, string> | undefined },
  dayRoster: vi.fn<(day: string) => unknown>(() => []),
  $fetch: vi.fn(),
}))

const $fetch = hoisted.$fetch

mockNuxtImport('useSupabaseClient', () => () => supabase)
mockNuxtImport('useToast', () => () => ({ add: hoisted.toastAdd }))
mockNuxtImport('useCookie', () => () => hoisted.cookie)
mockNuxtImport('useRoute', () => () => ({ query }))
mockNuxtImport('removeQuery', () => hoisted.removeQuery)
mockNuxtImport('navigateTo', () => hoisted.navigateTo)
mockNuxtImport('$fetch', () => hoisted.$fetch)
mockNuxtImport('useRosterStore', () => () => ({
  getDayRoster: hoisted.dayRoster,
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
    hoisted.cookie.value = undefined
    hoisted.removeQuery.mockClear()
    hoisted.navigateTo.mockClear()
    hoisted.dayRoster.mockReturnValue([])
    $fetch.mockReset()
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

  describe('drawer', () => {
    it('opens when a day is picked and prefills from the saved cookie', async () => {
      hoisted.cookie.value = {
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
      }
      query.date = '2026-07-10'

      const store = await createStore()

      expect(store.drawerOpen).toBe(true)
      expect(store.form).toMatchObject({
        name: 'Jef Van Laer',
        number: '0496264466',
        mail: 'jef@example.com',
      })
    })

    it('refuses a full event with a toast instead of opening', async () => {
      supabase = createSupabaseMock({
        data: [{ ...event, spots: 1 }],
      })
      const store = await createStore()

      query.event = '1'
      query.status = 'reservation'
      await flushPromises()

      expect(store.drawerOpen).toBe(false)
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Volzet!' }),
      )
      expect(hoisted.removeQuery).toHaveBeenCalledWith(['event', 'status'])
    })

    it('clears the day and the query when it closes', async () => {
      query.date = '2026-07-10'
      const store = await createStore()

      store.drawerOpen = false
      await flushPromises()

      expect(store.form.day).toBeUndefined()
      expect(hoisted.removeQuery).toHaveBeenCalledWith([
        'date',
        'type',
        'event',
        'status',
        'rosterIndex',
      ])
    })
  })

  describe('book', () => {
    const request = {
      type: 'game' as const,
      name: 'Jef Van Laer',
      number: '0496264466',
      email: 'jef@example.com',
      day: '2026-07-10',
      start: '19:00',
      spots: 2,
      exclusive: false,
    }

    it('posts the booking and remembers the contact details', async () => {
      const store = await createStore()
      $fetch.mockResolvedValue({ status: 'confirmed' })

      await expect(store.book(request)).resolves.toEqual({
        status: 'confirmed',
      })

      expect($fetch).toHaveBeenCalledWith('/api/reservations', {
        method: 'POST',
        body: request,
      })
      expect(hoisted.cookie.value).toEqual({
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
      })
      expect(hoisted.navigateTo).not.toHaveBeenCalled()
    })

    it('sends the visitor to the checkout when payment is needed', async () => {
      const store = await createStore()
      $fetch.mockResolvedValue({
        status: 'payment',
        url: 'https://checkout.stripe.com/pay/cs',
      })

      await store.book(request)

      expect(hoisted.navigateTo).toHaveBeenCalledWith(
        'https://checkout.stripe.com/pay/cs',
        { external: true },
      )
    })

    it('passes on a rejected booking', async () => {
      const store = await createStore()
      $fetch.mockRejectedValue(new Error('Event is full'))

      await expect(store.book(request)).rejects.toThrow('Event is full')
    })
  })

  describe('init', () => {
    it('accepts a day that exists in the roster', async () => {
      const store = await createStore()
      query.day = '2099-07-10'

      await store.init()

      expect(store.form.day).toBe('2099-07-10')
      expect(store.loading).toBe(false)
    })

    it('drops a day that has no roster', async () => {
      hoisted.dayRoster.mockReturnValue(undefined)
      const store = await createStore()
      query.day = '2099-07-10'

      await store.init()

      expect(hoisted.removeQuery).toHaveBeenCalledWith(['day'])
    })

    it('confirms a paid checkout session', async () => {
      const store = await createStore()
      query.session_id = 'cs_123'
      $fetch.mockResolvedValue({ paid: true })

      await store.init()

      expect($fetch).toHaveBeenCalledWith('/api/stripe/status', {
        query: { id: 'cs_123' },
      })
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Betaling gelukt!' }),
      )
      expect(hoisted.removeQuery).toHaveBeenCalledWith(['session_id'])
    })

    it('warns the visitor about an unpaid session', async () => {
      const store = await createStore()
      query.session_id = 'cs_123'
      $fetch.mockResolvedValue({ paid: false })

      await store.init()

      expect(supabase.delete).not.toHaveBeenCalled()
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Oeps!' }),
      )
    })

    it('warns the visitor when loading the session fails', async () => {
      const store = await createStore()
      query.session_id = 'cs_123'
      $fetch.mockRejectedValue(new Error('network down'))

      await store.init()

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Oeps!' }),
      )
      expect(store.loading).toBe(false)
    })
  })

  describe('realtime', () => {
    it('subscribes to reservation changes', async () => {
      const store = await createStore()

      store.subscribe()

      expect(supabase.channel).toHaveBeenCalledWith('reservation')
      expect(supabase.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({ table: 'reservations' }),
        expect.any(Function),
      )
      expect(supabase.subscribe).toHaveBeenCalled()
    })

    it('removes every channel on unsubscribe', async () => {
      const store = await createStore()

      store.unsubscribe()

      expect(supabase.removeAllChannels).toHaveBeenCalled()
    })
  })
})
