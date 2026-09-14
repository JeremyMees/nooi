import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import ReservationDrawer from '~/components/ReservationDrawer.vue'
import { mockEvent, mockRoster, mockRoute, setup } from '~~/test/mock'

let selectedEvent: EventRow | null
let current: RosterRow[]
let query: Record<string, unknown>

const hoisted = vi.hoisted(() => ({
  createReservation: vi.fn(),
  createSession: vi.fn(),
  toastAdd: vi.fn(),
  useFetch: vi.fn(),
}))

const store = {
  drawerOpen: true,
  get selectedEvent() {
    return selectedEvent
  },
  form: { day: '2026-07-10' },
  createReservation: hoisted.createReservation,
  createSession: hoisted.createSession,
}

mockNuxtImport('useReservationStore', () => () => store)
mockNuxtImport('useFetch', () => hoisted.useFetch)
mockNuxtImport('useRosterStore', () => () => ({
  get current() {
    return current
  },
}))
mockNuxtImport('useToast', () => () => ({ add: hoisted.toastAdd }))
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

// Nuxt's useFetch macro appends a generated key, so only assert the real args.
function fetchCall() {
  const [endpoint, options] = hoisted.useFetch.mock.calls[0] ?? []

  return { endpoint, options }
}

describe('ReservationDrawer', () => {
  beforeEach(() => {
    selectedEvent = null
    query = {}
    current = [{ ...mockRoster, allowReservation: true }]
    store.drawerOpen = true
    store.form.day = '2026-07-10'
    hoisted.createReservation.mockReset()
    hoisted.createReservation.mockResolvedValue({ id: 2599 })
    hoisted.createSession.mockReset()
    hoisted.toastAdd.mockReset()
    hoisted.useFetch.mockReset()
    hoisted.useFetch.mockResolvedValue({ data: ref(null), error: ref(null) })
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

  describe('submit', () => {
    const form = {
      name: 'Jef Van Laer',
      email: 'jef@example.com',
      number: '0496264466',
      spots: 2,
      type: 'reservation' as const,
      start: '19:00',
    }

    it('books a table with the type from the url', async () => {
      query = { type: 'game' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game',
          day: '2026-07-10',
          paymentNeeded: false,
        }),
      )
      expect(fetchCall()).toMatchObject({
        endpoint: '/api/mail/reservation-success',
        options: { method: 'POST' },
      })
    })

    it('falls back to a plain reservation without a type', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'reservation' }),
      )
      expect(fetchCall().endpoint).toBe('/api/mail/booking-success')
    })

    it('copies the timing of the event it signs up for', async () => {
      selectedEvent = {
        ...mockEvent,
        id: 9,
        name: 'Minipainting',
        day: '2026-09-14',
        start: '19:00',
        end: '22:00',
        onlinePayment: false,
        price: null,
      }
      query = { event: '9' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 9,
          day: '2026-09-14',
          start: '19:00',
          end: '22:00',
          type: 'event',
        }),
      )
      expect(fetchCall()).toMatchObject({
        endpoint: '/api/mail/event-success',
        options: { body: { props: { event: 'Minipainting' } } },
      })
    })

    it('sends the visitor to Stripe when the event is paid', async () => {
      selectedEvent = {
        ...mockEvent,
        id: 9,
        onlinePayment: true,
        price: 12,
      }
      query = { event: '9' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.createReservation).toHaveBeenCalledWith(
        expect.objectContaining({ paymentNeeded: true }),
      )
      expect(hoisted.createSession).toHaveBeenCalledWith(2599)
      expect(hoisted.useFetch).not.toHaveBeenCalled()
    })

    it('keeps the drawer open while the payment redirect happens', async () => {
      selectedEvent = { ...mockEvent, id: 9, onlinePayment: true, price: 12 }
      query = { event: '9' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(store.drawerOpen).toBe(true)
    })

    it('closes the drawer once a free booking is confirmed', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(store.drawerOpen).toBe(false)
      expect(setup(wrapper).loading).toBe(false)
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Gelukt!' }),
      )
    })

    it('warns the visitor when the reservation cannot be made', async () => {
      hoisted.createReservation.mockRejectedValue(new Error('insert failed'))
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ summary: 'Oeps!' }),
      )
      expect(hoisted.useFetch).not.toHaveBeenCalled()
    })
  })

  describe('clickedRosterItem', () => {
    it('picks the roster line named by the url', async () => {
      current = [
        { ...mockRoster, id: 1, allowReservation: true },
        { ...mockRoster, id: 2, allowReservation: false },
      ]
      query = { rosterIndex: '1' }

      const wrapper = await mount()

      expect(setup(wrapper).clickedRosterItem.id).toBe(2)
    })

    it('falls back to the first line for an index out of range', async () => {
      current = [{ ...mockRoster, id: 1, allowReservation: true }]
      query = { rosterIndex: '5' }

      const wrapper = await mount()

      expect(setup(wrapper).clickedRosterItem.id).toBe(1)
    })

    it('uses the first line when the url names none', async () => {
      current = [
        { ...mockRoster, id: 7, allowReservation: true },
        { ...mockRoster, id: 8, allowReservation: true },
      ]

      const wrapper = await mount()

      expect(setup(wrapper).clickedRosterItem.id).toBe(7)
    })
  })
})
