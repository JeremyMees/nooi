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
  else return 'Reserveren'
})

function confirmation(type: BookingType, event?: string): string {
  if (type === 'event') {
    return `Je bent ingeschreven voor ${event}. Tot binnenkort!`
  }

  return type === 'game'
    ? 'We hebben je boeking goed ontvangen. Tot binnenkort!'
    : 'Je reservatie is bevestigd. Tot binnenkort!'
}

async function submit(form: Omit<BookingRequest, 'type'>): Promise<void> {
  loading.value = true

  const event = store.selectedEvent
  const fields = { ...form, spots: Number(form.spots) }
  const request: BookingRequest = event
    ? { ...fields, type: 'event', event: event.id }
    : {
        ...fields,
        type: route.query.type === 'game' ? 'game' : 'reservation',
        day: store.form.day || '',
      }

  try {
    const result = await store.book(request)

    if (result.status === 'confirmed') {
      toast.add({
        detail: confirmation(request.type, event?.name),
        severity: 'success',
        summary: 'Gelukt!',
        life: 5000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Oeps!',
      detail:
        'Het lijkt erop dat er een probleem was met het maken van een reservatie',
      life: 5000,
    })
  } finally {
    if (!payment.value) {
      loading.value = false
      store.drawerOpen = false
    }
  }
}
</script>

<template>
  <Drawer v-model:visible="store.drawerOpen" position="right">
    <template #header>
      <div>
        <p test-id="reservation-drawer-title" class="head-3">
          {{
            store.selectedEvent
              ? 'Inschrijven voor '
              : $route.query.type === 'game'
                ? 'Boek een tafel'
                : 'Reservatie / Verhuur'
          }}
          <span v-if="store.selectedEvent" class="text-secondary">
            {{ store.selectedEvent?.name }}
          </span>
        </p>
        <span v-if="store.selectedEvent" class="font-medium">
          {{ formatHour(store.selectedEvent.start) }}
          <span v-if="store.selectedEvent.end">
            - {{ formatHour(store.selectedEvent.end) }}
          </span>
        </span>
      </div>
    </template>
    <div
      v-if="clickedRosterItem && !clickedRosterItem.allowReservation"
      test-id="reservation-no-booking"
      class="flex flex-col gap-4 bg-teal/10 p-4 rounded-lg"
    >
      <p class="text-sm text-gray-500">
        Voor dit tijdslot kan je niet reserveren. Er gaat wellicht een evenement
        door met vrije toegang. Al kunnen we geen zitplekje garanderen, je bent
        uiteraard welkom! We zijn open van
        {{ formatHour(clickedRosterItem.start) }} tot
        {{ formatHour(clickedRosterItem.end) }}.
      </p>
    </div>
    <template v-else>
      <Loader v-if="loading" class="w-[120px] mx-auto text-primary" />
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
  </Drawer>
</template>
