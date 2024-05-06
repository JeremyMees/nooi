<script setup lang="ts">
const store = useReservationStore()
</script>

<template>
  <div>
    <h2>
      Opkomende evenementen (slider?)
    </h2>
    <div class="flex flex-col gap-4">
      <EventCard
        v-for="event in store.events"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>
