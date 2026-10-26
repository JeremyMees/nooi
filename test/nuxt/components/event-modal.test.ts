import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import EventModal from '~/components/EventModal.vue'
import { mockEventReservation, mockRoute, setup } from '~~/test/mock'

const informationEvent = shallowRef<EventReservation | null>(null)
let query: Record<string, unknown>

mockNuxtImport('useReservationStore', () => () => ({
  get informationEvent() {
    return informationEvent.value
  },
}))
const hoisted = vi.hoisted(() => ({
  removeQuery: vi.fn(),
  addQuery: vi.fn(),
}))

mockNuxtImport('useToast', () => () => ({ add: vi.fn() }))
mockNuxtImport('removeQuery', () => hoisted.removeQuery)
mockNuxtImport('addQuery', () => hoisted.addQuery)
mockNuxtImport('useRoute', () => () => mockRoute(query))

const stubs = {
  USlideover: {
    template: '<div><slot name="title" /><slot name="body" /></div>',
  },
  MarkdownContent: true,
}

async function mount() {
  return mountSuspended(EventModal, { global: { stubs } })
}

describe('EventModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 12, 0, 0))
    query = {}
    hoisted.removeQuery.mockClear()
    hoisted.addQuery.mockClear()
    informationEvent.value = {
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
      global: { stubs: { ...stubs, UButton: true } },
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
    informationEvent.value = {
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
    informationEvent.value = {
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
    informationEvent.value = null

    const wrapper = await mount()

    expect(wrapper.find('[test-id="event-tags"]').exists()).toBe(false)
  })

  describe('visibility', () => {
    it('opens itself when an event is selected for info', async () => {
      informationEvent.value = null
      const wrapper = await mount()

      expect(setup(wrapper).visible).toBe(false)

      informationEvent.value = { ...mockEventReservation, spots: 20 }
      await nextTick()

      expect(setup(wrapper).visible).toBe(true)
    })

    it('clears the info query when the visitor closes it', async () => {
      query = { status: 'info', event: '1' }
      const wrapper = await mount()

      setup(wrapper).visible = true
      await nextTick()
      setup(wrapper).visible = false
      await nextTick()

      expect(hoisted.removeQuery).toHaveBeenCalledWith(['event', 'status'])
    })

    it('leaves the query alone when it was not opened from the url', async () => {
      query = {}
      const wrapper = await mount()

      setup(wrapper).visible = true
      await nextTick()
      setup(wrapper).visible = false
      await nextTick()

      expect(hoisted.removeQuery).not.toHaveBeenCalled()
    })
  })

  describe('availability', () => {
    it('counts an event with every seat taken as full', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        spots: 5,
        reservations: [
          { id: 1, spots: 2 },
          { id: 2, spots: 3 },
        ],
      }

      const wrapper = await mount()

      expect(setup(wrapper).isFull).toBe(true)
    })

    it('counts an event with seats left as open', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        spots: 20,
        reservations: [{ id: 1, spots: 2 }],
      }

      const wrapper = await mount()

      expect(setup(wrapper).isFull).toBe(false)
    })

    it('never calls an event without a seat limit full', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        spots: null,
        reservations: [{ id: 1, spots: 99 }],
      }

      const wrapper = await mount()

      expect(setup(wrapper).isFull).toBe(false)
    })

    it('closes signups once the deadline has passed', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        bookingDeadline: '2026-07-01',
      }

      const wrapper = await mount()

      expect(setup(wrapper).afterDeadline).toBe(true)
    })

    it('keeps signups open before the deadline', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        bookingDeadline: '2026-08-01',
      }

      const wrapper = await mount()

      expect(setup(wrapper).afterDeadline).toBe(false)
    })

    it('treats an empty deadline as no deadline', async () => {
      informationEvent.value = {
        ...mockEventReservation,
        bookingDeadline: '',
      }

      const wrapper = await mount()

      expect(setup(wrapper).afterDeadline).toBe(false)
    })
  })

  it('switches the drawer to signing up when the visitor accepts', async () => {
    const wrapper = await mount()

    await wrapper.find('[test-id="event-modal-submit"]').trigger('click')

    expect(hoisted.addQuery).toHaveBeenCalledWith({ status: 'reservation' })
  })
})
