import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAdminStore } from '~/stores/admin'

const $fetch = vi.hoisted(() => vi.fn())

mockNuxtImport('$fetch', () => $fetch)

describe('useAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    $fetch.mockReset()
    $fetch.mockResolvedValue({ data: [], count: 0 })
  })

  describe('session', () => {
    it('starts out unknown', () => {
      expect(useAdminStore().authenticated).toBeUndefined()
    })

    it('asks the server whether the visitor is logged in', async () => {
      $fetch.mockResolvedValue({ authenticated: true })
      const store = useAdminStore()

      await store.checkSession()

      expect($fetch).toHaveBeenCalledWith('/api/admin/session')
      expect(store.authenticated).toBe(true)
    })

    it('logs in with the password', async () => {
      const store = useAdminStore()

      await expect(store.login('hunter22')).resolves.toBe(true)

      expect($fetch).toHaveBeenCalledWith('/api/admin/login', {
        method: 'POST',
        body: { password: 'hunter22' },
      })
      expect(store.authenticated).toBe(true)
    })

    it('stays logged out after a wrong password', async () => {
      $fetch.mockRejectedValue(new Error('401'))
      const store = useAdminStore()

      await expect(store.login('admin')).resolves.toBe(false)
      expect(store.authenticated).toBe(false)
    })
  })

  describe('fetchData', () => {
    it('stores the fetched rows and count for the type', async () => {
      $fetch.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }], count: 5 })
      const store = useAdminStore()

      await store.fetchData('rosters')

      expect(store.data.rosters.data).toEqual([{ id: 1 }, { id: 2 }])
      expect(store.data.rosters.count).toBe(5)
      expect(store.data.rosters.loading).toBe(false)
    })

    it('passes paging, search, day and sort to the server', async () => {
      const store = useAdminStore()

      await store.fetchData('events', {
        page: 2,
        search: 'quiz',
        eq: [{ field: 'day', value: '2026-09-14' }],
        sort: { field: 'name', order: 'desc' },
      })

      expect($fetch).toHaveBeenCalledWith('/api/admin/events', {
        query: {
          page: 2,
          search: 'quiz',
          day: '2026-09-14',
          sortField: 'name',
          sortOrder: 'desc',
        },
      })
    })

    it('records an error message when the request fails', async () => {
      $fetch.mockRejectedValue(new Error('db down'))
      const store = useAdminStore()

      await store.fetchData('rosters')

      expect(store.data.rosters.error).toBe('db down')
      expect(store.data.rosters.loading).toBe(false)
    })
  })

  describe('createData', () => {
    it('posts the row and reloads the table', async () => {
      const store = useAdminStore()

      await store.createData('rosters', { day: '2026-07-10' } as never)

      expect($fetch).toHaveBeenCalledWith('/api/admin/rosters', {
        method: 'POST',
        body: { day: '2026-07-10' },
      })
      expect($fetch).toHaveBeenLastCalledWith(
        '/api/admin/rosters',
        expect.objectContaining({ query: expect.any(Object) }),
      )
    })

    it('sets an error message when the insert fails', async () => {
      $fetch.mockRejectedValue(new Error('nope'))
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

      expect($fetch).toHaveBeenCalledWith('/api/admin/events', {
        method: 'DELETE',
        body: { ids: [1, 3] },
      })
    })
  })

  describe('updateData', () => {
    it('patches the row with the given id', async () => {
      const store = useAdminStore()

      await store.updateData(7, 'events', { name: 'x' } as never)

      expect($fetch).toHaveBeenCalledWith('/api/admin/events/7', {
        method: 'PATCH',
        body: { name: 'x' },
      })
    })
  })

  describe('getEvents', () => {
    it('loads upcoming events into state', async () => {
      $fetch.mockResolvedValue([{ id: 9 }])
      const store = useAdminStore()

      await store.getEvents()

      expect($fetch).toHaveBeenCalledWith('/api/admin/upcoming-events')
      expect(store.events).toEqual([{ id: 9 }])
    })
  })
})
