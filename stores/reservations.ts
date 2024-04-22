import { minTimeSlot, minTimeSlotRental, maxSpots, info } from '~/constants/info'

export const useReservationStore = defineStore('useReservationStore', () => {
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()

  const events = ref<EventRow[]>([])
  const selectedEvent = ref<EventRow>({ id: 1, name: 'Color of death', spots: 12, min_spots: 3, day: '2024-05-04', start: '19:30:43', end: null, created_at: '2024-04-19T18:04:38.633893+00:00', price: null, description: 'Wij spelen Color of death sessie 2', theme: 'game' })
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)
  const sidebarOpen = ref<boolean>(true)
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
      max: selectedEvent.value?.spots ?? maxSpots // check how many spots are already booked for this event
    }
  })

  const timeSlot = computed<number>(() => {
    return type.value === 'reservation' ? minTimeSlot : minTimeSlotRental
  })

  watch(sidebarOpen, (value) => {
    if (!value) {
      type.value = 'reservation'
      day.value = undefined
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
