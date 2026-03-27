export const useRosterStore = defineStore('useRosterStore', () => {
  const supabase = useSupabaseClient<Database>()
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
      rosters.value = await sbFetch<RosterRow[]>(supabase, { table: 'rosters', date })
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

  async function fetchRoster(date: Date): Promise<RosterRow[]> {
    const { data, error } = await supabase
      .from('rosters')
      .select('*')
      .eq('day', formatDay(date))

    if (error) {
      return []
    }

    return data
  }

  function getDayRoster(date?: string): RosterRow[] {
    return rosters.value
      .filter(r => r.day === date)
      .sort((a, b) => a.start.localeCompare(b.start))
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
    fetchRoster,
  }
})
