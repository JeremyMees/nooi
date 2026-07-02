import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAdminStore } from '~/stores/admin'
import { createSupabaseMock } from '~~/test/mock'

let supabase: ReturnType<typeof createSupabaseMock>

mockNuxtImport('useSupabaseClient', () => () => supabase)
mockNuxtImport('useCookie', () => () => ref<string>())
mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))

describe('useAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    supabase = createSupabaseMock({ data: [], count: 0, error: null })
  })

  describe('fetchData', () => {
    it('stores the fetched rows and count for the type', async () => {
      supabase.result = { data: [{ id: 1 }, { id: 2 }], count: 5, error: null }
      const store = useAdminStore()

      await store.fetchData('rosters')

      expect(store.data.rosters.data).toEqual([{ id: 1 }, { id: 2 }])
      expect(store.data.rosters.count).toBe(5)
      expect(store.data.rosters.loading).toBe(false)
    })

    it('selects the reservations relation and filters unpaid for events', async () => {
      const store = useAdminStore()

      await store.fetchData('events')

      expect(supabase.select).toHaveBeenCalledWith(
        '*, reservations:reservations(id, spots)',
        { count: 'exact' },
      )
      expect(supabase.eq).toHaveBeenCalledWith(
        'reservations.paymentNeeded',
        false,
      )
    })

    it('selects the event relation and filters unpaid for reservations', async () => {
      const store = useAdminStore()

      await store.fetchData('reservations')

      expect(supabase.select).toHaveBeenCalledWith('*, event(id, name)', {
        count: 'exact',
      })
      expect(supabase.eq).toHaveBeenCalledWith('paymentNeeded', false)
    })

    it('records an error message when the query fails', async () => {
      supabase.result = { error: new Error('db down') }
      const store = useAdminStore()

      await store.fetchData('rosters')

      expect(store.data.rosters.error).toBe('db down')
      expect(store.data.rosters.loading).toBe(false)
    })
  })

  describe('createData', () => {
    it('inserts into the table for the type', async () => {
      const store = useAdminStore()

      await store.createData('rosters', { day: '2026-07-10' } as never)

      expect(supabase.from).toHaveBeenCalledWith('rosters')
      expect(supabase.insert).toHaveBeenCalledWith([{ day: '2026-07-10' }])
    })

    it('sets an error message when the insert fails', async () => {
      supabase.result = { error: { message: 'nope' } }
      const store = useAdminStore()

      await store.createData('rosters', {} as never)

      expect(store.data.rosters.error).toBe(
        'Error tijdens toevoegen in database',
      )
    })
  })

  describe('removeData', () => {
    it('deletes the selected ids', async () => {
      const store = useAdminStore()

      await store.removeData('events', [{ id: 1 }, { id: 3 }] as never)

      expect(supabase.delete).toHaveBeenCalled()
      expect(supabase.in).toHaveBeenCalledWith('id', [1, 3])
    })
  })

  describe('updateData', () => {
    it('updates the row with the given id', async () => {
      const store = useAdminStore()

      await store.updateData(7, 'events', { name: 'x' } as never)

      expect(supabase.update).toHaveBeenCalledWith({ name: 'x' })
      expect(supabase.eq).toHaveBeenCalledWith('id', 7)
    })
  })

  describe('getEvents', () => {
    it('loads upcoming events into state', async () => {
      supabase.result = { data: [{ id: 9 }] }
      const store = useAdminStore()

      await store.getEvents()
      await flushPromises()

      expect(store.events).toEqual([{ id: 9 }])
    })
  })
})
