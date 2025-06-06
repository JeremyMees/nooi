<script setup lang="ts">
import type { FormKitNode } from '@formkit/core'
import { checkTimeValid } from '~/formkit/rules'
import { maxSpots, minTimeSlot, minTimeSlotRental } from '~/constants/info'

const store = useReservationStore()
const roster = useRosterStore()
const route = useRoute()

const start = ref<string>()
const end = ref<string>()

const filteredRoster = computed<RosterRow[]>(() => {
  return roster.current
    .filter(({ status }: RosterRow) => status === route.query.type)
    .sort((a, b) => a.start.localeCompare(b.start))
})

const timeSlot = computed<number>(() => {
  return route.query.type === 'reservation' ? minTimeSlot : minTimeSlotRental
})

const spots = computed<{ min: number, max: number }>(() => {
  return {
    min: store.selectedEvent?.minSpots ?? filteredRoster.value?.[0]?.minSpots ?? 1,
    max: store.selectedEvent?.spots
      ? store.selectedEvent.spots - getReservedSpots(store.selectedEvent.reservations)
      : route.query?.type === 'game' ? 8 : maxSpots,
  }
})

watch([start, end], (v) => {
  v.forEach((value: string | undefined, i: number) => {
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
    validation="required|alpha_spaces:default|length:5,45"
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
    validation="required|email|length:5,65"
  />
  <template v-if="!store.selectedEvent">
    <div v-if="filteredRoster.length">
      <p class="body-small text-surface pb-2">
        {{
          route.query.type === 'reservation'
            ? 'Reserveren of huren is vandaag mogelijk tussen deze uren:'
            : 'Onze openingsuren zijn vandaag:'
        }}
        <template
          v-for="(item, i) in filteredRoster"
          :key="item.id"
        >
          {{ formatHour(item.start) }} -
          {{ formatHour(item.end) }}{{ i !== filteredRoster.length - 1 ? ', ' : '' }}
        </template>
      </p>
      <FormKit
        v-model="start"
        type="time"
        name="start"
        :label="route.query.type === 'game' ? 'Tijdstip' : 'Startuur'"
        :disabled="!store.form.day"
        :min="formatHour(filteredRoster[0].start)"
        :max="formatHour(filteredRoster[filteredRoster.length - 1].end)"
        step="1800"
        :validation-rules="{
          time_valid: (node: FormKitNode) => checkTimeValid(node, filteredRoster),
        }"
        validation="required|time_valid"
        validation-visibility="live"
      />
    </div>
    <FormKit
      v-if="filteredRoster.length && route.query.type === 'reservation'"
      v-model="end"
      type="time"
      name="end"
      label="Einduur"
      :disabled="!store.form.day"
      :min="formatHour(filteredRoster[0].start)"
      :max="formatHour(filteredRoster[filteredRoster.length - 1].end)"
      step="1800"
      :validation-rules="{
        time_valid: (node: FormKitNode) => checkTimeValid(node, filteredRoster),
      }"
      :validation="`required|time_valid|time_slot:${timeSlot},${start}`"
      validation-visibility="live"
    />
  </template>
  <FormKit
    v-if="filteredRoster.length || store.selectedEvent"
    v-model="store.form.spots"
    type="number"
    name="spots"
    label="Aantal personen"
    :disabled="!store.selectedEvent && !store.form.day"
    :validation="`
      required|
      number|
      max:${spots.max}|
      min:${spots.min}
    `"
    :min="spots.min"
    :max="spots.max"
  />
  <AnimationReveal>
    <div
      v-if="
        route.query.type === 'game'
          && store.form.spots
          && !isNaN(+store.form.spots)
          && +store.form.spots >= 8
      "
      class="pb-3"
    >
      <a
        href="https://nooi.be/info/#contact"
        class="body-small text-surface pb-4 underline"
      >
        Contacteer ons via deze link om te boeken voor grotere groepen
      </a>
    </div>
  </AnimationReveal>
  <FormKit
    v-if="route.query.type === 'reservation'"
    v-model="store.form.exclusive"
    type="checkbox"
    label="Exclusief"
    help="Voor exclusief gebruik betaal je € 40 per uur, ter plaatse te voldoen. Om een feest of event te organiseren, werken we op maat (zie 'locatie')."
    name="exclusive"
  />
  <FormKit
    type="textarea"
    name="info"
    label="Extra info"
    validation="length:5,500"
  />
</template>
