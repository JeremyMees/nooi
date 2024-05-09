<script setup lang="ts">
const props = defineProps<{
  day: CalendarTile
  events: EventRow[]
 }>()

const roster = useRosterStore()
const toast = useToast()

const isOpen = computed<boolean>(() => roster.checkIfOpen(props.day.dateFull))
const isPast = computed<boolean>(() => dateInPast(props.day.dateFull))
const currentRoster = computed<RosterRow|undefined>(() => {
  return roster.getDayRoster(formatDay(props.day.dateFull))
})

function handleClick (day: CalendarTile, top: boolean): void {
  if (
    dateInPast(day.dateFull) ||
    !roster.checkIfOpen(day.dateFull) ||
    !currentRoster.value
  ) { return }

  const { openForGames, openForReservations, isOccupied } = currentRoster.value

  if (isOccupied) {
    toast.add({
      severity: 'info',
      summary: 'Bezet!',
      detail: 'Deze dag is al volzet, maar reserveer gerust een andere dag.',
      life: 5000
    })
    removeQuery(['date', 'type'])
  } else if (
    (top && !openForGames && openForReservations) ||
    (!top && !openForGames && openForReservations) ||
    (!top && openForGames && openForReservations)
  ) {
    addQuery({ date: formatDay(day.dateFull), type: 'reservation' })
  } else if (
    (top && openForGames && openForReservations) ||
    (top && openForGames && !openForReservations) ||
    (!top && openForGames && !openForReservations)
  ) {
    addQuery({ date: formatDay(day.dateFull), type: 'game' })
  }
}
</script>

<template>
  <div class="flex flex-col">
    <button
      :aria-label="`Reservatie voor ${day.key}`"
      class="transition-all duration-200 border border-b-0 p-1 flex flex-col gap-y-1 overflow-hidden grow"
      :class="{
        'lines-calendar': !day.currentMonth,
        'cursor-not-allowed': isPast || !isOpen,
        '!bg-secondary': currentRoster?.isOccupied,
        'bg-primary': !currentRoster?.openForGames && currentRoster?.openForReservations,
        'bg-teal': (currentRoster?.openForGames && currentRoster?.openForReservations) ||
          ( currentRoster?.openForGames && !currentRoster?.openForReservations)
      }"
      @click="handleClick(day, true)"
    >
      <time
        :datetime="day.key"
        class="flex h-6 w-6 items-center justify-center rounded-lg text-white"
        :class="{
          'bg-surface-50 shadow font-bold text-surface-700' : day.today,
          '!text-surface-200': isPast || !isOpen
        }"
      >
        {{ day.date }}
      </time>
    </button>
    <button
      :aria-label="`Reservatie voor ${day.key}`"
      class="transition-all duration-200 border border-t-0 p-1 flex flex-col gap-y-1 overflow-hidden grow"
      :class="{
        'lines-calendar': !day.currentMonth,
        'cursor-not-allowed': isPast || !isOpen,
        '!bg-secondary': currentRoster?.isOccupied,
        'bg-teal': currentRoster?.openForGames && !currentRoster?.openForReservations,
        'bg-primary': (currentRoster?.openForGames && currentRoster?.openForReservations) ||
          ( !currentRoster?.openForGames && currentRoster?.openForReservations)
      }"
      @click="handleClick(day, false)"
    >
      <div class="flex flex-wrap gap-1 min-h-6">
        <EventTag
          v-for="event in events"
          :key="event.id"
          :event="event"
          @click.stop="addQuery({ event :event.id, status: 'info' })"
        />
      </div>
    </button>
  </div>
</template>
