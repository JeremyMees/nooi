<script setup lang="ts">
const roster = useRosterStore()
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

function handleClick (day: CalendarTile): void {
  if (dateInPast(day.dateFull) || !roster.checkIfOpen(day.dateFull)) { return }

  store.form.day = formatDay(day.dateFull)
}
</script>

<template>
  <Card class="w-full">
    <template #title>
      <div class="flex items-center justify-between border-b py-3 text-xl">
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
          <button
            v-for="(day, index) in grid"
            :key="`${index}-${day.key}`"
            :aria-label="`Reservatie voor ${day.key}`"
            class="hover:bg-primary-50/75 transition-all duration-200 border p-1 space-y-1 overflow-hidden"
            :class="{
              'bg-gray-50/75': !day.currentMonth,
              'cursor-not-allowed': dateInPast(day.dateFull) || !roster.checkIfOpen(day.dateFull),
              'rounded-tl-xl': index === 0,
              'rounded-tr-xl': index === 6,
              'rounded-bl-xl': index === 35,
              'rounded-br-xl': index === 41,
            }"
            @click="handleClick(day)"
          >
            <time
              :datetime="day.key"
              class="flex h-6 w-6 items-center justify-center rounded-lg"
              :class="{
                'bg-secondary text-white shadow' : day.today,
                'opacity-25': dateInPast(day.dateFull) || !roster.checkIfOpen(day.dateFull),
              }"
            >
              {{ day.date }}
            </time>
            <div class="space-y-1 min-h-8">
              <Skeleton v-if="store.loading" />
            </div>
          </button>
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        v-if="!isCurrentMonth"
        size="small"
        text
        severity="secondary"
        icon="pi pi-directions"
        label="Huidige maand tonen"
        @click="() => {
          shownDate = {
            month: currentDate.getMonth(),
            year: currentDate.getFullYear()
          }
        }"
      />
      <div v-tooltip="!roster.checkIfOpen() ? 'Vandaag zijn we gesloten' : ''">
        <Button
          size="small"
          text
          icon="pi pi-calendar"
          label="Reserveer vandaag"
          :disabled="!roster.checkIfOpen()"
          @click="store.form.day = formatDay(new Date())"
        />
      </div>
    </template>
  </Card>
</template>
