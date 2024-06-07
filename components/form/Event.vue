<script setup lang="ts">
const start = ref<string>()
const end = ref<string>()

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
      validation="required"
    />
    <FormKit
      name="theme"
      label="Thema"
      help="Thema's komma gescheiden"
      validation="required"
    />
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
    <FormKit
      type="date"
      name="bookingDeadline"
      label="Boeking deadline"
      validation="required"
    />
    <FormKit
      type="number"
      name="minSpots"
      label="Minimum personen"
      validation="required|number|min:1|max:100"
      :value="1"
      :min="1"
      :max="100"
    />
    <FormKit
      type="number"
      name="spots"
      label="Aantal plaatsen"
      validation="number|min:1|max:100"
      :min="1"
      :max="100"
    />
    <FormKit
      type="number"
      name="spots"
      label="Prijs"
      validation="number|min:1|max:100"
      :min="1"
      :max="100"
    />
  </div>
  <div class="flex flex-col">
    <FormKit
      :value="false"
      type="checkbox"
      label="Eenheidsprijs"
      name="unitPrice"
      outer-class="$remove:mb-4 mb-0"
    />
    <FormKit
      :value="false"
      type="checkbox"
      label="Unit price"
      name="onlinePayment"
      outer-class="$remove:mb-4 mb-0"
    />
    <FormKit
      :value="false"
      type="checkbox"
      label="Extern event"
      name="external"
    />
  </div>
</template>
