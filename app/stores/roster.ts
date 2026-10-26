export const useRosterStore = defineStore('useRosterStore', () => {
  const reservationStore = useReservationStore()

  const rosters = ref<RosterRow[]>([])

  const current = computed<RosterRow[]>(() => {
    return reservationStore.form.day
      ? getDayRoster(reservationStore.form.day)
      : []
  })

  function getDayRoster(date?: string): RosterRow[] {
    return rosters.value
      .filter(r => r.day === date)
      .sort((a, b) => a.start.localeCompare(b.start))
  }

  function checkIfOpen(date?: Date): boolean {
    const dayRoster = getDayRoster(formatDay(date || new Date()))

    return !!dayRoster.length
  }

  return {
    rosters,
    current,
    getDayRoster,
    checkIfOpen,
  }
})
