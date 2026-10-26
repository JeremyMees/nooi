<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

const content = defineModel<string>('content')

const items: EditorToolbarItem[][] = [
  [
    {
      kind: 'undo',
      icon: 'i-lucide-undo-2',
      tooltip: { text: 'Ongedaan maken' },
    },
    { kind: 'redo', icon: 'i-lucide-redo-2', tooltip: { text: 'Opnieuw' } },
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
      icon: 'i-lucide-bold',
      tooltip: { text: 'Vet' },
    },
    {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic',
      tooltip: { text: 'Cursief' },
    },
    {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough',
      tooltip: { text: 'Doorstreept' },
    },
  ],
  [
    {
      kind: 'bulletList',
      icon: 'i-lucide-list',
      tooltip: { text: 'Lijst' },
    },
    {
      kind: 'orderedList',
      icon: 'i-lucide-list-ordered',
      tooltip: { text: 'Genummerde lijst' },
    },
    {
      kind: 'blockquote',
      icon: 'i-lucide-text-quote',
      tooltip: { text: 'Citaat' },
    },
    {
      kind: 'horizontalRule',
      icon: 'i-lucide-minus',
      tooltip: { text: 'Lijn' },
    },
  ],
  [{ kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }],
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
