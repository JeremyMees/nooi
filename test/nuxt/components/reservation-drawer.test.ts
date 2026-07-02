import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import ReservationDrawer from '~/components/ReservationDrawer.vue'
import { mockEvent, mockRoster, mockRoute } from '~~/test/mock'

let selectedEvent: EventRow | null
let current: RosterRow[]
let query: Record<string, unknown>

mockNuxtImport('useReservationStore', () => () => ({
  drawerOpen: true,
  selectedEvent,
  form: { day: '2026-07-10' },
}))
mockNuxtImport('useRosterStore', () => () => ({
  get current() {
    return current
  },
}))
mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))
mockNuxtImport('useRoute', () => () => mockRoute(query))

const stubs = {
  Drawer: {
    template: '<div><slot name="header" /><slot /></div>',
  },
  FormKit: true,
  FormReservation: true,
}

async function mount() {
  return mountSuspended(ReservationDrawer, { global: { stubs } })
}

describe('ReservationDrawer', () => {
  beforeEach(() => {
    selectedEvent = null
    query = {}
    current = [{ ...mockRoster, allowReservation: true }]
  })

  it('matches snapshot', async () => {
    const wrapper = await mount()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('shows the reservation/rental title by default', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="reservation-drawer-title"]').text()).toBe(
      'Reservatie / Verhuur',
    )
  })

  it('shows the table-booking title for a game booking', async () => {
    query = { type: 'game' }

    const wrapper = await mount()

    expect(wrapper.find('[test-id="reservation-drawer-title"]').text()).toBe(
      'Boek een tafel',
    )
  })

  it('shows the event sign-up title when an event is selected', async () => {
    selectedEvent = { ...mockEvent, name: 'Bordspellen avond' }

    const wrapper = await mount()

    expect(
      wrapper.find('[test-id="reservation-drawer-title"]').text(),
    ).toContain('Bordspellen avond')
  })

  it('renders the reservation form when booking is allowed', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="reservation-no-booking"]').exists()).toBe(
      false,
    )
    expect(wrapper.findComponent({ name: 'FormKit' }).exists()).toBe(true)
  })

  it('shows the no-booking notice when the slot does not allow reservations', async () => {
    current = [{ ...mockRoster, allowReservation: false }]

    const wrapper = await mount()

    expect(wrapper.find('[test-id="reservation-no-booking"]').exists()).toBe(
      true,
    )
  })
})
