<script setup lang="ts">
const content = defineModel<string>('content')
</script>

<template>
  <v-md-editor
    v-model="content"
    left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol hr | link image"
    right-toolbar="preview fullscreen"
    height="400px"
  />
</template>
