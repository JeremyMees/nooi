import { describe, expect, it } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormRoster from '~/components/form/Roster.vue'
import FormDateInput from '~/components/form/DateInput.vue'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { mockRoster } from '~~/test/mock'

async function mount(roster?: RosterRow) {
  return mountSuspended(FormRoster, {
    props: { roster, submitLabel: 'Toevoegen' },
  })
}

const fields = {
  day: (wrapper: VueWrapper) => wrapper.findComponent(FormDateInput),
  start: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[0]!,
  end: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[1]!,
  minSpots: (wrapper: VueWrapper) =>
    wrapper.findComponent({ name: 'UInputNumber' }),
}

async function fill(
  wrapper: VueWrapper,
  name: keyof typeof fields,
  value: unknown,
) {
  fields[name](wrapper).vm.$emit('update:modelValue', value)
  await flushPromises()
}

async function submit(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('FormRoster', () => {
  it('renders every roster field', async () => {
    const wrapper = await mount()

    for (const name of [
      'day',
      'start',
      'end',
      'status',
      'min-spots',
      'allow-reservation',
    ]) {
      expect(wrapper.find(`[test-id="roster-${name}"]`).exists()).toBe(true)
    }
    expect(wrapper.find('[test-id="roster-submit"]').text()).toBe('Toevoegen')
  })

  it('submits a new roster with the default status and spots', async () => {
    const wrapper = await mount()

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
    const wrapper = await mount({
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
    const wrapper = await mount()

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Dit veld is verplicht')
  })

  it('refuses more than a hundred people', async () => {
    const wrapper = await mount(mockRoster)

    await fill(wrapper, 'minSpots', 101)
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Maximum 100 personen')
  })
})
