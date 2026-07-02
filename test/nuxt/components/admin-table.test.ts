import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import AdminTable from '~/components/AdminTable.vue'

const fetchData = vi.fn()

mockNuxtImport('useAdminStore', () => () => ({
  data: {
    events: { data: [], count: 0, loading: false },
    reservations: { data: [], count: 0, loading: false },
    rosters: { data: [], count: 0, loading: false },
  },
  events: [],
  fetchData,
  removeData: vi.fn(),
  createData: vi.fn(),
  updateData: vi.fn(),
}))

describe('AdminTable', () => {
  beforeEach(() => {
    fetchData.mockClear()
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
})
