import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormEvent from '~/components/form/Event.vue'
import FormRoster from '~/components/form/Roster.vue'
import FormDateInput from '~/components/form/DateInput.vue'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { mockRoster, setup } from '~~/test/mock'

async function mount(component: typeof FormEvent) {
  return mountSuspended(component, { global: { stubs: { FormKit: true } } })
}

describe('FormEvent time rounding', () => {
  let wrapper: Awaited<ReturnType<typeof mount>>

  beforeEach(async () => {
    wrapper = await mount(FormEvent)
  })

  it('rounds a start time down to the hour', async () => {
    setup(wrapper).start = '19:10'
    await nextTick()

    expect(setup(wrapper).start).toBe('19:00')
  })

  it('rounds a start time to the half hour', async () => {
    setup(wrapper).start = '19:20'
    await nextTick()

    expect(setup(wrapper).start).toBe('19:30')
  })

  it('rounds a start time up to the next hour', async () => {
    setup(wrapper).start = '19:50'
    await nextTick()

    expect(setup(wrapper).start).toBe('20:00')
  })

  it('wraps an end time past midnight back to zero', async () => {
    setup(wrapper).end = '23:50'
    await nextTick()

    expect(setup(wrapper).end).toBe('00:00')
  })

  it('leaves a time that already sits on a half hour alone', async () => {
    setup(wrapper).start = '19:30'
    await nextTick()

    expect(setup(wrapper).start).toBe('19:30')
  })

  it('leaves a time that already sits on the hour alone', async () => {
    setup(wrapper).end = '22:00'
    await nextTick()

    expect(setup(wrapper).end).toBe('22:00')
  })
})

describe('FormEvent', () => {
  it('renders every event field', async () => {
    const wrapper = await mount(FormEvent)

    for (const name of [
      'name',
      'theme',
      'day',
      'start',
      'end',
      'bookingDeadline',
      'minSpots',
      'spots',
      'price',
      'unitPrice',
      'onlinePayment',
      'external',
    ]) {
      expect(wrapper.find(`[name="${name}"]`).exists()).toBe(true)
    }
  })
})

describe('FormRoster', () => {
  async function mountRoster(roster?: RosterRow) {
    return mountSuspended(FormRoster, {
      props: { roster, submitLabel: 'Toevoegen' },
    })
  }

  const field = (wrapper: VueWrapper, name: string) =>
    wrapper.find(`[test-id="roster-${name}"]`)

  const pickers = {
    day: (wrapper: VueWrapper) => wrapper.findComponent(FormDateInput),
    start: (wrapper: VueWrapper) =>
      wrapper.findAllComponents(FormTimeInput)[0]!,
    end: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[1]!,
  }

  async function fill(wrapper: VueWrapper, name: string, value: string) {
    if (name in pickers) {
      pickers[name as keyof typeof pickers](wrapper).vm.$emit(
        'update:modelValue',
        value,
      )
    } else {
      await field(wrapper, name).setValue(value)
    }
    await flushPromises()
  }

  async function submit(wrapper: VueWrapper) {
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  it('renders every roster field', async () => {
    const wrapper = await mountRoster()

    for (const name of [
      'day',
      'start',
      'end',
      'status',
      'min-spots',
      'allow-reservation',
    ]) {
      expect(field(wrapper, name).exists()).toBe(true)
    }
    expect(wrapper.find('[test-id="roster-submit"]').text()).toBe('Toevoegen')
  })

  it('submits a new roster with the default status and spots', async () => {
    const wrapper = await mountRoster()

    await fill(wrapper, 'day', '2026-07-10')
    await fill(wrapper, 'start', '18:00')
    await fill(wrapper, 'end', '23:00')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          day: '2026-07-10',
          start: '18:00',
          end: '23:00',
          status: 'game',
          minSpots: 1,
          allowReservation: true,
        },
      ],
    ])
  })

  it('starts from the roster that is being edited', async () => {
    const wrapper = await mountRoster({
      ...mockRoster,
      status: 'occupied',
      minSpots: 4,
      allowReservation: false,
    })

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          day: '2026-07-10',
          start: '18:00',
          end: '23:00',
          status: 'occupied',
          minSpots: 4,
          allowReservation: false,
        },
      ],
    ])
  })

  it('refuses to submit without a day and times', async () => {
    const wrapper = await mountRoster()

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Dit veld is verplicht')
  })

  it('refuses more than a hundred people', async () => {
    const wrapper = await mountRoster({ ...mockRoster, minSpots: 1 })

    await fill(wrapper, 'min-spots', '101')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Maximum 100 personen')
  })

  it.each([
    ['start', '19:10', '19:00'],
    ['start', '19:20', '19:30'],
    ['start', '19:50', '20:00'],
    ['end', '23:50', '00:00'],
    ['end', '22:00', '22:00'],
  ])('rounds %s %s to %s', async (name, typed, expected) => {
    const wrapper = await mountRoster()

    await fill(wrapper, name, typed)

    expect(pickers[name as 'start' | 'end'](wrapper).props('modelValue')).toBe(
      expected,
    )
  })
})
