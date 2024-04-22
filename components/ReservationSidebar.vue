<script setup lang="ts">
const store = useReservationStore()
const toast = useToast()

const loading = ref<boolean>(false)

async function submit (form: ReservationInsert): Promise<void> {
  try {
    loading.value = true
    const payment_pending = form.type !== 'reservation'

    if (store.selectedEvent) {
      form = {
        ...form,
        event: store.selectedEvent.id,
        day: store.selectedEvent.day,
        start: store.selectedEvent.start,
        end: store.selectedEvent.end,
        type: 'event'
      }
    }

    await store.createReservation({ ...form, payment_pending })

    if (payment_pending) {
      // navigate to stripe payment page
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Oeps!',
      detail: 'Het lijkt erop dat er een probleem was met het maken van een reservatie',
      life: 5000
    })
  } finally {
    loading.value = false
    store.sidebarOpen = false
  }
}
</script>

<template>
  <Sidebar
    v-model:visible="store.sidebarOpen"
    position="right"
  >
    <template #header>
      <span class="head-3">
        {{ store.selectedEvent ? 'Reservatie maken voor ' : 'Reservatie maken' }}
        <span v-if="store.selectedEvent" class="text-secondary">
          {{ store.selectedEvent.name }}
        </span>
      </span>
    </template>
    <Loader v-if="loading" class="w-[120px] mx-auto text-primary" />
    <FormKit
      v-else
      type="form"
      submit-label="Reservatie maken"
      :config="{ validationVisibility: 'blur' }"
      @submit="submit"
    >
      <BasicForm />
    </FormKit>
  </Sidebar>
</template>
