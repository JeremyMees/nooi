import { minTimeSlot, minTimeSlotRental, maxSpots } from '~/constants/info'

export const useReservationStore = defineStore('useReservationStore', () => {
  const rosterStore = useRosterStore()
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()

  const events = ref<EventReservation[]>([])
  const selectedEvent = ref<EventReservation>()
  const informationEvent = ref<EventReservation>()
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)
  const sidebarOpen = ref<boolean>(false)
  const activeStep = ref<number>(0)
  const selectedThemes = ref<EventTheme[]>([])
  const reservationInfo = useCookie<Record<string, string>>('reservationInfo')

  const form = ref<BasicForm>({
    type: 'reservation',
    day: '',
    name: '',
    number: '',
    mail: ''
  })

  const opening = computed<RosterRow|undefined>(() => {
    return form.value.day ? rosterStore.getDayRoster(form.value.day) : undefined
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
    return form.value.type === 'reservation' ? minTimeSlot : minTimeSlotRental
  })

  watch([selectedEvent, () => form.value.day], (value) => {
    const [event, day] = value

    if (event && event.spots && event.reservations.length >= event.spots) {
      toast.add({
        severity: 'info',
        summary: 'Volzet!',
        detail: `${event.name} is volledig volzet. Registratie is helaas niet meer mogelijk.`,
        life: 5000
      })

      selectedEvent.value = undefined
    } else if (event || day) {
      sidebarOpen.value = true
    }
  })

  watch(sidebarOpen, (value) => {
    if (!value) {
      form.value.day = undefined
      form.value.type = 'reservation'
      selectedEvent.value = undefined
    } else if (reservationInfo.value) {
      form.value.name = reservationInfo.value.name
      form.value.number = reservationInfo.value.number
      form.value.mail = reservationInfo.value.email
    }
  })

  async function createReservation (insert: ReservationInsert): Promise<void> {
    const { name, number, email } = insert

    reservationInfo.value = { name, number, email }

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
    informationEvent,
    reservations,
    loading,
    sidebarOpen,
    activeStep,
    form,
    timeSlot,
    spots,
    opening,
    selectedThemes,
    init,
    subscribe,
    unsubscribe,
    createReservation
  }
})
