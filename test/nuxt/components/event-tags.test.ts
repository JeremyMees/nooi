import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EventTags from '~/components/EventTags.vue'
import { mockEventReservation } from '~~/test/mock'

describe('EventTags', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a day label with the formatted date', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    expect(wrapper.find('[test-id="event-tag-day"]').exists()).toBe(true)
    expect(
      wrapper.find('[test-id="event-tag-day"] .pi-calendar').exists(),
    ).toBe(true)
  })

  it('renders a time label with the start and end time', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    const time = wrapper.find('[test-id="event-tag-time"]')

    expect(time.text()).toContain('19:00')
    expect(time.text()).toContain('23:00')
  })

  it('renders the price with the online payment suffix', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    const price = wrapper.find('[test-id="event-tag-price"]')

    expect(price.text()).toContain('5')
    expect(price.text()).toContain('online')
  })

  it('shows the remaining free spots (spots minus reserved)', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    expect(wrapper.find('[test-id="event-tag-spots"]').text()).toContain('15')
  })

  it('renders one theme label per comma-separated theme', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    expect(wrapper.findAll('[test-id="event-tag-theme"]')).toHaveLength(2)
  })

  it('does not render the minimum-spots label when minSpots is 1', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: mockEventReservation },
    })

    expect(wrapper.find('[test-id="event-tag-min-spots"]').exists()).toBe(false)
  })

  it('renders the minimum-spots label when minSpots is greater than 1', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: { ...mockEventReservation, minSpots: 4 } },
    })

    const label = wrapper.find('[test-id="event-tag-min-spots"]')

    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('4')
  })

  it('shows "ter plaatse" when online payment is disabled', async () => {
    const wrapper = await mountSuspended(EventTags, {
      props: { event: { ...mockEventReservation, onlinePayment: false } },
    })

    expect(wrapper.find('[test-id="event-tag-price"]').text()).toContain(
      'ter plaatse',
    )
  })
})
