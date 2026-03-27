<script setup lang="ts">
defineProps<{ icon: string }>()
</script>

<template>
  <div class="flex items-center gap-2 bg-primary-50 px-2 py-1 rounded-lg shadow">
    <i :class="`pi pi-${icon} text-lg text-primary`" />
    <span>
      <slot />
    </span>
  </div>
</template>
