<script setup lang="ts">
const props = defineProps<{ event: EventReservation }>()

const freeSpots = computed<number|undefined>(() => {
  if (props.event.spots) {
    return props.event.spots - getReservedSpots(props.event.reservations)
  }
})
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <IconLabel v-if="event.day" icon="calendar">
      {{ formatDateUI(event.day) }}
    </IconLabel>
    <IconLabel v-if="event?.start" icon="clock">
      {{ formatHour(event.start) }}
      <template v-if="event?.end">
        tot {{ formatHour(event.end) }}
      </template>
    </IconLabel>
    <IconLabel v-if="event?.price" icon="wallet">
      €{{ event.price }} {{ event.onlinePayment ? 'online' : 'ter plaatse' }}
    </IconLabel>
    <IconLabel v-if="freeSpots" icon="user">
      {{ freeSpots }} vrije plaatsen
    </IconLabel>
    <IconLabel
      v-if="event?.min_spots && event.min_spots > 1"
      icon="users"
    >
      minimum voor {{ event.min_spots }} reserveren
    </IconLabel>
    <IconLabel v-if="event?.theme" icon="tag">
      {{ translateTheme(event.theme) }}
    </IconLabel>
  </div>
</template>
