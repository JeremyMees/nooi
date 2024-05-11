export const useRosterStore = defineStore('useRosterStore', () => {
  const reservationStore = useReservationStore()
  const toast = useToast()

  const loading = ref<boolean>(false)
  const rosters = ref<RosterRow[]>([])

  watch(() => reservationStore.shownDate, async () => await getData())

  async function getData (): Promise<void> {
    loading.value = true
    const date = new Date(reservationStore.shownDate.year, reservationStore.shownDate.month)

    try {
      rosters.value = await sbFetch<RosterRow[]>({ table: 'roster', date })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Oeps!',
        detail: 'Het lijkt erop dat er een probleem is met het ophalen van de gegevens',
        life: 5000
      })
    } finally {
      loading.value = false
    }
  }

  function getDayRoster (date?: string): RosterRow | undefined {
    return rosters.value.find(r => r.day === date)
  }

  function checkIfOpen (date?: Date): boolean {
    return !!getDayRoster(formatDay(date || new Date()))
  }

  onMounted(async () => await getData())

  return {
    rosters,
    loading,
    getData,
    getDayRoster,
    checkIfOpen
  }
})
