<script setup lang="ts">
defineProps<{ event: EventReservation }>()
</script>

<template>
  <div class="bg-white border-2 border-primary shadow rounded-lg flex flex-col gap-2 overflow-hidden">
    <NuxtImg
      v-if="event.imageUrl"
      :src="event.imageUrl"
      :alt="event.name"
      sizes="400px"
      class="w-full aspect-[16/8] border-b-2 border-primary"
    />
    <div class="p-4 flex flex-col gap-y-2 justify-between h-full">
      <div class="space-y-2">
        <h2>
          {{ event.name }}
        </h2>
        <EventTags :event="event" class="hidden sm:flex" />
        <p v-if="event.description" class="line-clamp-4">
          {{ event.description }}
        </p>
      </div>
      <Button
        class="self-end"
        @click="addQuery({ event: event.id, status: 'info' })"
      >
        Meer informatie
      </Button>
    </div>
  </div>
</template>
