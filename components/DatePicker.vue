<script setup lang="ts">
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
    <template #content>
      <div class="space-y-2 w-full">
        <div class="flex items-center justify-between border-b py-3 text-xl">
          <div class="flex flex-wrap gap-x-4">
            <Button
              size="small"
              icon="pi pi-angle-left"
              outlined
              aria-label="Vorige maand"
              @click="navigateCalendar(-1)"
            />
            <Button
              v-if="!isCurrentMonth"
              size="small"
              icon="pi pi-calendar"
              label="Vandaag"
              @click="() => {
                shownDate = {
                  month: currentDate.getMonth(),
                  year: currentDate.getFullYear()
                }
              }"
            />
          </div>
          <div class="font-semibold capitalize">
            {{ months[shownDate.month] }} {{ shownDate.year }}
          </div>
          <Button
            size="small"
            icon="pi pi-angle-right"
            outlined
            aria-label="Volgende maand"
            @click="navigateCalendar(1)"
          />
        </div>
        <div class="grid grid-cols-7 capitalize text-surface-500 font-semibold text-center">
          <div v-for="(day, index) in daysOfWeek" :key="index">
            {{ day }}
          </div>
        </div>
        <div class="isolate grid grid-cols-7">
          <div
            v-for="(day, index) in grid"
            :key="`${index}-${day.key}`"
            class="hover:bg-primary-50 transition-all duration-200 border p-1 space-y-1 overflow-hidden"
            :class="{
              'bg-gray-50': !day.currentMonth,
              'rounded-tl-xl': index === 0,
              'rounded-tr-xl': index === 6,
              'rounded-bl-xl': index === 35,
              'rounded-br-xl': index === 41,
            }"
          >
            <time
              :datetime="day.key"
              class="flex h-6 w-6 items-center justify-center rounded-lg"
              :class="{
                'bg-secondary text-white shadow' : day.today
              }"
            >
              {{ day.date }}
            </time>
            <div class="space-y-1 min-h-8">
              <!-- placeholder -->
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
