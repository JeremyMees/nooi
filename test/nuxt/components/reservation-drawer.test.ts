import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import ReservationDrawer from '~/components/ReservationDrawer.vue'
import { mockEvent, mockRoster, mockRoute, setup } from '~~/test/mock'

let selectedEvent: EventRow | null
let current: RosterRow[]
let query: Record<string, unknown>

const hoisted = vi.hoisted(() => ({
  book: vi.fn(),
  toastAdd: vi.fn(),
}))

const store = {
  drawerOpen: true,
  get selectedEvent() {
    return selectedEvent
  },
  form: { day: '2026-07-10' },
  book: hoisted.book,
}

mockNuxtImport('useReservationStore', () => () => store)
mockNuxtImport('useRosterStore', () => () => ({
  get current() {
    return current
  },
}))
mockNuxtImport('useToast', () => () => ({ add: hoisted.toastAdd }))
mockNuxtImport('useRoute', () => () => mockRoute(query))

const stubs = {
  USlideover: {
    template: '<div><slot name="title" /><slot name="body" /></div>',
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
    store.drawerOpen = true
    store.form.day = '2026-07-10'
    hoisted.book.mockReset()
    hoisted.book.mockResolvedValue({ status: 'confirmed' })
    hoisted.toastAdd.mockReset()
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
      spots: '2',
      start: '19:00',
    }

    it('books a table with the type from the url', async () => {
      query = { type: 'game' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.book).toHaveBeenCalledWith({
        ...form,
        spots: 2,
        type: 'game',
        day: '2026-07-10',
      })
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'We hebben je boeking goed ontvangen. Tot binnenkort!',
        }),
      )
    })

    it('falls back to a plain reservation without a type', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.book).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'reservation' }),
      )
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Je reservatie is bevestigd. Tot binnenkort!',
        }),
      )
    })

    it('signs up for the selected event by id only', async () => {
      selectedEvent = {
        ...mockEvent,
        id: 9,
        name: 'Minipainting',
        onlinePayment: false,
        price: null,
      }
      query = { event: '9' }
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.book).toHaveBeenCalledWith({
        ...form,
        spots: 2,
        type: 'event',
        event: 9,
      })
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          description:
            'Je bent ingeschreven voor Minipainting. Tot binnenkort!',
        }),
      )
    })

    it('keeps the drawer open while the payment redirect happens', async () => {
      selectedEvent = { ...mockEvent, id: 9, onlinePayment: true, price: 12 }
      query = { event: '9' }
      hoisted.book.mockResolvedValue({
        status: 'payment',
        url: 'https://checkout.stripe.com/pay/cs',
      })
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(store.drawerOpen).toBe(true)
      expect(hoisted.toastAdd).not.toHaveBeenCalled()
    })

    it('closes the drawer once a free booking is confirmed', async () => {
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(store.drawerOpen).toBe(false)
      expect(setup(wrapper).loading).toBe(false)
      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Gelukt!' }),
      )
    })

    it('warns the visitor when the reservation cannot be made', async () => {
      hoisted.book.mockRejectedValue(new Error('Event is full'))
      const wrapper = await mount()

      await setup(wrapper).submit({ ...form })

      expect(hoisted.toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Oeps!' }),
      )
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
