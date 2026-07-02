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

  it('applies the primevue icon class for the given icon', async () => {
    const wrapper = await mountSuspended(IconLabel, {
      props: { icon: 'clock' },
    })

    expect(wrapper.find('[test-id="icon-label-icon"]').classes()).toContain(
      'pi-clock',
    )
  })
})
