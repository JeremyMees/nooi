import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IconLabel from '~/components/IconLabel.vue'

describe('IconLabel', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(IconLabel, {
      props: { icon: 'calendar' },
      slots: { default: 'Vandaag' },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the slot content', async () => {
    const wrapper = await mountSuspended(IconLabel, {
      props: { icon: 'calendar' },
      slots: { default: 'Vandaag' },
    })

    expect(wrapper.find('[test-id="icon-label-text"]').text()).toBe('Vandaag')
  })

  it('shows the lucide icon with the given name', async () => {
    const wrapper = await mountSuspended(IconLabel, {
      props: { icon: 'clock' },
    })

    expect(wrapper.findComponent({ name: 'UIcon' }).props('name')).toBe(
      'i-lucide-clock',
    )
  })
})
