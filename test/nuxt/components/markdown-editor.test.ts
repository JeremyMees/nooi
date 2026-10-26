import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MarkdownEditor from '~/components/MarkdownEditor.vue'

const stubs = {
  UEditor: {
    name: 'UEditor',
    props: ['modelValue', 'contentType'],
    emits: ['update:modelValue'],
    template:
      '<div><textarea :value="modelValue" :data-type="contentType" /><slot :editor="{}" /></div>',
  },
  UEditorToolbar: {
    name: 'UEditorToolbar',
    props: ['items'],
    template: '<div test-id="editor-toolbar" />',
  },
}

async function mount(content = '') {
  return mountSuspended(MarkdownEditor, {
    props: { content, 'onUpdate:content': () => {} },
    global: { stubs },
  })
}

describe('MarkdownEditor', () => {
  it('edits the content as markdown', async () => {
    const wrapper = await mount('# Kom schilderen')
    const textarea = wrapper.find('textarea')

    expect(textarea.element.value).toBe('# Kom schilderen')
    expect(textarea.attributes('data-type')).toBe('markdown')
  })

  it('sends edits back through the model', async () => {
    const wrapper = await mount('start')

    await wrapper
      .findComponent({ name: 'UEditor' })
      .vm.$emit('update:modelValue', 'edited')

    expect(wrapper.emitted('update:content')?.[0]).toEqual(['edited'])
  })

  it('offers a toolbar for the markdown the calendar renders', async () => {
    const wrapper = await mount()
    const items = wrapper
      .findComponent({ name: 'UEditorToolbar' })
      .props('items')
      .flat()

    expect(items.map(({ kind }: { kind: string }) => kind)).toEqual(
      expect.arrayContaining(['heading', 'mark', 'bulletList', 'link']),
    )
  })
})
