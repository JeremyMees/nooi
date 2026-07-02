import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Loader from '~/components/Loader.vue'

describe('Loader', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountSuspended(Loader)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders an svg spinner', async () => {
    const wrapper = await mountSuspended(Loader)

    const loader = wrapper.find('[test-id="loader"]')

    expect(loader.exists()).toBe(true)
    expect(loader.element.tagName.toLowerCase()).toBe('svg')
  })
})
