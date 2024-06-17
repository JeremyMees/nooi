<script setup lang="ts">
import { maxSpots } from '~/constants/info'

const store = useAdminStore()

const start = ref<string>()
const end = ref<string>()
const type = ref<string>('game')
const selectedEvent = ref<string>()

const typeOptions: Option<string>[] = [
  { label: 'Spel café', value: 'game' },
  { label: 'Reservatie', value: 'reservation' },
  { label: 'Event', value: 'event' },
]

const eventOptions = computed<Option<string>[]>(() => {
  return store.events.map(event => ({
    label: `${event.name} (${formatDateUI(event.day)})`,
    value: event.id,
  }))
})

const spots = computed<{ min: number, max: number }>(() => {
  if (selectedEvent.value) {
    const id = +selectedEvent.value
    const event = store.events.find(event => event.id === id)

    return {
      min: event?.minSpots ?? 2,
      max: event?.spots
        ? event?.spots - getReservedSpots(event?.reservations)
        : maxSpots,
    }
  }
  else {
    return { min: 2, max: maxSpots }
  }
})

onMounted(async () => await store.getEvents())

watch([start, end], (v) => {
  v.forEach((value: string | undefined, i: number) => {
    if (value && !['00', '30'].includes(value.split(':')[1])) {
      i === 0 ? start.value = roundTime(value) : end.value = roundTime(value)
    }
  })
})
</script>

<template>
  <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4">
    <FormKit
      name="name"
      label="Naam"
      validation="required|alpha_spaces:default|length:5,25"
    />
    <FormKit
      type="tel"
      name="number"
      label="Telefoonnummer"
      validation="matches:/^[0-9]*$/|length:10,12"
    />
    <FormKit
      type="email"
      name="email"
      label="Email"
      validation="email|length:5,25"
    />
    <FormKit
      v-model="type"
      name="type"
      type="select"
      label="Reservatie type"
      validation="required"
      :options="typeOptions"
    />
    <template v-if="type === 'event'">
      <FormKit
        v-model="selectedEvent"
        name="event"
        type="select"
        label="Event"
        validation="required"
        placeholder="Selecteer een event"
        :options="eventOptions"
      />
    </template>
    <template v-else>
      <FormKit
        type="date"
        name="day"
        label="Datum"
        validation="required"
      />
      <FormKit
        v-model="start"
        type="time"
        name="start"
        label="Startuur"
        step="1800"
        validation="required"
      />
      <FormKit
        v-model="end"
        type="time"
        name="end"
        label="Einduur"
        step="1800"
      />
    </template>
    <FormKit
      type="number"
      name="spots"
      label="Aantal plaatsen"
      :validation="`required|number|max:${spots.max}|min:${spots.min}`"
      :min="spots.min"
      :max="spots.max"
    />
  </div>
  <FormKit
    v-if="type !== 'event'"
    :value="false"
    type="checkbox"
    label="Exclusief"
    name="exclusive"
  />
  <FormKit
    type="textarea"
    name="info"
    label="Extra info"
    validation="length:5,500"
  />
</template>
