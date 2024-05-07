<script setup lang="ts">
import { themeOptions } from '~/constants/info'

const store = useReservationStore()
const roster = useRosterStore()
const { query } = useRoute()

const start = ref<string>()
const end = ref<string>()

const currentRoster = computed<RosterRow|undefined>(() => {
  return store.form.day ? roster.getDayRoster(store.form.day) : undefined
})

watch([start, end], (v) => {
  v.forEach((value: string|undefined, i: number) => {
    if (value && !['00', '30'].includes(value.split(':')[1])) {
      i === 0 ? start.value = roundTime(value) : end.value = roundTime(value)
    }
  })
})
</script>

<template>
  <FormKit
    v-model="store.form.name"
    type="text"
    name="name"
    label="Volledige naam"
    validation="required|alpha_spaces:default|length:5,25"
  />
  <FormKit
    v-model="store.form.number"
    type="tel"
    name="number"
    label="Telefoonnummer"
    validation="required|matches:/^[0-9]*$/|length:10,12"
  />
  <FormKit
    v-model="store.form.mail"
    type="email"
    name="email"
    label="Email"
    validation="required|email|length:5,25"
  />
  <FormKit
    v-if="query.type === 'reservation'"
    type="select"
    name="theme"
    label="Thema"
    validation="required"
    :options="themeOptions"
  />
  <template v-if="!store.selectedEvent">
    <FormKit
      v-model="store.form.day"
      type="date"
      name="day"
      label="Datum"
      :validation="`
        required|
        date_open:${store.form.day ? roster.checkIfOpen(new Date(store.form.day)): false}|
        date_after:${getYesterday()}|
        date_before:${getNextYear()}
      `"
    />
    <div v-if="currentRoster">
      <p class="body-small text-surface pb-2">
        Onze openingsuren zijn vandaag:
        {{ formatHour(currentRoster.startOfDay) }}  -
        <template v-if="currentRoster.noonBreakStart && currentRoster.noonBreakEnd">
          {{ formatHour(currentRoster.noonBreakStart) }},
          {{ formatHour(currentRoster.noonBreakEnd) }} -
        </template>
        {{ formatHour(currentRoster.endOfDay) }}
      </p>
      <FormKit
        v-model="start"
        type="time"
        name="start"
        :label="query.type === 'game' ? 'Tijdstip' : 'Startuur'"
        :disabled="!store.form.day"
        :min="formatHour(currentRoster.startOfDay)"
        :max="formatHour(currentRoster.endOfDay)"
        step="1800"
        :validation="`
              required|
              time_valid:${store.form.day}|
              time_after:${currentRoster.startOfDay}|
              time_before:${currentRoster.endOfDay}|
              time_break:${currentRoster.noonBreakStart},${currentRoster.noonBreakEnd}
            `"
        validation-visibility="live"
      />
    </div>
    <FormKit
      v-if="currentRoster && query.type === 'reservation'"
      v-model="end"
      type="time"
      name="end"
      label="Einduur"
      :disabled="!store.form.day"
      :min="formatHour(currentRoster.startOfDay)"
      :max="formatHour(currentRoster.endOfDay)"
      step="1800"
      :validation="`
            required|
            time_valid:${store.form.day}|
            time_after:${currentRoster.startOfDay}|
            time_before:${currentRoster.endOfDay}|
            time_slot:${store.timeSlot},${start}|
            time_break:${currentRoster.noonBreakStart},${currentRoster.noonBreakEnd},${start}
          `"
      validation-visibility="live"
    />
  </template>
  <FormKit
    v-if="store.opening || store.selectedEvent"
    type="number"
    name="spots"
    label="Aantal personen"
    :disabled="!store.selectedEvent && !store.form.day"
    :validation="`
        required|
        number|
        max:${store.spots.max}|
        min:${store.spots.min}
      `"
    :min="store.spots.min"
    :max="store.spots.max"
  />
  <FormKit
    v-if="query.type === 'reservation'"
    v-model="store.form.exclusive"
    type="checkbox"
    label="Exclusief"
    help="Exclusief reserveren is tegen betaling"
    name="exclusive"
  />
  <FormKit
    type="textarea"
    name="info"
    label="Extra info"
    validation="length:5,500"
  />
</template>
