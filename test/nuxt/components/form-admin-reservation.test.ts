import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FormAdminReservation from '~/components/form/AdminReservation.vue'
import { mockEvent, setup } from '~~/test/mock'

const getEvents = vi.fn()
let events: (EventRow | EventReservation)[] = []

mockNuxtImport('useAdminStore', () => () => ({
  get events() {
    return events
  },
  getEvents,
}))

async function mount() {
  return mountSuspended(FormAdminReservation, {
    global: { stubs: { FormKit: true } },
  })
}

function field(wrapper: Awaited<ReturnType<typeof mount>>, name: string) {
  return wrapper.find(`[name="${name}"]`)
}

describe('FormAdminReservation', () => {
  beforeEach(() => {
    getEvents.mockClear()
    events = [
      {
        ...mockEvent,
        id: 3,
        name: 'Minipainting',
        day: '2026-09-14',
        spots: 20,
        minSpots: 2,
      },
    ]
  })

  it('loads the events it can link to on mount', async () => {
    await mount()

    expect(getEvents).toHaveBeenCalled()
  })

  it('labels each event option with its date', async () => {
    const wrapper = await mount()

    expect(setup(wrapper).eventOptions).toEqual([
      { label: `Minipainting (${formatDateUI('2026-09-14')})`, value: '3' },
    ])
  })

  describe('booking type', () => {
    it('asks for a day and time for a game booking', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'day').exists()).toBe(true)
      expect(field(wrapper, 'start').exists()).toBe(true)
      expect(field(wrapper, 'event').exists()).toBe(false)
    })

    it('asks for an event instead once the type is event', async () => {
      const wrapper = await mount()

      setup(wrapper).type = 'event'
      await nextTick()

      expect(field(wrapper, 'event').exists()).toBe(true)
      expect(field(wrapper, 'day').exists()).toBe(false)
      expect(field(wrapper, 'start').exists()).toBe(false)
    })

    it('offers the exclusive option for everything but an event', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'exclusive').exists()).toBe(true)

      setup(wrapper).type = 'event'
      await nextTick()

      expect(field(wrapper, 'exclusive').exists()).toBe(false)
    })
  })

  describe('spots', () => {
    it('allows the house maximum when no event is linked', async () => {
      const wrapper = await mount()

      expect(setup(wrapper).spots).toEqual({ min: 1, max: 70 })
    })

    it('limits the spots to what the linked event has left', async () => {
      events = [
        {
          ...mockEvent,
          id: 3,
          spots: 20,
          minSpots: 2,
          reservations: [
            { id: 1, spots: 2 },
            { id: 2, spots: 3 },
          ],
        },
      ]
      const wrapper = await mount()

      setup(wrapper).selectedEvent = '3'
      await nextTick()

      expect(setup(wrapper).spots).toEqual({ min: 2, max: 15 })
    })

    it('falls back to the house maximum for an event without a cap', async () => {
      events = [{ ...mockEvent, id: 3, spots: null, minSpots: 1 }]
      const wrapper = await mount()

      setup(wrapper).selectedEvent = '3'
      await nextTick()

      expect(setup(wrapper).spots).toEqual({ min: 1, max: 70 })
    })

    it('falls back when the selected event is unknown', async () => {
      const wrapper = await mount()

      setup(wrapper).selectedEvent = '999'
      await nextTick()

      expect(setup(wrapper).spots).toEqual({ min: 1, max: 70 })
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

    it('leaves an exact half hour alone', async () => {
      const wrapper = await mount()

      setup(wrapper).start = '19:00'
      await nextTick()

      expect(setup(wrapper).start).toBe('19:00')
    })
  })
})
