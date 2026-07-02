import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import EventModal from '~/components/EventModal.vue'
import { mockEventReservation, mockRoute } from '~~/test/mock'

let informationEvent: EventReservation | null
let query: Record<string, unknown>

mockNuxtImport('useReservationStore', () => () => ({
  get informationEvent() {
    return informationEvent
  },
}))
mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))
mockNuxtImport('useRoute', () => () => mockRoute(query))

const stubs = {
  Drawer: {
    template: '<div><slot name="header" /><slot /></div>',
  },
  VMdEditor: true,
}

async function mount() {
  return mountSuspended(EventModal, { global: { stubs } })
}

describe('EventModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0))
    query = {}
    informationEvent = {
      ...mockEventReservation,
      spots: 20,
      external: false,
      bookingDeadline: '2026-07-09',
      reservations: [{ id: 1, spots: 2 }],
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(EventModal, {
      global: { stubs: { ...stubs, Button: true } },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('shows the event name in the header', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-modal-title"]').text()).toBe(
      mockEventReservation.name,
    )
  })

  it('renders the event tags', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-tags"]').exists()).toBe(true)
  })

  it('shows the sign-up button before the deadline when spots remain', async () => {
    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-modal-submit"]').exists()).toBe(true)
    expect(wrapper.find('[test-id="event-modal-full"]').exists()).toBe(false)
  })

  it('shows the full message and hides sign-up when the event is full', async () => {
    informationEvent = {
      ...mockEventReservation,
      spots: 4,
      external: false,
      reservations: [{ id: 1, spots: 4 }],
    }

    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-modal-full"]').exists()).toBe(true)
    expect(wrapper.find('[test-id="event-modal-submit"]').exists()).toBe(false)
  })

  it('hides the sign-up button after the booking deadline', async () => {
    informationEvent = {
      ...mockEventReservation,
      spots: 20,
      external: false,
      bookingDeadline: '2026-06-01',
      reservations: [],
    }

    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-modal-submit"]').exists()).toBe(false)
  })

  it('does not render tags when there is no information event', async () => {
    informationEvent = null

    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-tags"]').exists()).toBe(false)
  })
})
