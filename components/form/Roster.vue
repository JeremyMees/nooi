<script setup lang="ts">
const start = ref<string>()
const end = ref<string>()

const statusOptions: Option<string>[] = [
  { label: 'Open spelcafé', value: 'game' },
  { label: 'Reservatie', value: 'reservation' },
  { label: 'Bezet', value: 'occupied' },
]

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
      validation="required"
    />
    <FormKit
      type="select"
      name="status"
      label="Status"
      validation="required"
      :value="statusOptions[0].value"
      :options="statusOptions"
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
  </div>
</template>
