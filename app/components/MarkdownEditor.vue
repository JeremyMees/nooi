<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

const content = defineModel<string>('content')

const items: EditorToolbarItem[][] = [
  [
    {
      kind: 'undo',
      icon: 'i-carbon-undo',
      tooltip: { text: 'Ongedaan maken' },
    },
    { kind: 'redo', icon: 'i-carbon-redo', tooltip: { text: 'Opnieuw' } },
  ],
  [
    { kind: 'heading', level: 1, label: 'H1', tooltip: { text: 'Titel 1' } },
    { kind: 'heading', level: 2, label: 'H2', tooltip: { text: 'Titel 2' } },
    { kind: 'heading', level: 3, label: 'H3', tooltip: { text: 'Titel 3' } },
  ],
  [
    {
      kind: 'mark',
      mark: 'bold',
      icon: 'i-carbon-text-bold',
      tooltip: { text: 'Vet' },
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-carbon-text-italic',
      tooltip: { text: 'Cursief' },
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-carbon-text-strikethrough',
      tooltip: { text: 'Doorstreept' },
    },
  ],
  [
    {
      kind: 'bulletList',
      icon: 'i-carbon-list-bulleted',
      tooltip: { text: 'Lijst' },
    },
    {
      kind: 'orderedList',
      icon: 'i-carbon-list-numbered',
      tooltip: { text: 'Genummerde lijst' },
    },
    {
      kind: 'blockquote',
      icon: 'i-carbon-quotes',
      tooltip: { text: 'Citaat' },
    },
    {
      kind: 'horizontalRule',
      icon: 'i-carbon-subtract-large',
      tooltip: { text: 'Lijn' },
    },
  ],
  [{ kind: 'link', icon: 'i-carbon-link', tooltip: { text: 'Link' } }],
]
</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="content"
    content-type="markdown"
    placeholder="Beschrijf het evenement…"
    class="markdown-content"
    :ui="{
      root: 'flex h-100 flex-col overflow-hidden rounded-lg border border-surface-200 bg-surface-0',
      content: 'min-h-0 overflow-y-auto',
      base: 'p-4 sm:px-4 [&_img]:mx-auto [&_img]:max-h-87.5 [&_img]:max-w-87.5 [&_img]:rounded-lg',
    }"
  >
    <UEditorToolbar
      :editor="editor"
      :items="items"
      class="shrink-0 border-b border-surface-200 bg-surface-0 px-2 py-1"
    />
  </UEditor>
</template>
