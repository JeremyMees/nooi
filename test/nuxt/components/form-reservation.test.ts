import { beforeEach, describe, expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FormReservation from '~/components/form/Reservation.vue'
import {
  mockEventReservation,
  mockRoster,
  mockRoute,
  setup,
} from '~~/test/mock'

let selectedEvent: EventReservation | undefined
let current: RosterRow[]
let query: Record<string, unknown>

const form = reactive({
  day: '2026-07-10',
  name: '',
  number: '',
  mail: '',
  spots: '',
})

mockNuxtImport('useReservationStore', () => () => ({
  get selectedEvent() {
    return selectedEvent
  },
  form,
}))
mockNuxtImport('useRosterStore', () => () => ({
  get current() {
    return current
  },
}))
mockNuxtImport('useRoute', () => () => mockRoute(query))

async function mount() {
  return mountSuspended(FormReservation, {
    global: {
      stubs: {
        FormKit: true,
        AnimationReveal: { template: '<div><slot /></div>' },
      },
    },
  })
}

function field(wrapper: Awaited<ReturnType<typeof mount>>, name: string) {
  return wrapper.find(`[name="${name}"]`)
}

describe('FormReservation', () => {
  beforeEach(() => {
    selectedEvent = undefined
    form.day = '2026-07-10'
    form.spots = ''
    query = { type: 'reservation' }
    current = [
      {
        ...mockRoster,
        id: 1,
        status: 'reservation',
        start: '20:00',
        end: '22:00',
      },
      { ...mockRoster, id: 2, status: 'game', start: '18:00', end: '20:00' },
    ]
  })

  it('always asks for the contact details', async () => {
    const wrapper = await mount()

    expect(field(wrapper, 'name').exists()).toBe(true)
    expect(field(wrapper, 'number').exists()).toBe(true)
    expect(field(wrapper, 'email').exists()).toBe(true)
  })

  describe('time slots', () => {
    it('bounds the start time by the roster for the current type', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'start').attributes('min')).toBe('20:00')
      expect(field(wrapper, 'start').attributes('max')).toBe('22:00')
    })

    it('sorts multiple roster lines by start time', async () => {
      current = [
        {
          ...mockRoster,
          id: 1,
          status: 'reservation',
          start: '21:00',
          end: '23:00',
        },
        {
          ...mockRoster,
          id: 2,
          status: 'reservation',
          start: '18:00',
          end: '20:00',
        },
      ]

      const wrapper = await mount()

      expect(field(wrapper, 'start').attributes('min')).toBe('18:00')
      expect(field(wrapper, 'start').attributes('max')).toBe('23:00')
    })

    it('asks for an end time when reserving', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'end').exists()).toBe(true)
    })

    it('asks only for a moment when booking a table', async () => {
      query = { type: 'game' }

      const wrapper = await mount()

      expect(field(wrapper, 'start').attributes('label')).toBe('Tijdstip')
      expect(field(wrapper, 'end').exists()).toBe(false)
    })

    it('hides the time fields when the roster has nothing for this type', async () => {
      current = [{ ...mockRoster, status: 'occupied' }]

      const wrapper = await mount()

      expect(field(wrapper, 'start').exists()).toBe(false)
      expect(field(wrapper, 'spots').exists()).toBe(false)
    })

    it('hides the time fields for an event signup', async () => {
      selectedEvent = mockEventReservation

      const wrapper = await mount()

      expect(field(wrapper, 'start').exists()).toBe(false)
      expect(field(wrapper, 'spots').exists()).toBe(true)
    })
  })

  describe('spots', () => {
    it('caps a reservation at the house maximum', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'spots').attributes('max')).toBe('70')
      expect(field(wrapper, 'spots').attributes('min')).toBe('1')
    })

    it('caps a table booking at eight', async () => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]

      const wrapper = await mount()

      expect(field(wrapper, 'spots').attributes('max')).toBe('8')
    })

    it('caps an event at the seats still free', async () => {
      selectedEvent = {
        ...mockEventReservation,
        spots: 20,
        minSpots: 2,
        reservations: [
          { id: 1, spots: 2 },
          { id: 2, spots: 3 },
        ],
      }

      const wrapper = await mount()

      expect(field(wrapper, 'spots').attributes('max')).toBe('15')
      expect(field(wrapper, 'spots').attributes('min')).toBe('2')
    })

    it('takes the minimum from the roster when there is no event', async () => {
      current = [{ ...mockRoster, status: 'reservation', minSpots: 4 }]

      const wrapper = await mount()

      expect(field(wrapper, 'spots').attributes('min')).toBe('4')
    })
  })

  describe('extra fields', () => {
    it('offers the exclusive option only when reserving', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'exclusive').exists()).toBe(true)
    })

    it('hides the exclusive option for a table booking', async () => {
      query = { type: 'game' }

      const wrapper = await mount()

      expect(field(wrapper, 'exclusive').exists()).toBe(false)
    })

    it('always offers an extra info field', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'info').exists()).toBe(true)
    })
  })

  describe('time rounding', () => {
    it('rounds a start time to the nearest half hour', async () => {
      const wrapper = await mount()

      setup(wrapper).start = '19:20'
      await nextTick()

      expect(setup(wrapper).start).toBe('19:30')
    })

    it('rounds an end time up to the next hour', async () => {
      const wrapper = await mount()

      setup(wrapper).end = '21:50'
      await nextTick()

      expect(setup(wrapper).end).toBe('22:00')
    })

    it('leaves a time already on the hour alone', async () => {
      const wrapper = await mount()

      setup(wrapper).start = '19:00'
      await nextTick()

      expect(setup(wrapper).start).toBe('19:00')
    })
  })

  describe('large groups', () => {
    it('points groups of eight or more at the contact page', async () => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]
      const wrapper = await mount()

      form.spots = '8'
      await nextTick()

      expect(wrapper.html()).toContain('grotere groepen')
    })

    it('stays quiet for a small table booking', async () => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]
      const wrapper = await mount()

      form.spots = '4'
      await nextTick()

      expect(wrapper.html()).not.toContain('grotere groepen')
    })
  })
})
