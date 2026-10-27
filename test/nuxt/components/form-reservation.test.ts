import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import FormReservation from '~/components/form/Reservation.vue'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { mockEventReservation, mockRoster, mockRoute } from '~~/test/mock'

let selectedEvent: EventReservation | undefined
let current: RosterRow[]
let query: Record<string, unknown>

const form = reactive({
  day: '2026-07-10' as string | undefined,
  name: '',
  number: '',
  mail: '',
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
    props: { submitLabel: 'Reserveren' },
    global: {
      stubs: { AnimationReveal: { template: '<div><slot /></div>' } },
    },
  })
}

const field = (wrapper: VueWrapper, name: string) =>
  wrapper.find(`[test-id="booking-${name}"]`)

const components = {
  start: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[0]!,
  end: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[1]!,
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

async function fillContact(wrapper: VueWrapper) {
  await type(wrapper, 'name', 'Jef Van Laer')
  await type(wrapper, 'number', '0496264466')
  await type(wrapper, 'email', 'jef@example.com')
}

const submitted = (wrapper: VueWrapper) => wrapper.emitted('submit')?.[0]?.[0]

describe('FormReservation', () => {
  beforeEach(() => {
    selectedEvent = undefined
    Object.assign(form, { day: '2026-07-10', name: '', number: '', mail: '' })
    query = { type: 'reservation' }
    current = [
      {
        ...mockRoster,
        id: 1,
        status: 'reservation',
        start: '20:00',
        end: '23:00',
      },
      { ...mockRoster, id: 2, status: 'game', start: '18:00', end: '20:00' },
    ]
  })

  it('always asks for the contact details', async () => {
    const wrapper = await mount()

    expect(field(wrapper, 'name').exists()).toBe(true)
    expect(field(wrapper, 'number').exists()).toBe(true)
    expect(field(wrapper, 'email').exists()).toBe(true)
    expect(field(wrapper, 'submit').text()).toBe('Reserveren')
  })

  it('fills in the remembered contact details', async () => {
    Object.assign(form, {
      name: 'Jef Van Laer',
      number: '0496264466',
      mail: 'jef@example.com',
    })

    const wrapper = await mount()

    expect((field(wrapper, 'name').element as HTMLInputElement).value).toBe(
      'Jef Van Laer',
    )
    expect((field(wrapper, 'email').element as HTMLInputElement).value).toBe(
      'jef@example.com',
    )
  })

  it('remembers what the visitor types in the store', async () => {
    const wrapper = await mount()

    await type(wrapper, 'email', 'an@example.com')

    expect(form.mail).toBe('an@example.com')
  })

  describe('time slots', () => {
    it('lists the opening hours for the current type in order', async () => {
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

      expect(field(wrapper, 'hours').text()).toMatch(/18:00 - 20:00,\s+21:00/)
    })

    it('asks for an end time when reserving', async () => {
      const wrapper = await mount()

      expect(field(wrapper, 'end').exists()).toBe(true)
    })

    it('asks only for a moment when booking a table', async () => {
      query = { type: 'game' }

      const wrapper = await mount()

      expect(wrapper.text()).toContain('Tijdstip')
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

    it('refuses a start time outside the opening hours', async () => {
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'start', '19:00')
      await pick(wrapper, 'end', '21:00')
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(submitted(wrapper)).toBeUndefined()
      expect(wrapper.text()).toContain('Wij zijn niet open op dit uur')
    })

    it('needs a reservation of at least an hour', async () => {
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'start', '20:30')
      await pick(wrapper, 'end', '21:00')
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(submitted(wrapper)).toBeUndefined()
      expect(wrapper.text()).toContain('Reservatie mag minimum 1 uur zijn')
    })

    it('counts an hour from the half hour correctly', async () => {
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'start', '20:30')
      await pick(wrapper, 'end', '21:30')
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(submitted(wrapper)).toMatchObject({ start: '20:30', end: '21:30' })
    })
  })

  describe('spots', () => {
    it('caps a reservation at the house maximum', async () => {
      const wrapper = await mount()

      expect(components.spots(wrapper).props()).toMatchObject({
        min: 1,
        max: 70,
      })
    })

    it('caps a table booking at eight', async () => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]

      const wrapper = await mount()

      expect(components.spots(wrapper).props('max')).toBe(8)
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

      expect(components.spots(wrapper).props()).toMatchObject({
        min: 2,
        max: 15,
      })
    })

    it('takes the minimum from the roster when there is no event', async () => {
      current = [{ ...mockRoster, status: 'reservation', minSpots: 4 }]

      const wrapper = await mount()

      expect(components.spots(wrapper).props('min')).toBe(4)
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

  describe('large groups', () => {
    beforeEach(() => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]
    })

    it('points groups of eight or more at the contact page', async () => {
      const wrapper = await mount()

      await pick(wrapper, 'spots', 8)

      expect(field(wrapper, 'large-group').exists()).toBe(true)
    })

    it('stays quiet for a small table booking', async () => {
      const wrapper = await mount()

      await pick(wrapper, 'spots', 4)

      expect(field(wrapper, 'large-group').exists()).toBe(false)
    })
  })

  describe('submit', () => {
    it('hands over a reservation with its times', async () => {
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'start', '20:00')
      await pick(wrapper, 'end', '22:00')
      await pick(wrapper, 'spots', 4)
      await submit(wrapper)

      expect(submitted(wrapper)).toEqual({
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
        spots: 4,
        exclusive: false,
        start: '20:00',
        end: '22:00',
      })
    })

    it('hands over a table booking without an end time', async () => {
      query = { type: 'game' }
      current = [{ ...mockRoster, status: 'game' }]
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'start', '19:00')
      await pick(wrapper, 'spots', 2)
      await submit(wrapper)

      expect(submitted(wrapper)).toEqual({
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
        spots: 2,
        exclusive: false,
        start: '19:00',
      })
    })

    it('hands over an event signup without times', async () => {
      selectedEvent = { ...mockEventReservation, minSpots: 1, spots: 20 }
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'spots', 2)
      await type(wrapper, 'info', 'Wij brengen taart mee')
      await submit(wrapper)

      expect(submitted(wrapper)).toEqual({
        name: 'Jef Van Laer',
        number: '0496264466',
        email: 'jef@example.com',
        spots: 2,
        exclusive: false,
        info: 'Wij brengen taart mee',
      })
    })

    it.each([
      ['name', 'Jef 123', 'Enkel letters en spaties'],
      ['number', '+32496264466', 'Telefoonnummer moet 10 tot 12 cijfers zijn'],
      ['email', 'jef@', 'Geen geldig e-mailadres'],
    ])('refuses %s "%s"', async (name, value, message) => {
      selectedEvent = { ...mockEventReservation, minSpots: 1, spots: 20 }
      const wrapper = await mount()

      await fillContact(wrapper)
      await pick(wrapper, 'spots', 2)
      await type(wrapper, name, value)
      await submit(wrapper)

      expect(submitted(wrapper)).toBeUndefined()
      expect(wrapper.text()).toContain(message)
    })
  })
})
