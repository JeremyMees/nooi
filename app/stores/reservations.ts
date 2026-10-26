export const useReservationStore = defineStore('useReservationStore', () => {
  const rosterStore = useRosterStore()
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()
  const route = useRoute()
  const reservationInfo = useCookie<Record<string, string>>('reservationInfo')

  const events = ref<EventReservation[]>([])
  const loading = ref<boolean>(false)
  const drawerOpen = ref<boolean>(false)
  const activeStep = ref<number>(0)

  const shownDate = ref<DisplayDate>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })

  const form = ref<ReservationForm>({
    day: '',
    name: '',
    number: '',
    mail: '',
    spots: '',
    exclusive: false,
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

  watch(
    () => route.query,
    query => {
      const { date } = query

      if (date) {
        form.value.day = date as string
      }
    },
    { immediate: true },
  )

  watch(
    [selectedEvent, () => form.value.day],
    value => {
      const [event, day] = value

      if (event && event.spots && event.reservations.length >= event.spots) {
        toast.add({
          severity: 'info',
          summary: 'Volzet!',
          detail: `${event.name} is volledig volzet. Registratie is helaas niet meer mogelijk.`,
          life: 5000,
        })

        removeQuery(['event', 'status'])
      } else if (event || day) {
        if (reservationInfo.value) {
          form.value.name = reservationInfo.value.name
          form.value.number = reservationInfo.value.number
          form.value.mail = reservationInfo.value.email
        }

        drawerOpen.value = true
      } else {
        drawerOpen.value = false
      }
    },
    { immediate: true },
  )

  watch(drawerOpen, value => {
    if (!value) {
      form.value.day = undefined
      removeQuery(['date', 'type', 'event', 'status', 'rosterIndex'])
    }
  })

  watch(
    shownDate,
    async () => {
      if (!loading.value) {
        await getData()
      }
    },
    { immediate: true },
  )

  async function book(request: BookingRequest): Promise<BookingResult> {
    const { name, number, email } = request

    reservationInfo.value = { name, number, email }

    const result = await $fetch('/api/reservations', {
      method: 'POST',
      body: request,
    })

    if (result.status === 'payment') {
      await navigateTo(result.url, { external: true })
    }

    return result
  }

  async function checkPaymentStatus(session: string): Promise<void> {
    try {
      const { paid } = await $fetch('/api/stripe/status', {
        query: { id: session },
      })

      toast.add(
        paid
          ? {
              severity: 'success',
              summary: 'Betaling gelukt!',
              detail:
                'De betaling is succesvol verwerkt en de reservering is bevestigd',
              life: 5000,
            }
          : {
              severity: 'error',
              summary: 'Oeps!',
              detail: 'Het lijkt erop dat er een probleem is met de betaling',
              life: 5000,
            },
      )
    } finally {
      removeQuery(['session_id'])
    }
  }

  async function init(): Promise<void> {
    loading.value = true

    try {
      subscribe()

      const { day, session_id } = route.query

      if (day) {
        const date = formatDay(new Date(day as string))

        if (
          isValidDateString(day as string) &&
          rosterStore.getDayRoster(date)
        ) {
          form.value.day = date
        } else {
          removeQuery(['day'])
        }
      } else if (session_id) {
        await checkPaymentStatus(session_id as string)
      }
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Oeps!',
        detail:
          'Het lijkt erop dat er een probleem is met het ophalen van de gegevens',
        life: 5000,
      })
    } finally {
      loading.value = false
    }
  }

  async function getData(): Promise<void> {
    try {
      loading.value = true

      const { event } = route.query
      const date = new Date(shownDate.value.year, shownDate.value.month)

      events.value = await sbFetch<EventReservation[]>(supabase, {
        table: 'events',
        select: '*, reservations:reservations(id, spots, paymentNeeded)',
        date,
        eq: { field: 'reservations.paymentNeeded', value: false },
      })

      // Fetch single event if query param is present and its not in the current fetched month
      if (
        event &&
        !isNaN(+event) &&
        !events.value.find(({ id }) => id === +event)
      ) {
        const fetchedEvent = await supabase
          .from('events')
          .select('*, reservations:reservations(id, spots, paymentNeeded)')
          .eq('id', +event)
          .eq('reservations.paymentNeeded', false)

        if (fetchedEvent.data?.length && fetchedEvent.data[0]) {
          events.value.push(fetchedEvent.data[0])
        }
      }
    } finally {
      loading.value = false
    }
  }

  function subscribe() {
    supabase
      .channel('reservation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        async () => await getData(),
      )
      .subscribe()
  }

  function unsubscribe() {
    supabase.removeAllChannels()
  }

  return {
    events,
    selectedEvent,
    informationEvent,
    loading,
    drawerOpen,
    activeStep,
    form,
    shownDate,
    init,
    subscribe,
    unsubscribe,
    book,
  }
})
