<script setup lang="ts">
defineProps<{ event: EventRow }>()
</script>

<template>
  <button
    class="whitespace-nowrap text-[10px] sm:text-xs w-fit h-fit px-1 sm:px-2 py-px rounded shadow transition-colors duration-300"
    :class="getEventColor(event.theme)"
  >
    {{ event.name }}
  </button>
</template>
