<script setup lang="ts">
const store = useReservationStore()
const daysOfWeek = getDaysOfWeek()
const months = getMonths()
const currentDate = new Date()
const { shownDate } = storeToRefs(store)

const grid = computed<CalendarTile[]>(() => {
  return getCalenderDays(shownDate.value)
})
const isCurrentMonth = computed<boolean>(() =>
  sameMonth(shownDate.value, currentDate),
)

function navigateCalendar(modifier: number): void {
  const date = new Date(shownDate.value.year, shownDate.value.month + modifier)

  shownDate.value = {
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}
</script>

<template>
  <div class="w-full rounded-md bg-surface-0 text-surface-700 shadow-md">
    <div class="flex flex-col gap-2 pb-5">
      <div class="mb-2 text-2xl font-bold">
        <div
          class="flex items-center justify-between border-b border-surface-200 py-3 text-xl px-5"
        >
          <div class="flex flex-wrap gap-x-4">
            <UButton
              icon="i-lucide-chevron-left"
              variant="outline"
              square
              aria-label="Vorige maand"
              class="size-12 justify-center rounded-full"
              :disabled="isCurrentMonth"
              @click="navigateCalendar(-1)"
            />
          </div>
          <div test-id="calendar-month" class="font-semibold capitalize">
            {{ months[shownDate.month] }} {{ shownDate.year }}
          </div>
          <UButton
            icon="i-lucide-chevron-right"
            variant="outline"
            square
            aria-label="Volgende maand"
            class="size-12 justify-center rounded-full"
            @click="navigateCalendar(1)"
          />
        </div>
      </div>
      <div class="py-5">
        <div class="space-y-2 w-full">
          <div
            class="grid grid-cols-7 capitalize text-surface-500 font-semibold text-center"
          >
            <div v-for="(day, index) in daysOfWeek" :key="index">
              {{ day }}
            </div>
          </div>
          <div class="isolate grid grid-cols-7">
            <CalendarCell
              v-for="(day, index) in grid"
              :key="`${index}-${day.key}`"
              :day="day"
              :events="
                store.events.filter(e => e.day === formatDay(day.dateFull))
              "
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex flex-wrap items-start justify-between gap-2 px-5 pt-0 pb-5"
    >
      <div class="flex flex-col sm:flex-row gap-x-6 gap-y-2">
        <div
          v-for="status in ['full', 'reservation', 'game'] as CalendarStatus[]"
          :key="status"
          test-id="calendar-legend-item"
          class="flex items-center gap-2"
        >
          <div
            class="h-6 w-10 rounded-md"
            :class="{
              'bg-primary': status === 'reservation',
              'bg-teal': status === 'game',
              'bg-secondary': status === 'full',
            }"
          />
          <span> {{ translateStatus(status) }} </span>
        </div>
      </div>
      <AnimationReveal>
        <UButton
          v-if="!isCurrentMonth"
          size="sm"
          variant="ghost"
          icon="i-lucide-locate-fixed"
          label="Huidige maand tonen"
          @click="
            () => {
              shownDate = {
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
              }
            }
          "
        />
      </AnimationReveal>
    </div>
  </div>
</template>
