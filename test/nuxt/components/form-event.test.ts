import { describe, expect, it } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormEvent from '~/components/form/Event.vue'
import FormDateInput from '~/components/form/DateInput.vue'
import FormTimeInput from '~/components/form/TimeInput.vue'
import { mockEvent } from '~~/test/mock'

async function mount(event?: EventRow) {
  return mountSuspended(FormEvent, {
    props: { event, submitLabel: 'Toevoegen' },
    global: { stubs: { MarkdownEditor: true } },
  })
}

const fields = {
  day: (wrapper: VueWrapper) => wrapper.findAllComponents(FormDateInput)[0]!,
  bookingDeadline: (wrapper: VueWrapper) =>
    wrapper.findAllComponents(FormDateInput)[1]!,
  start: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[0]!,
  end: (wrapper: VueWrapper) => wrapper.findAllComponents(FormTimeInput)[1]!,
  minSpots: (wrapper: VueWrapper) =>
    wrapper.findAllComponents({ name: 'UInputNumber' })[0]!,
  spots: (wrapper: VueWrapper) =>
    wrapper.findAllComponents({ name: 'UInputNumber' })[1]!,
  price: (wrapper: VueWrapper) =>
    wrapper.findAllComponents({ name: 'UInputNumber' })[2]!,
}

async function fill(
  wrapper: VueWrapper,
  name: keyof typeof fields,
  value: unknown,
) {
  fields[name](wrapper).vm.$emit('update:modelValue', value)
  await flushPromises()
}

async function type(wrapper: VueWrapper, name: string, value: string) {
  await wrapper.find(`[test-id="event-${name}"]`).setValue(value)
  await flushPromises()
}

async function submit(wrapper: VueWrapper) {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

async function fillRequired(wrapper: VueWrapper) {
  await type(wrapper, 'name', 'Minipainting')
  await type(wrapper, 'theme', 'Creatief, Hobby')
  await fill(wrapper, 'day', '2026-09-14')
  await fill(wrapper, 'start', '19:00')
  await fill(wrapper, 'bookingDeadline', '2026-09-12')
}

describe('FormEvent', () => {
  it('renders every event field', async () => {
    const wrapper = await mount()

    for (const name of [
      'name',
      'theme',
      'day',
      'start',
      'end',
      'booking-deadline',
      'min-spots',
      'spots',
      'price',
      'unit-price',
      'online-payment',
      'external',
    ]) {
      expect(wrapper.find(`[test-id="event-${name}"]`).exists()).toBe(true)
    }
    expect(wrapper.text()).toContain('Omschrijving')
    expect(wrapper.find('[test-id="event-submit"]').text()).toBe('Toevoegen')
  })

  it('submits a new event with empty optional fields as null', async () => {
    const wrapper = await mount()

    await fillRequired(wrapper)
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toEqual([
      [
        {
          name: 'Minipainting',
          theme: 'Creatief, Hobby',
          day: '2026-09-14',
          start: '19:00',
          end: null,
          bookingDeadline: '2026-09-12',
          minSpots: 1,
          spots: null,
          price: null,
          unitPrice: false,
          onlinePayment: false,
          external: false,
          description: '',
        },
      ],
    ])
  })

  it('starts from the event that is being edited, description included', async () => {
    const wrapper = await mount({
      ...mockEvent,
      description: 'Kom schilderen',
    })

    await submit(wrapper)

    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      name: mockEvent.name,
      day: mockEvent.day,
      description: 'Kom schilderen',
    })
  })

  it('sends a cleared end time as null so the database forgets it', async () => {
    const wrapper = await mount({ ...mockEvent, end: '22:00' })

    await fill(wrapper, 'end', undefined)
    await submit(wrapper)

    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({ end: null })
  })

  it('keeps the price and spots that were filled in', async () => {
    const wrapper = await mount()

    await fillRequired(wrapper)
    await fill(wrapper, 'spots', 12)
    await fill(wrapper, 'price', 7.5)
    await submit(wrapper)

    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      spots: 12,
      price: 7.5,
    })
  })

  it('refuses to submit without the required fields', async () => {
    const wrapper = await mount()

    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Dit veld is verplicht')
  })

  it('refuses a name of only spaces', async () => {
    const wrapper = await mount()

    await fillRequired(wrapper)
    await type(wrapper, 'name', '   ')
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it.each([
    ['spots', 101, 'Maximum 100 plaatsen'],
    ['price', 0.5, 'Minimum € 1'],
  ] as const)('refuses %s of %s', async (name, value, message) => {
    const wrapper = await mount()

    await fillRequired(wrapper)
    await fill(wrapper, name, value)
    await submit(wrapper)

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain(message)
  })
})
