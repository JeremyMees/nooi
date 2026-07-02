<script setup lang="ts">
const props = defineProps<{ event: EventReservation }>()

const freeSpots = computed<number | undefined>(() => {
  return props.event.spots
    ? Math.max(
        props.event.spots - getReservedSpots(props.event.reservations),
        0,
      )
    : undefined
})
</script>

<template>
  <div test-id="event-tags" class="flex flex-wrap gap-2">
    <IconLabel v-if="event.day" test-id="event-tag-day" icon="calendar">
      {{ formatDateUI(event.day) }}
    </IconLabel>
    <IconLabel v-if="event?.start" test-id="event-tag-time" icon="clock">
      {{ formatHour(event.start) }}
      <template v-if="event?.end"> tot {{ formatHour(event.end) }} </template>
    </IconLabel>
    <IconLabel v-if="event?.price" test-id="event-tag-price" icon="wallet">
      € {{ event.price }} {{ event.onlinePayment ? 'online' : 'ter plaatse' }}
    </IconLabel>
    <IconLabel v-if="freeSpots" test-id="event-tag-spots" icon="user">
      {{ freeSpots }} vrije {{ freeSpots > 1 ? 'plaatsen' : 'plaats' }}
    </IconLabel>
    <IconLabel
      v-if="event?.minSpots && event.minSpots > 1"
      test-id="event-tag-min-spots"
      icon="users"
    >
      minimum voor {{ event.minSpots }} reserveren
    </IconLabel>
    <template v-if="event?.theme">
      <IconLabel
        v-for="theme in event.theme.split(',')"
        :key="theme"
        test-id="event-tag-theme"
        icon="tag"
      >
        {{ theme.trim() }}
      </IconLabel>
    </template>
  </div>
</template>
