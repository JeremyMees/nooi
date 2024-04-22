import { minTimeSlot, minTimeSlotRental, maxSpots, info } from '~/constants/info'

export const useReservationStore = defineStore('useReservationStore', () => {
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()

  const events = ref<EventReservation[]>([])
  const selectedEvent = ref<EventReservation>()
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)
  const sidebarOpen = ref<boolean>(false)
  const activeStep = ref<number>(0)

  // Form values
  const type = ref<BookingType>('reservation')
  const day = ref<string>()

  const opening = computed<Info|undefined>(() => {
    return day.value ? info[getDayOfWeek(day.value)] : undefined
  })

  const spots = computed<{ min: number, max: number}>(() => {
    return {
      min: selectedEvent.value?.min_spots ?? opening.value?.minSpots ?? 2,
      max: selectedEvent.value?.spots
        ? selectedEvent.value.spots - selectedEvent.value.reservations.length
        : maxSpots
    }
  })

  const timeSlot = computed<number>(() => {
    return type.value === 'reservation' ? minTimeSlot : minTimeSlotRental
  })

  watch(selectedEvent, (value) => {
    if (value) { sidebarOpen.value = true }
  })

  watch(sidebarOpen, (value) => {
    if (!value) {
      type.value = 'reservation'
      day.value = undefined
      selectedEvent.value = undefined
    }
  })

  async function createReservation (insert: ReservationInsert): Promise<void> {
    const { error: err } = await supabase
      .from('reservations')
      .insert([insert])

    if (err) {
      throw err
    }
  }

  async function init (): Promise<void> {
    loading.value = true

    try {
      await getData()
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

  async function getData (): Promise<void> {
    events.value = await sbFetch<EventReservation[]>({
      table: 'events',
      select: '*, reservations:reservations(id)'
    })

    reservations.value = await sbFetch<ReservationRow[]>({
      table: 'reservations'
    })
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
        async () => await getData()
      ).subscribe()
  }

  function unsubscribe () {
    supabase.removeAllChannels()
  }

  return {
    events,
    selectedEvent,
    reservations,
    loading,
    sidebarOpen,
    activeStep,
    type,
    timeSlot,
    spots,
    day,
    opening,
    init,
    subscribe,
    unsubscribe,
    createReservation
  }
})
