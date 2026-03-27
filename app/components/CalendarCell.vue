<script setup lang="ts">
import { sameDay } from '@formkit/tempo'

const props = defineProps<{
  day: CalendarTile
  events: EventRow[]
}>()

const roster = useRosterStore()
const toast = useToast()

const cell = ref<HTMLButtonElement>()

const isOpen = computed<boolean>(() => roster.checkIfOpen(props.day.dateFull))
const isPast = computed<boolean>(() => dateInPast(props.day.dateFull))

const sortedEvents = computed<EventRow[]>(() => {
  const _events = props.events

  return _events.sort((a, b) => a.start.localeCompare(b.start))
})

const currentRoster = computed<RosterRow[]>(() => {
  return roster.getDayRoster(formatDay(props.day.dateFull))
})

function handleClick(event: MouseEvent): void {
  const rosterItems = currentRoster.value.length

  if (
    dateInPast(props.day.dateFull)
    || !roster.checkIfOpen(props.day.dateFull)
    || !rosterItems
    || !cell.value
  ) { return }

  const rosterIndex = rosterItems === 1
    ? 0
    : calculateCellClick(event, cell.value, rosterItems)

  const row = currentRoster.value[rosterIndex]

  if (row.status === 'occupied') {
    toast.add({
      severity: 'info',
      summary: 'Bezet!',
      detail: 'Voor deze dag kan je niet meer reserveren. Wees welkom op een ander moment!',
      life: 5000,
    })
    removeQuery(['date', 'type', 'rosterIndex'])
  }
  else if (sameDay(row.day, new Date())) {
    toast.add({
      severity: 'info',
      summary: 'Vandaag reserveren gaat niet',
      detail: 'Je kan niet reserveren op dezelfde dag. Wil je toch langs komen? Bel ons even op!',
      life: 5000,
    })
    removeQuery(['date', 'type', 'rosterIndex'])
  }
  else if (row.status === 'reservation') {
    addQuery({
      date: formatDay(props.day.dateFull),
      type: 'reservation',
      rosterIndex: rosterIndex,
    })
  }
  else {
    addQuery({
      date: formatDay(props.day.dateFull),
      type: 'game',
      rosterIndex: rosterIndex,
    })
  }
}
</script>

<template>
  <button
    ref="cell"
    :aria-label="`Reservatie voor ${day.key}`"
    class="transition-all duration-200 border border-b-0 p-1 flex flex-col gap-y-1 overflow-x-hidden h-full w-full min-h-[85px]"
    :class="{ 'cursor-not-allowed': isPast || !isOpen }"
    :style="{ backgroundImage: generateCellBg(currentRoster, !day.currentMonth) }"
    @click="handleClick"
  >
    <time
      :datetime="day.key"
      class="flex h-6 w-6 items-center justify-center rounded-lg text-white"
      :class="{
        'bg-surface-50 shadow font-bold !text-surface-700': day.today,
        '!text-surface-200': isPast || !isOpen,
      }"
    >
      {{ day.date }}
    </time>
    <EventTag
      v-for="event in sortedEvents"
      :key="event.id"
      :event="event"
      :class="{
        'pointer-events-none': isPast,
        'opacity-60': isPast || countSpots(event) === event.spots,
      }"
      @click.stop="addQuery({ event: event.id, status: 'info' })"
    />
  </button>
</template>
