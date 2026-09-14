import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MarkdownEditor from '~/components/MarkdownEditor.vue'

const stubs = {
  'v-md-editor': {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<textarea :value="modelValue" />',
  },
}

async function mount(content = '') {
  return mountSuspended(MarkdownEditor, {
    props: { content, 'onUpdate:content': () => {} },
    global: { stubs },
  })
}

describe('MarkdownEditor', () => {
  it('shows the content it is given', async () => {
    const wrapper = await mount('# Kom schilderen')

    expect(wrapper.find('textarea').element.value).toBe('# Kom schilderen')
  })

  it('sends edits back through the model', async () => {
    const wrapper = await mount('start')

    await wrapper
      .findComponent(stubs['v-md-editor'])
      .vm.$emit('update:modelValue', 'edited')

    expect(wrapper.emitted('update:content')?.[0]).toEqual(['edited'])
  })
})
