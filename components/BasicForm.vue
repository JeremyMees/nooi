<script setup lang="ts">
import { themeOptions } from '~/constants/info'

const store = useReservationStore()

const start = ref<string>()
const end = ref<string>()

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
    v-if="!store.selectedEvent"
    v-model="store.form.type"
    type="select"
    name="type"
    label="Type"
    validation="required"
    :options="[
      { label: 'Verhuur', value: 'rental' },
      { label: 'Reservation', value: 'reservation' }
    ]"
  />
  <Expand>
    <FormKit
      v-if="store.form.type === 'rental'"
      type="select"
      name="theme"
      label="Thema"
      validation="required"
      :options="themeOptions"
    />
  </Expand>
  <template v-if="!store.selectedEvent">
    <FormKit
      v-model="store.form.day"
      type="date"
      name="day"
      label="Datum"
      :validation="`required|date_open|date_after:${getYesterday()}|date_before:${getNextYear()}`"
      :validation-messages="{
        date_open: 'Wij zijn niet open op deze dag'
      }"
    />
    <Expand>
      <div v-if="store.opening">
        <FormKit
          v-model="start"
          type="time"
          name="start"
          label="Start"
          :disabled="!store.form.day"
          :min="formatHour(store.opening.open.hour, store.opening.open.minute)"
          :max="formatHour(store.opening.close.hour, store.opening.close.minute)"
          step="1800"
          :validation="`required|time_after:${store.form.day}|time_before:${store.form.day}`"
          :validation-messages="{
            time_after: `Je kan pas boeken vanaf ${formatHour(store.opening.open.hour, store.opening.open.minute)}`,
            time_before: `Wij sluiten om ${formatHour(store.opening.close.hour, store.opening.close.minute)}`
          }"
          validation-visibility="live"
        />
        <FormKit
          v-model="end"
          type="time"
          name="end"
          label="Einde"
          :disabled="!store.form.day"
          :min="formatHour(store.opening.open.hour, store.opening.open.minute)"
          :max="formatHour(store.opening.close.hour, store.opening.close.minute)"
          step="1800"
          :validation="`time_after:${store.form.day}|time_before:${store.form.day}|time_slot:${store.timeSlot},${start}`"
          :validation-messages="{
            time_after: `Je kan pas boeken vanaf ${formatHour(store.opening.open.hour, store.opening.open.minute)}`,
            time_before: `Wij sluiten om ${formatHour(store.opening.close.hour, store.opening.close.minute)}`,
            time_slot: `Reservatie mag minimum ${store.timeSlot} uur zijn`
          }"
          validation-visibility="live"
        />
      </div>
    </Expand>
  </template>
  <Expand>
    <FormKit
      v-if="store.opening || store.selectedEvent"
      type="number"
      name="spots"
      label="Personen"
      :disabled="!store.selectedEvent && !store.form.day"
      :validation="`required|number|max:${store.spots.max}|min:${store.spots.min}`"
      :min="store.spots.min"
      :max="store.spots.max"
    />
  </Expand>
  <FormKit
    type="textarea"
    name="info"
    label="Extra info"
    validation="length:5,500"
  />
</template>
