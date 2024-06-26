<script setup lang="ts">
const props = defineProps<{ event: EventReservation }>()

const freeSpots = computed<number | undefined>(() => {
  return props.event.spots
    ? props.event.spots - getReservedSpots(props.event.reservations)
    : undefined
})
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <IconLabel
      v-if="event.day"
      icon="calendar"
    >
      {{ formatDateUI(event.day) }}
    </IconLabel>
    <IconLabel
      v-if="event?.start"
      icon="clock"
    >
      {{ formatHour(event.start) }}
      <template v-if="event?.end">
        tot {{ formatHour(event.end) }}
      </template>
    </IconLabel>
    <IconLabel
      v-if="event?.price"
      icon="wallet"
    >
      € {{ event.price }} {{ event.onlinePayment ? 'online' : 'ter plaatse' }}
    </IconLabel>
    <IconLabel
      v-if="freeSpots"
      icon="user"
    >
      {{ freeSpots }} vrije plaatsen
    </IconLabel>
    <IconLabel
      v-if="event?.minSpots && event.minSpots > 1"
      icon="users"
    >
      minimum voor {{ event.minSpots }} reserveren
    </IconLabel>
    <template v-if="event?.theme">
      <IconLabel
        v-for="theme in event.theme.split(',')"
        :key="theme"
        icon="tag"
      >
        {{ theme.trim() }}
      </IconLabel>
    </template>
  </div>
</template>
