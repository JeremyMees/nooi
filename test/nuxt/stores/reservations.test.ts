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
        expect.objectContaining({ summary: 'Volzet!' }),
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

    it('cancels a pending payment when it closes', async () => {
      query.date = '2026-07-10'
      const store = await createStore()

      store.paymentPending = 2599
      store.drawerOpen = false
      await flushPromises()

      expect(supabase.delete).toHaveBeenCalled()
      expect(supabase.eq).toHaveBeenCalledWith('id', 2599)
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Oeps!' }),
      )
    })
  })

  describe('createReservation', () => {
    const insert = {
      name: 'Jef Van Laer',
      number: '0496264466',
      email: 'jef@example.com',
      day: '2026-07-10',
      start: '19:00',
      spots: 1,
      type: 'event' as const,
    }

    it('inserts the reservation and remembers the contact details', async () => {
      const store = await createStore()
      supabase.result = { data: [{ id: 2599, ...insert }], error: null }

      await expect(store.createReservation(insert)).resolves.toMatchObject({
        id: 2599,
      })

      expect(supabase.insert).toHaveBeenCalledWith([insert])
      expect(supabase.select).toHaveBeenCalledWith('*, event(name)')
      expect(hoisted.cookie.value).toEqual({
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
      })
    })

    it('throws when the insert fails', async () => {
      const store = await createStore()
      supabase.result = { data: null, error: new Error('insert failed') }

      await expect(store.createReservation(insert)).rejects.toThrow(
        'insert failed',
      )
    })

    it('throws when the insert returns no row', async () => {
      const store = await createStore()
      supabase.result = { data: [], error: null }

      await expect(store.createReservation(insert)).rejects.toBeDefined()
    })
  })

  describe('createSession', () => {
    beforeEach(() => {
      query.event = '1'
      query.status = 'reservation'
    })

    it('charges once when the event is not priced per person', async () => {
      const store = await createStore()
      $fetch.mockResolvedValue('https://checkout.stripe.com/pay/cs')
      store.form.spots = '3'

      await store.createSession(2599)

      expect($fetch).toHaveBeenCalledWith('/api/stripe/session', {
        method: 'POST',
        body: {
          reservation: 2599,
          name: event.name,
          amount: event.price,
          quantity: 1,
        },
      })
      expect(hoisted.navigateTo).toHaveBeenCalledWith(
        'https://checkout.stripe.com/pay/cs',
        { external: true },
      )
    })

    it('charges per person when the event is priced per unit', async () => {
      supabase = createSupabaseMock({ data: [{ ...event, unitPrice: true }] })
      const store = await createStore()
      $fetch.mockResolvedValue('https://checkout.stripe.com/pay/cs')
      store.form.spots = '3'

      await store.createSession(2599)

      expect($fetch).toHaveBeenCalledWith(
        '/api/stripe/session',
        expect.objectContaining({
          body: expect.objectContaining({ quantity: 3 }),
        }),
      )
    })

    it('falls back to a single spot for an unusable spots value', async () => {
      supabase = createSupabaseMock({ data: [{ ...event, unitPrice: true }] })
      const store = await createStore()
      $fetch.mockResolvedValue('https://checkout.stripe.com/pay/cs')
      store.form.spots = 'drie'

      await store.createSession(2599)

      expect($fetch).toHaveBeenCalledWith(
        '/api/stripe/session',
        expect.objectContaining({
          body: expect.objectContaining({ quantity: 1 }),
        }),
      )
    })

    it('throws when Stripe returns no url', async () => {
      const store = await createStore()
      $fetch.mockResolvedValue(undefined)

      await expect(store.createSession(2599)).rejects.toThrow(
        'No session url returned',
      )
      expect(hoisted.navigateTo).not.toHaveBeenCalled()
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
      $fetch.mockResolvedValue({ payment_status: 'paid' })

      await store.init()

      expect($fetch).toHaveBeenCalledWith('/api/stripe/status', {
        query: { id: 'cs_123' },
      })
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Betaling gelukt!' }),
      )
      expect(hoisted.removeQuery).toHaveBeenCalledWith(['session_id'])
    })

    it('cancels the reservation behind an unpaid session', async () => {
      const store = await createStore()
      query.session_id = 'cs_123'
      $fetch.mockResolvedValue({
        payment_status: 'unpaid',
        metadata: { reservation: '2599' },
      })

      await store.init()
      await flushPromises()

      expect(supabase.delete).toHaveBeenCalled()
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Oeps!' }),
      )
    })

    it('warns the visitor when loading the session fails', async () => {
      const store = await createStore()
      query.session_id = 'cs_123'
      $fetch.mockRejectedValue(new Error('network down'))

      await store.init()

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Oeps!' }),
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
