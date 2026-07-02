import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Navigation from '~/components/Navigation.vue'

describe('Navigation', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(Navigation)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('links the calendar item to the home route', async () => {
    const wrapper = await mountSuspended(Navigation)

    expect(wrapper.find('[test-id="nav-kalender"]').attributes('href')).toBe(
      '/',
    )
  })

  it('links the logo to the main nooi site', async () => {
    const wrapper = await mountSuspended(Navigation)

    expect(wrapper.find('[test-id="nav-home"]').attributes('href')).toBe(
      'https://nooi.be/',
    )
  })

  it('renders the external offer, location and info links', async () => {
    const wrapper = await mountSuspended(Navigation)

    expect(wrapper.find('[test-id="nav-aanbod"]').attributes('href')).toBe(
      'https://nooi.be/aanbod/',
    )
    expect(wrapper.find('[test-id="nav-locatie"]').attributes('href')).toBe(
      'https://nooi.be/locatie/',
    )
    expect(wrapper.find('[test-id="nav-info"]').attributes('href')).toBe(
      'https://nooi.be/info/',
    )
  })

  it('labels the navigation links with readable text', async () => {
    const wrapper = await mountSuspended(Navigation)

    expect(wrapper.find('[test-id="nav-kalender"]').text()).toBe('kalender')
    expect(wrapper.find('[test-id="nav-info"]').text()).toBe('info')
  })
})
