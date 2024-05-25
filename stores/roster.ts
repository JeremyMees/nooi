export const useRosterStore = defineStore('useRosterStore', () => {
  const reservationStore = useReservationStore()
  const toast = useToast()

  const loading = ref<boolean>(false)
  const rosters = ref<RosterRow[]>([])

  const current = computed<RosterRow[]>(() => {
    return reservationStore.form.day
      ? getDayRoster(reservationStore.form.day)
      : []
  })

  watch(() => reservationStore.shownDate, async () => await getData())

  async function getData(): Promise<void> {
    loading.value = true
    const date = new Date(reservationStore.shownDate.year, reservationStore.shownDate.month)

    try {
      rosters.value = await sbFetch<RosterRow[]>({ table: 'roster', date })
    }
    catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Oeps!',
        detail: 'Het lijkt erop dat er een probleem is met het ophalen van de gegevens',
        life: 5000,
      })
    }
    finally {
      loading.value = false
    }
  }

  function getDayRoster(date?: string): RosterRow[] {
    return rosters.value.filter(r => r.day === date)
  }

  function checkIfOpen(date?: Date): boolean {
    const dayRoster = getDayRoster(formatDay(date || new Date()))

    return !!dayRoster.length
  }

  onMounted(async () => await getData())

  return {
    rosters,
    loading,
    current,
    getData,
    getDayRoster,
    checkIfOpen,
  }
})
