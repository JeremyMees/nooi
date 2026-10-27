import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FormAdminReservation from '~/components/form/AdminReservation.vue'
import FormDateInput from '~/components/form/DateInput.vue'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { mockEvent, mockReservation } from '~~/test/mock'

const getEvents = vi.fn()
let events: EventReservation[] = []

mockNuxtImport('useAdminStore', () => () => ({
  get events() {
    return events
  },
  getEvents,
}))

async function mount(reservation?: AdminReservationRow) {
  return mountSuspended(FormAdminReservation, {
    props: { reservation, submitLabel: 'Toevoegen' },
  })
}

const field = (wrapper: VueWrapper, name: string) =>
  wrapper.find(`[test-id="reservation-${name}"]`)

const selects = (wrapper: VueWrapper) =>
  wrapper.findAllComponents({ name: 'USelect' })

const components = {
  type: (wrapper: VueWrapper) => selects(wrapper)[0]!,
  event: (wrapper: VueWrapper) => selects(wrapper)[1]!,
  day: (wrapper: VueWrapper) => wrapper.findComponent(FormDateInput),
  start: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[0]!,
  spots: (wrapper: VueWrapper) =>
    wrapper.findComponent({ name: 'UInputNumber' }),
}

async function pick(
  wrapper: VueWrapper,
  name: keyof typeof components,
  value: unknown,
) {
  components[name](wrapper).vm.$emit('update:modelValue', value)
  await flushPromises()
}

async function type(wrapper: VueWrapper, name: string, value: string) {
  await field(wrapper, name).setValue(value)
  await flushPromises()
}

async function submit(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

async function fillGame(wrapper: VueWrapper) {
  await type(wrapper, 'name', 'Jef Van Laer')
  await pick(wrapper, 'day', '2026-09-14')
  await pick(wrapper, 'start', '19:00')
  await pick(wrapper, 'spots', 4)
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
        start: '19:00',
        end: '22:00',
        spots: 20,
        minSpots: 2,
        reservations: [
          { id: 1, spots: 2 },
          { id: 2, spots: 3 },
        ],
      },
    ]
  })

  it('loads the events it can link to on mount', async () => {
    await mount()

    expect(getEvents).toHaveBeenCalled()
  })

  describe('booking type', () => {
    it('asks for a day and time for a game booking', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'day').exists()).toBe(true)
      expect(field(wrapper, 'start').exists()).toBe(true)
      expect(field(wrapper, 'exclusive').exists()).toBe(true)
      expect(field(wrapper, 'event').exists()).toBe(false)
    })

    it('asks for an event instead once the type is event', async () => {
      const wrapper = await mount()

      await pick(wrapper, 'type', 'event')

      expect(field(wrapper, 'event').exists()).toBe(true)
      expect(field(wrapper, 'day').exists()).toBe(false)
      expect(field(wrapper, 'start').exists()).toBe(false)
      expect(field(wrapper, 'exclusive').exists()).toBe(false)
    })

    it('labels each event with its date', async () => {
      const wrapper = await mount()

      await pick(wrapper, 'type', 'event')

      expect(components.event(wrapper).props('items')).toEqual([
        { label: `Minipainting (${formatDateUI('2026-09-14')})`, value: 3 },
      ])
    })
  })

  describe('spots', () => {
    it('allows the house maximum when no event is linked', async () => {
      const wrapper = await mount()

      expect(components.spots(wrapper).props()).toMatchObject({
        min: 1,
        max: 70,
      })
    })

    it('limits the spots to what the linked event has left', async () => {
      const wrapper = await mount()

      await pick(wrapper, 'type', 'event')
      await pick(wrapper, 'event', 3)

      expect(components.spots(wrapper).props()).toMatchObject({
        min: 2,
        max: 15,
      })
    })

    it('falls back to the house maximum for an event without a cap', async () => {
      events = [{ ...events[0]!, spots: null, minSpots: 1 }]
      const wrapper = await mount()

      await pick(wrapper, 'type', 'event')
      await pick(wrapper, 'event', 3)

      expect(components.spots(wrapper).props()).toMatchObject({
        min: 1,
        max: 70,
      })
    })

    it('refuses more spots than the event has left', async () => {
      const wrapper = await mount()

      await type(wrapper, 'name', 'Jef Van Laer')
      await pick(wrapper, 'type', 'event')
      await pick(wrapper, 'event', 3)
      await pick(wrapper, 'spots', 16)
      await submit(wrapper)

      expect(wrapper.emitted('submit')).toBeUndefined()
      expect(wrapper.text()).toContain('Maximum 15')
    })
  })

  describe('submit', () => {
    it('sends a game booking with empty contact details as null', async () => {
      const wrapper = await mount()

      await fillGame(wrapper)
      await submit(wrapper)

      expect(wrapper.emitted('submit')).toEqual([
        [
          {
            name: 'Jef Van Laer',
            number: null,
            email: null,
            type: 'game',
            spots: 4,
            info: null,
            event: null,
            day: '2026-09-14',
            start: '19:00',
            end: null,
            exclusive: false,
          },
        ],
      ])
    })

    it('copies the timing of the linked event onto the booking', async () => {
      const wrapper = await mount()

      await type(wrapper, 'name', 'Jef Van Laer')
      await pick(wrapper, 'type', 'event')
      await pick(wrapper, 'event', 3)
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(wrapper.emitted('submit')![0]![0]).toEqual({
        name: 'Jef Van Laer',
        number: null,
        email: null,
        type: 'event',
        spots: 2,
        info: null,
        event: 3,
        day: '2026-09-14',
        start: '19:00',
        end: '22:00',
      })
    })

    it('needs an event once the type is event', async () => {
      const wrapper = await mount()

      await type(wrapper, 'name', 'Jef Van Laer')
      await pick(wrapper, 'type', 'event')
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(wrapper.emitted('submit')).toBeUndefined()
      expect(wrapper.text()).toContain('Selecteer een event')
    })

    it('starts from the booking that is being edited', async () => {
      const wrapper = await mount({
        ...mockReservation,
        number: '0470123456',
        type: 'event',
        event: { id: 3, name: 'Minipainting' },
        spots: 2,
      })

      await submit(wrapper)

      expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
        name: mockReservation.name,
        type: 'event',
        event: 3,
        spots: 2,
      })
    })
  })

  describe('validation', () => {
    it.each([
      ['name', 'Jef 123', 'Enkel letters en spaties'],
      ['name', 'Jef', 'Naam moet 5 tot 45 tekens zijn'],
      ['number', '04962644', 'Telefoonnummer moet 10 tot 12 cijfers zijn'],
      ['email', 'jef@', 'Geen geldig e-mailadres'],
      ['info', 'kort', 'Extra info moet 5 tot 500 tekens zijn'],
    ])('refuses %s "%s"', async (name, value, message) => {
      const wrapper = await mount()

      await fillGame(wrapper)
      await type(wrapper, name, value)
      await submit(wrapper)

      expect(wrapper.emitted('submit')).toBeUndefined()
      expect(wrapper.text()).toContain(message)
    })
  })
})
