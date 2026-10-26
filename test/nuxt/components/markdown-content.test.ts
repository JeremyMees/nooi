import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MarkdownContent from '~/components/MarkdownContent.vue'

describe('MarkdownContent', () => {
  it('renders the description as markdown', async () => {
    const wrapper = await mountSuspended(MarkdownContent, {
      props: { content: 'Neem je **eigen** penseel' },
    })

    expect(wrapper.find('.markdown-content strong').text()).toBe('eigen')
  })
})
