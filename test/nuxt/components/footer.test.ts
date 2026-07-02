import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Footer from '~/components/Footer.vue'

describe('Footer', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(Footer)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders the footer', async () => {
    const wrapper = await mountSuspended(Footer)

    expect(wrapper.find('[test-id="footer"]').exists()).toBe(true)
  })

  it('renders all five social links opening in a new tab', async () => {
    const wrapper = await mountSuspended(Footer)

    const links = wrapper.findAll('[test-id="footer-socials"] a')

    expect(links).toHaveLength(5)
    expect(links.every(link => link.attributes('target') === '_blank')).toBe(
      true,
    )
  })

  it('labels each social link for accessibility', async () => {
    const wrapper = await mountSuspended(Footer)

    const labels = wrapper
      .findAll('[test-id="footer-socials"] a')
      .map(link => link.attributes('aria-label'))

    expect(labels).toContain('Locatie')
    expect(labels).toContain('Instagram')
    expect(labels).toContain('Facebook')
  })

  it('links the terms and privacy page', async () => {
    const wrapper = await mountSuspended(Footer)

    expect(wrapper.find('[test-id="footer-terms"]').attributes('href')).toBe(
      'https://nooi.be/av-privacy/',
    )
  })

  it('shows the address and phone number', async () => {
    const wrapper = await mountSuspended(Footer)

    expect(wrapper.text()).toContain('Schotelstraat 3, 3290 Diest')
    expect(wrapper.text()).toContain('0496 67 23 61')
  })
})
