export const useReservationStore = defineStore('useReservationStore', () => {
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()

  const events = ref<EventRow[]>([])
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)

  async function init (): Promise<void> {
    loading.value = true

    try {
      events.value = await sbFetch<EventRow[]>('events')
      reservations.value = await sbFetch<ReservationRow[]>('reservations')

      subscribe()
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

  function subscribe () {
    supabase
      .channel('reservation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `day=gte.${(new Date()).toISOString()}`
        },
        async () => {
          reservations.value = await sbFetch<ReservationRow[]>('reservations')
        }
      ).subscribe()
  }

  function unsubscribe () {
    supabase.removeAllChannels()
  }

  return {
    events,
    reservations,
    loading,
    init,
    subscribe,
    unsubscribe
  }
})
