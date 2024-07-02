<script setup lang="ts">
import type { ToastMessageOptions } from 'primevue/toast'

const store = useReservationStore()
const toast = useToast()
const route = useRoute()
const mail = useMail()

const loading = ref<boolean>(false)

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
      const payload = {
        props: {
          name: form.name,
          date: formatDateMail(form.day),
          time: formatHour(form.start),
          ...(form.type === 'event' ? { event: eventName } : {}),
        },
        to: form.email as string,
      }

      const defaultToast: ToastMessageOptions = {
        severity: 'success',
        summary: 'Gelukt!',
        life: 5000,
      }

      if (form.type === 'event') {
        await mail.eventSuccess(payload)

        toast.add({
          detail: `Je bent ingeschreven voor ${eventName}. Tot binnenkort!`,
          ...defaultToast,
        })
      }
      else if (form.type === 'game') {
        await mail.bookingSuccess(payload)

        toast.add({
          detail: 'We hebben je boeking goed ontvangen. Tot binnenkort!',
          ...defaultToast,
        })
      }
      else {
        await mail.reservationSuccess(payload)

        toast.add({
          detail: 'Je reservatie is bevestigd. Tot binnenkort!',
          ...defaultToast,
        })
      }
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
  </Sidebar>
</template>
