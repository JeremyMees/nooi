<script setup lang="ts">
defineProps<{ icon: string }>()
</script>

<template>
  <div
    test-id="icon-label"
    class="flex items-center gap-2 bg-primary-50 px-2 py-1 rounded-lg shadow"
  >
    <i
      test-id="icon-label-icon"
      :class="`pi pi-${icon} text-lg text-primary`"
    />
    <span test-id="icon-label-text">
      <slot />
    </span>
  </div>
</template>
