<script setup lang="ts">
import type { ToastMessageOptions } from 'primevue/toast'

const stripe = await useClientStripe()
const store = useReservationStore()
const toast = useToast()
const route = useRoute()
const mail = useMail()

const loading = ref<boolean>(false)
const checkout = ref()

const payment = computed<boolean>(() => {
  return !!(store.selectedEvent?.onlinePayment && store.selectedEvent?.price)
})

const submitLabel = computed<string>(() => {
  if (payment.value) return 'Verder naar betalen'
  else if (store.selectedEvent) return 'Inschrijven'
  else if (route.query.type === 'game') return 'Boeken'
  else return 'Reserven'
})

watch(() => store.paymentPending, (pending) => {
  if (!pending) {
    checkout.value?.destroy()
  }
})

async function submit(form: ReservationInsert): Promise<void> {
  loading.value = true

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
      loadEmbed(id)
    }
    else {
      const payload = {
        props: {
          name: form.name,
          date: formatDateUI(form.day),
          time: formatHour(form.start),
          ...(form.type === 'event' ? { event: store.selectedEvent?.name } : {}),
        },
        to: form.email,
      }

      const defaultToast: ToastMessageOptions = {
        severity: 'success',
        summary: 'Gelukt!',
        life: 5000,
      }

      if (form.type === 'event') {
        await mail.eventSuccess(payload)

        toast.add({
          detail: `Je bent ingeschreven voor ${store.selectedEvent?.name}. Tot binnenkort!`,
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

async function loadEmbed(id: number): Promise<void> {
  const payload = await store.createSession(id)
  checkout.value = await stripe.value?.initEmbeddedCheckout(payload)

  checkout.value?.mount('#checkout-container')
  store.paymentPending = id
  loading.value = false
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
      v-else-if="!store.paymentPending"
      type="form"
      :submit-label="submitLabel"
      :config="{ validationVisibility: 'blur' }"
      @submit="submit"
    >
      <BasicForm :payment="payment" />
    </FormKit>
    <div
      v-show="store.paymentPending"
      id="checkout-container"
      class="w-full"
    />
  </Sidebar>
</template>
