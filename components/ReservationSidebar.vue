<script setup lang="ts">
const stripe = await useClientStripe()
const store = useReservationStore()
const toast = useToast()
const route = useRoute()

const loading = ref<boolean>(false)
const checkout = ref()

watch(() => store.paymentPending, (pending) => {
  if (!pending) {
    checkout.value?.destroy()
  }
})

async function submit (form: ReservationInsert): Promise<void> {
  loading.value = true
  const payment = !!(store.selectedEvent?.onlinePayment && store.selectedEvent?.price)

  try {
    if (store.selectedEvent && route.query.event) {
      form = {
        ...form,
        event: store.selectedEvent.id,
        day: store.selectedEvent.day,
        start: store.selectedEvent.start,
        end: store.selectedEvent.end,
        type: 'event'
      }
    } else {
      form = {
        ...form,
        type: route.query.type === 'game' ? 'game' : 'reservation'
      }
    }

    const { id } = await store.createReservation({ ...form, paymentNeeded: payment })

    payment ? loadEmbed(id) : successToast()
  } catch (error) {
    errorToast()
  } finally {
    if (!payment) {
      loading.value = false
      store.sidebarOpen = false
    }
  }
}

function successToast (): void {
  toast.add({
    severity: 'success',
    summary: 'Gelukt!',
    detail: 'Je reservatie is succesvol aangemaakt. We kijken er naar uit je te verwelkomen!',
    life: 5000
  })
}

function errorToast (): void {
  toast.add({
    severity: 'error',
    summary: 'Oeps!',
    detail: 'Het lijkt erop dat er een probleem was met het maken van een reservatie',
    life: 5000
  })
}

async function loadEmbed (id: number): Promise<void> {
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
      <span class="head-3">
        {{
          store.selectedEvent
            ? 'Reservatie maken voor '
            : $route.query.type === 'game' ? 'Boek een tafel' : 'Reservatie / Verhuur'
        }}
        <span v-if="store.selectedEvent" class="text-secondary">
          {{ store.selectedEvent?.name }}
        </span>
      </span>
    </template>
    <Loader v-if="loading" class="w-[120px] mx-auto text-primary" />
    <FormKit
      v-else-if="!store.paymentPending"
      type="form"
      submit-label="Reservatie maken"
      :config="{ validationVisibility: 'blur' }"
      @submit="submit"
    >
      <BasicForm />
    </FormKit>
    <div
      v-show="store.paymentPending"
      id="checkout-container"
      class="w-full"
    />
  </Sidebar>
</template>
