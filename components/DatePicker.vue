<script setup lang="ts">
const store = useReservationStore()
const daysOfWeek = getDaysOfWeek()
const months = getMonths()
const currentDate = new Date()

const shownDate = ref<DisplayDate>({
  month: currentDate.getMonth(),
  year: currentDate.getFullYear()
})

const grid = computed<CalendarTile[]>(() => getCalenderDays(shownDate.value))
const isCurrentMonth = computed<boolean>(() => sameMonth(shownDate.value, currentDate))

function navigateCalendar (modifier: number): void {
  const date = new Date(shownDate.value.year, shownDate.value.month + modifier)

  shownDate.value = {
    month: date.getMonth(),
    year: date.getFullYear()
  }
}
</script>

<template>
  <Card class="w-full">
    <template #title>
      <div class="flex items-center justify-between border-b py-3 text-xl px-5">
        <div class="flex flex-wrap gap-x-4">
          <Button
            icon="pi pi-angle-left"
            outlined
            rounded
            aria-label="Vorige maand"
            :disabled="isCurrentMonth"
            @click="navigateCalendar(-1)"
          />
        </div>
        <div class="font-semibold capitalize">
          {{ months[shownDate.month] }} {{ shownDate.year }}
        </div>
        <Button
          icon="pi pi-angle-right"
          outlined
          rounded
          aria-label="Volgende maand"
          class="p-2"
          @click="navigateCalendar(1)"
        />
      </div>
    </template>
    <template #content>
      <div class="space-y-2 w-full">
        <div class="grid grid-cols-7 capitalize text-surface-500 font-semibold text-center">
          <div v-for="(day, index) in daysOfWeek" :key="index">
            {{ day }}
          </div>
        </div>
        <div class="isolate grid grid-cols-7">
          <CalendarCell
            v-for="(day, index) in grid"
            :key="`${index}-${day.key}`"
            :day="day"
            :events="store.events.filter(e => e.day === formatDay(day.dateFull))"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-x-6 gap-y-2">
        <div
          v-for="status in ['full', 'reservation', 'game'] as CalendarStatus[]"
          :key="status"
          class="flex items-center gap-2"
        >
          <div
            class="h-6 w-10 rounded-md"
            :class="{
              'bg-primary': status === 'reservation',
              'bg-teal': status === 'game',
              'bg-secondary': status === 'full'
            }"
          />
          <span> {{ translateStatus(status) }} </span>
        </div>
      </div>
      <AnimationReveal>
        <Button
          v-if="!isCurrentMonth"
          size="small"
          text
          icon="pi pi-directions"
          label="Huidige maand tonen"
          @click="() => {
            shownDate = {
              month: currentDate.getMonth(),
              year: currentDate.getFullYear()
            }
          }"
        />
      </AnimationReveal>
    </template>
  </Card>
</template>
