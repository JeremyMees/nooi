import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import AdminTable from '~/components/AdminTable.vue'
import { mockEvent, setup } from '~~/test/mock'

const fetchData = vi.fn()
const createData = vi.fn()
const updateData = vi.fn()
const removeData = vi.fn()
let events: EventRow[] = []

mockNuxtImport('useAdminStore', () => () => ({
  data: {
    events: { data: [], count: 0, loading: false },
    reservations: { data: [], count: 0, loading: false },
    rosters: { data: [], count: 0, loading: false },
  },
  get events() {
    return events
  },
  fetchData,
  removeData,
  createData,
  updateData,
}))

async function mount(type: DatabaseTable = 'events') {
  const wrapper = await mountSuspended(AdminTable, {
    props: { type },
    shallow: true,
  })
  await flushPromises()
  fetchData.mockClear()
  return wrapper
}

describe('AdminTable', () => {
  beforeEach(() => {
    fetchData.mockClear()
    createData.mockClear()
    updateData.mockClear()
    removeData.mockClear()
    events = []
  })

  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(AdminTable, {
      props: { type: 'events' },
      shallow: true,
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the title for the given type', async () => {
    const wrapper = await mountSuspended(AdminTable, {
      props: { type: 'events' },
      shallow: true,
    })

    expect(wrapper.find('[test-id="admin-title"]').text()).toBe('Evenementen')
  })

  it('renders the roster title for the rosters type', async () => {
    const wrapper = await mountSuspended(AdminTable, {
      props: { type: 'rosters' },
      shallow: true,
    })

    expect(wrapper.find('[test-id="admin-title"]').text()).toBe('Uurroosters')
  })

  it('fetches the data for its type on mount', async () => {
    await mountSuspended(AdminTable, {
      props: { type: 'reservations' },
      shallow: true,
    })
    await flushPromises()

    expect(fetchData).toHaveBeenCalledWith('reservations')
  })

  describe('generateString', () => {
    it('renders an empty string for a missing value', async () => {
      const wrapper = await mount()

      expect(setup(wrapper).generateString({ name: null }, 'name')).toBe('')
    })

    it('formats the start and end as hours', async () => {
      const wrapper = await mount()

      expect(
        setup(wrapper).generateString({ start: '19:00:00' }, 'start'),
      ).toBe('19:00')
      expect(setup(wrapper).generateString({ end: '22:00:00' }, 'end')).toBe(
        '22:00',
      )
    })

    it('translates the booking type and the roster status', async () => {
      const wrapper = await mount()

      expect(setup(wrapper).generateString({ type: 'game' }, 'type')).toBe(
        getType('game'),
      )
      expect(setup(wrapper).generateString({ status: 'game' }, 'status')).toBe(
        getStatus('game'),
      )
    })

    it('counts the reserved spots for an event', async () => {
      const wrapper = await mount()
      const row = { reservations: [{ spots: 2 }, { spots: 3 }] }

      expect(setup(wrapper).generateString(row, 'reservations')).toBe('5')
    })

    it('shows the name of a linked event', async () => {
      const wrapper = await mount()
      const row = { event: { name: 'Minipainting' } }

      expect(setup(wrapper).generateString(row, 'event')).toBe('Minipainting')
    })

    it('formats the day for display', async () => {
      const wrapper = await mount()

      expect(setup(wrapper).generateString({ day: '2026-09-14' }, 'day')).toBe(
        formatDateUI('2026-09-14'),
      )
    })

    it('passes anything else through untouched', async () => {
      const wrapper = await mount()

      expect(setup(wrapper).generateString({ name: 'Jef' }, 'name')).toBe('Jef')
    })
  })

  describe('onTableEvent', () => {
    it('queries the first page by default', async () => {
      const wrapper = await mount()

      await setup(wrapper).onTableEvent()

      expect(fetchData).toHaveBeenCalledWith('events', {
        fuzzy: true,
        page: 0,
        search: '',
        fields: ['name'],
        sort: undefined,
      })
    })

    it('turns a row offset into a page number', async () => {
      const wrapper = await mount()

      await setup(wrapper).onTableEvent({ first: 30 })

      expect(fetchData).toHaveBeenCalledWith(
        'events',
        expect.objectContaining({ page: 3 }),
      )
    })

    it('adds a day filter when a date is picked', async () => {
      const wrapper = await mount()

      await setup(wrapper).onTableEvent({ date: '2026-09-14' })

      expect(fetchData).toHaveBeenCalledWith(
        'events',
        expect.objectContaining({
          eq: [{ field: 'day', value: '2026-09-14' }],
        }),
      )
    })

    it('maps the sort order onto asc and desc', async () => {
      const wrapper = await mount()

      await setup(wrapper).onTableEvent({ sortField: 'day', sortOrder: 1 })
      expect(fetchData).toHaveBeenCalledWith(
        'events',
        expect.objectContaining({ sort: { field: 'day', order: 'asc' } }),
      )

      await setup(wrapper).onTableEvent({ sortField: 'day', sortOrder: -1 })
      expect(fetchData).toHaveBeenCalledWith(
        'events',
        expect.objectContaining({ sort: { field: 'day', order: 'desc' } }),
      )
    })
  })

  describe('submit', () => {
    it('creates a new row when there is no id', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({ name: 'Minipainting' })

      expect(createData).toHaveBeenCalledWith('events', {
        name: 'Minipainting',
        description: '',
      })
      expect(updateData).not.toHaveBeenCalled()
    })

    it('updates an existing row without its generated columns', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({
        id: 7,
        created_at: '2026-09-01T00:00:00Z',
        name: 'Minipainting',
        reservations: [{ id: 1 }],
      })

      expect(updateData).toHaveBeenCalledWith(7, 'events', {
        name: 'Minipainting',
        description: '',
      })
      expect(createData).not.toHaveBeenCalled()
    })

    it('copies the timing of the linked event onto a reservation', async () => {
      events = [
        {
          ...mockEvent,
          id: 3,
          day: '2026-09-14',
          start: '19:00',
          end: '22:00',
        },
      ]
      const wrapper = await mount('reservations')

      await setup(wrapper).submit({ name: 'Jef', event: { id: 3 } })

      expect(createData).toHaveBeenCalledWith('reservations', {
        name: 'Jef',
        event: 3,
        day: '2026-09-14',
        start: '19:00',
        end: '22:00',
      })
    })

    it('accepts an event given as a plain id', async () => {
      events = [{ ...mockEvent, id: 3, day: '2026-09-14' }]
      const wrapper = await mount('reservations')

      await setup(wrapper).submit({ name: 'Jef', event: '3' })

      expect(createData).toHaveBeenCalledWith(
        'reservations',
        expect.objectContaining({ event: 3 }),
      )
    })

    it('stores a reservation without an event as null', async () => {
      const wrapper = await mount('reservations')

      await setup(wrapper).submit({ name: 'Jef' })

      expect(createData).toHaveBeenCalledWith(
        'reservations',
        expect.objectContaining({ event: null }),
      )
    })
  })

  describe('row expansion', () => {
    it('opens one row at a time and loads its description', async () => {
      const wrapper = await mount()

      setup(wrapper).onRowExpand({
        data: { id: 4, description: 'Kom schilderen' },
      })

      expect(setup(wrapper).expandedRows).toEqual({ 4: true })
      expect(setup(wrapper).content).toBe('Kom schilderen')
    })

    it('clears the description when the row closes', async () => {
      const wrapper = await mount()

      setup(wrapper).onRowExpand({
        data: { id: 4, description: 'Kom schilderen' },
      })
      setup(wrapper).onRowCollapse({ data: { id: 4 } })

      expect(setup(wrapper).content).toBe('')
    })

    it('leaves the description alone for other tables', async () => {
      const wrapper = await mount('rosters')

      setup(wrapper).onRowExpand({ data: { id: 4, description: 'ignored' } })

      expect(setup(wrapper).content).toBe('')
      expect(setup(wrapper).expandedRows).toEqual({ 4: true })
    })
  })

  it('resets the filters after a submit', async () => {
    const wrapper = await mount()
    setup(wrapper).filters.search = 'jef'
    setup(wrapper).filters.first = 20

    await setup(wrapper).submit({ name: 'Minipainting' })

    expect(setup(wrapper).filters).toMatchObject({
      search: '',
      date: null,
      first: 0,
    })
  })

  describe('bulk delete', () => {
    async function mountWithButton() {
      return mountSuspended(AdminTable, {
        props: { type: 'events' },
        global: { stubs: { DataTable: true, ClientOnly: true } },
      })
    }

    it('stays hidden while nothing is selected', async () => {
      const wrapper = await mountWithButton()

      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('removes the selection and clears the filters', async () => {
      const wrapper = await mountWithButton()
      setup(wrapper).selected = [{ id: 1 }, { id: 2 }]
      setup(wrapper).filters.search = 'jef'
      await nextTick()

      await wrapper.find('button').trigger('click')

      expect(removeData).toHaveBeenCalledWith('events', [{ id: 1 }, { id: 2 }])
      expect(setup(wrapper).selected).toEqual([])
      expect(setup(wrapper).filters).toMatchObject({ search: '', first: 0 })
    })
  })
})
