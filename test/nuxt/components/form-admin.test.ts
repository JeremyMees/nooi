import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FormEvent from '~/components/form/Event.vue'
import FormRoster from '~/components/form/Roster.vue'
import { setup } from '~~/test/mock'

const components = [
  ['FormEvent', FormEvent],
  ['FormRoster', FormRoster],
] as const

async function mount(component: (typeof components)[number][1]) {
  return mountSuspended(component, { global: { stubs: { FormKit: true } } })
}

describe.each(components)('%s time rounding', (_name, component) => {
  let wrapper: Awaited<ReturnType<typeof mount>>

  beforeEach(async () => {
    wrapper = await mount(component)
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
  it('renders every roster field', async () => {
    const wrapper = await mount(FormRoster)

    for (const name of [
      'day',
      'start',
      'end',
      'status',
      'minSpots',
      'allowReservation',
    ]) {
      expect(wrapper.find(`[name="${name}"]`).exists()).toBe(true)
    }
  })

  it('defaults the status to the open game cafe', async () => {
    const wrapper = await mount(FormRoster)

    expect(wrapper.find('[name="status"]').attributes('value')).toBe('game')
  })
})
