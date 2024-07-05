import type Stripe from 'stripe'

export const useReservationStore = defineStore('useReservationStore', () => {
  const rosterStore = useRosterStore()
  const supabase = useSupabaseClient<Database>()
  const toast = useToast()
  const mail = useMail()
  const route = useRoute()
  const reservationInfo = useCookie<Record<string, string>>('reservationInfo')

  const events = ref<EventReservation[]>([])
  const reservations = ref<ReservationRow[]>([])
  const loading = ref<boolean>(true)
  const paymentPending = ref<number>()
  const sidebarOpen = ref<boolean>(false)
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
        life: 5000,
      })

      removeQuery(['event', 'status'])
    }
    else if (event || day) {
      if (reservationInfo.value) {
        form.value.name = reservationInfo.value.name
        form.value.number = reservationInfo.value.number
        form.value.mail = reservationInfo.value.email
      }

      sidebarOpen.value = true
    }
    else {
      sidebarOpen.value = false
    }
  }, { immediate: true })

  watch(sidebarOpen, (value) => {
    if (!value) {
      if (paymentPending.value) {
        cancelUnpaidReservation()
      }

      form.value.day = undefined
      removeQuery(['date', 'type', 'event', 'status'])
    }
    else {
      paymentPending.value = undefined
    }
  })

  watch(shownDate, async () => await getData())

  async function getReservation(id: number): Promise<ReservationRow> {
    const { error, data } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)

    if (error) {
      throw error
    }

    return data?.[0]
  }

  async function createReservation(insert: ReservationInsert): Promise<ReservationRow> {
    const { name, number, email } = insert

    reservationInfo.value = {
      name,
      number: number as string,
      email: email as string,
    }

    const { error, data } = await supabase
      .from('reservations')
      .insert([insert])
      .select('*')

    if (error) {
      throw error
    }

    return data?.[0]
  }

  async function removeReservation(id: number): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async function updateReservation(id: number, payload: ReservationUpdate): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update(payload)
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async function checkPaymentStatus(session: string): Promise<void> {
    try {
      const currentSession = await $fetch<Stripe.Checkout.Session>('/api/stripe/status', {
        query: { id: session },
      })

      if (currentSession.payment_status === 'paid') {
        toast.add({
          severity: 'success',
          summary: 'Betaling gelukt!',
          detail: 'De betaling is succesvol verwerkt en de reservering is bevestigd',
          life: 5000,
        })

        if (currentSession.metadata?.reservation) {
          const res = await getReservation(+currentSession.metadata.reservation)

          if (res) {
            await mail.reservationSuccess({
              props: {
                name: res.name,
                date: formatDateMail(res.day),
                time: formatHour(res.start),
              },
              to: res.email as string,
            })
          }
        }
      }
    }
    finally {
      removeQuery(['session_id'])
    }
  }

  async function cancelUnpaidReservation(): Promise<void> {
    toast.add({
      severity: 'error',
      summary: 'Oeps!',
      detail: 'Het lijkt erop dat er een probleem is met de betaling',
      life: 5000,
    })
  }

  async function init(): Promise<void> {
    loading.value = true

    try {
      subscribe()

      const { day, session_id } = route.query

      if (day) {
        const date = formatDay(new Date(day as string))

        isValidDateString(day as string) && rosterStore.getDayRoster(date)
          ? form.value.day = date
          : removeQuery(['day'])
      }
      else if (session_id) {
        await checkPaymentStatus(session_id as string)
      }
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

  async function getData(): Promise<void> {
    const { event } = route.query
    const date = new Date(shownDate.value.year, shownDate.value.month)

    events.value = await sbFetch<EventReservation[]>({
      table: 'events',
      select: '*, reservations:reservations(id, spots)',
      date,
    })

    // Fetch single event if query param is present and its not in the current fetched month
    if (event && !isNaN(+event) && !events.value.find(({ id }) => id === +event)) {
      const fetchedEvent = await supabase
        .from('events')
        .select('*, reservations:reservations(id, spots)')
        .eq('id', +event)

      if (fetchedEvent.data?.length) {
        events.value.push(fetchedEvent.data[0])
      }
    }

    reservations.value = await sbFetch<ReservationRow[]>({
      table: 'reservations',
      date,
    })
  }

  function subscribe() {
    const { gte } = sbDateFilters()

    supabase
      .channel('reservation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `day=gte.${gte}`,
        },
        async () => await getData(),
      ).subscribe()
  }

  function unsubscribe() {
    supabase.removeAllChannels()
  }

  async function createSession(id: number): Promise<void> {
    const spotsNumber = form.value?.spots && !isNaN(+form.value.spots)
      ? +form.value.spots
      : 1

    const url = await $fetch('/api/stripe/session', {
      method: 'POST',
      body: {
        reservation: id,
        name: selectedEvent.value?.name,
        amount: selectedEvent.value?.price,
        quantity: selectedEvent.value?.unitPrice ? spotsNumber : 1,
      },
    })

    if (!url) {
      throw new Error('No session url returned')
    }

    navigateTo(url, { external: true })
  }

  return {
    events,
    selectedEvent,
    informationEvent,
    reservations,
    loading,
    sidebarOpen,
    paymentPending,
    activeStep,
    form,
    shownDate,
    init,
    subscribe,
    unsubscribe,
    createReservation,
    createSession,
  }
})
