import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EventTag from '~/components/EventTag.vue'
import { mockEvent } from '~~/test/mock'

describe('EventTag', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(EventTag, {
      props: { event: mockEvent },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the event name', async () => {
    const wrapper = await mountSuspended(EventTag, {
      props: { event: mockEvent },
    })

    expect(wrapper.find('[test-id="event-tag"]').text()).toBe(mockEvent.name)
  })

  it('renders as a button', async () => {
    const wrapper = await mountSuspended(EventTag, {
      props: { event: mockEvent },
    })

    expect(wrapper.find('[test-id="event-tag"]').element.tagName).toBe('BUTTON')
  })
})
