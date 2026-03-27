<script setup lang="ts">
defineProps<{ event: EventRow }>()
</script>

<template>
  <button
    class="bg-surface-50 whitespace-nowrap text-[10px] sm:text-xs w-fit h-fit px-1 sm:px-2 py-px rounded shadow"
  >
    {{ event.name }}
  </button>
</template>
