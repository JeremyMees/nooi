<script setup lang="ts">
const store = useReservationStore()
const roster = useRosterStore()
const toast = useToast()
const route = useRoute()

const loading = ref<boolean>(false)

const clickedRosterItem = computed(() => {
  const rosterIndex = route.query.rosterIndex

  if (rosterIndex !== undefined && roster.current.length > 0) {
    const index = parseInt(rosterIndex as string)
    return roster.current[index] || roster.current[0]
  }

  return roster.current[0]
})

const payment = computed<boolean>(() => {
  return !!(store.selectedEvent?.onlinePayment && store.selectedEvent?.price)
})

const submitLabel = computed<string>(() => {
  if (payment.value) return 'Verder naar betalen'
  else if (store.selectedEvent) return 'Inschrijven'
  else if (route.query.type === 'game') return 'Boeken'
  else return 'Reserven'
})

async function submit(form: ReservationInsert): Promise<void> {
  loading.value = true
  const eventName = store.selectedEvent?.name

  try {
    if (store.selectedEvent && route.query.event) {
      form = {
        ...form,
        event: store.selectedEvent.id,
        day: store.selectedEvent.day,
        start: store.selectedEvent.start,
        end: store.selectedEvent.end,
        type: 'event',
      }
    }
    else {
      form = {
        ...form,
        type: route.query.type === 'game' ? 'game' : 'reservation',
        day: store.form.day || '',
      }
    }

    const { id } = await store.createReservation({ ...form, paymentNeeded: payment.value })

    if (payment.value) {
      await store.createSession(id)
    }
    else {
      await notifyUser(form.type, {
        props: {
          name: form.name,
          date: formatDateMail(form.day),
          time: formatHour(form.start),
          ...(form.type === 'event' ? { event: eventName } : {}),
        },
        to: form.email as string,
      })
    }
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Oeps!',
      detail: 'Het lijkt erop dat er een probleem was met het maken van een reservatie',
      life: 5000,
    })
  }
  finally {
    if (!payment.value) {
      loading.value = false
      store.sidebarOpen = false
    }
  }
}

async function notifyUser(type: BookingType, payload: Pick<Mail, 'to' | 'props'>): Promise<void> {
  const endpoints = [
    '/api/mail/event-success',
    '/api/mail/reservation-success',
    '/api/mail/booking-success',
  ]

  const details = [
    `Je bent ingeschreven voor ${payload.props.event}. Tot binnenkort!`,
    'We hebben je boeking goed ontvangen. Tot binnenkort!',
    'Je reservatie is bevestigd. Tot binnenkort!',
  ]

  const index = type === 'event' ? 0 : type === 'game' ? 1 : 2

  await useFetch(endpoints[index], {
    method: 'POST',
    body: payload,
  })

  toast.add({
    detail: details[index],
    severity: 'success',
    summary: 'Gelukt!',
    life: 5000,
  })
}
</script>

<template>
  <Sidebar
    v-model:visible="store.sidebarOpen"
    position="right"
  >
    <template #header>
      <div>
        <p class="head-3">
          {{
            store.selectedEvent
              ? 'Inschrijven voor '
              : $route.query.type === 'game' ? 'Boek een tafel' : 'Reservatie / Verhuur'
          }}
          <span
            v-if="store.selectedEvent"
            class="text-secondary"
          >
            {{ store.selectedEvent?.name }}
          </span>
        </p>
        <span
          v-if="store.selectedEvent"
          class="font-medium"
        >
          {{ formatHour(store.selectedEvent.start) }}
          <span v-if="store.selectedEvent.end">
            - {{ formatHour(store.selectedEvent.end) }}
          </span>
        </span>
      </div>
    </template>
    <div
      v-if="clickedRosterItem && !clickedRosterItem.allowReservation"
      class="flex flex-col gap-4 bg-teal/10 p-4 rounded-lg"
    >
      <p class="text-sm text-gray-500">
        Voor dit tijdslot kan je niet meer reserveren.
        Er gaat wellicht een evenement door met vrije toegang.
        Al kunnen we geen zitplekje garanderen, je bent uiteraard welkom!
        We zijn open van {{ formatHour(clickedRosterItem.start) }} tot {{ formatHour(clickedRosterItem.end) }}.
      </p>
    </div>
    <template v-else>
      <Loader
        v-if="loading"
        class="w-[120px] mx-auto text-primary"
      />
      <FormKit
        v-else
        type="form"
        :submit-label="submitLabel"
        :config="{ validationVisibility: 'blur' }"
        @submit="submit"
      >
        <FormReservation :payment="payment" />
      </FormKit>
    </template>
  </Sidebar>
</template>
