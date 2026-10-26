<script setup lang="ts">
defineProps<{ icon: string }>()
</script>

<template>
  <div
    test-id="icon-label"
    class="flex items-center gap-2 bg-primary-50 px-2 py-1 rounded-lg shadow"
  >
    <UIcon
      test-id="icon-label-icon"
      :name="`i-lucide-${icon}`"
      class="size-[1.125rem] text-primary"
    />
    <span test-id="icon-label-text">
      <slot />
    </span>
  </div>
</template>
