<script setup lang="ts">
defineProps<{ event: EventRow }>()
</script>

<template>
  <div class="bg-primary-50 rounded-lg shadow flex gap-2 overflow-hidden">
    <NuxtImg
      v-if="event.imageUrl"
      :src="event.imageUrl"
      :alt="event.name"
      sizes="400px"
      class="w-full max-w-[400px] aspect-video"
    />
    <div>
      {{ event }}
    </div>
  </div>
</template>
