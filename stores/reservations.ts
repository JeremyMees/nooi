import { minTimeSlot, minTimeSlotRental, maxSpots } from '~/constants/info'

export const useReservationStore = defineStore('useReservationStore', () => {
  const rosterStore = useRosterStore()
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()
  const route = useRoute()

  const events = ref<EventReservation[]>([])
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)
  const sidebarOpen = ref<boolean>(false)
  const activeStep = ref<number>(0)
  const selectedThemes = ref<EventTheme[]>([])
  const reservationInfo = useCookie<Record<string, string>>('reservationInfo')

  const form = ref<BasicForm>({
    day: '',
    name: '',
    number: '',
    mail: '',
    exclusive: false
  })

  const informationEvent = computed<EventReservation | undefined>(() => {
    const { event, status } = route.query

    if (event && status === 'info') {
      const eventId = +event
      const foundEvent = events.value.find(({ id }) => id === eventId)

      if (!isNaN(eventId) && foundEvent) {
        return foundEvent
      }
    }
  })

  const selectedEvent = computed<EventReservation | undefined>(() => {
    const { event, status } = route.query

    if (event && status === 'reservation') {
      const eventId = +event
      const foundEvent = events.value.find(({ id }) => id === eventId)

      if (!isNaN(eventId) && foundEvent) {
        return foundEvent
      }
    }
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
    return route.query.type === 'reservation' ? minTimeSlot : minTimeSlotRental
  })

  watch(() => route.query, (query) => {
    const { date } = query

    if (date) {
      form.value.day = date as string
    }
  }, { immediate: true })

  watch([selectedEvent, () => form.value.day], (value) => {
    const [event, day] = value

    if (event && event.spots && event.reservations.length >= event.spots) {
      toast.add({
        severity: 'info',
        summary: 'Volzet!',
        detail: `${event.name} is volledig volzet. Registratie is helaas niet meer mogelijk.`,
        life: 5000
      })

      removeQuery(['event', 'status'])
    } else if (event || day) {
      if (reservationInfo.value) {
        form.value.name = reservationInfo.value.name
        form.value.number = reservationInfo.value.number
        form.value.mail = reservationInfo.value.email
      }

      sidebarOpen.value = true
    } else {
      sidebarOpen.value = false
    }
  }, { immediate: true })

  watch(sidebarOpen, (value) => {
    if (!value) {
      form.value.day = undefined
      removeQuery(['date', 'type', 'event', 'status'])
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

      if (route.query.day) {
        const date = formatDay(new Date(route.query.day as string))

        isValidDateString(route.query.day as string) && rosterStore.getDayRoster(date)
          ? form.value.day = date
          : removeQuery(['day'])
      }
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
