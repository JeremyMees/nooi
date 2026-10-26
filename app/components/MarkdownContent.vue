<script setup lang="ts">
const props = defineProps<{ content: string }>()

const html = computed<string>(() => renderMarkdown(props.content))
</script>

<template>
  <div class="markdown-content" v-html="html" />
</template>
