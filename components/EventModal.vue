<script setup lang="ts">
const store = useReservationStore()
const toast = useToast()
const route = useRoute()

const visible = ref<boolean>(false)

watch(visible, (value) => {
  if (!value && route.query.status === 'info') {
    removeQuery(['event', 'status'])
  }
})

watch(() => store.informationEvent, (event) => {
  if (event && !isBeforeDeadline(new Date(), new Date(event.bookingDeadline))) {
    toast.add({
      severity: 'info',
      summary: 'Te Laat!',
      detail: `De inschrijvingsperiode voor ${event.name} is helaas afgelopen.`,
      life: 5000
    })

    removeQuery(['event', 'status'])
  } else if (event?.spots && event.spots <= getReservedSpots(event.reservations)) {
    toast.add({
      severity: 'info',
      summary: 'Event zit vol!',
      detail: `Je bent net te laat. ${event.name} is helaas volzet.`,
      life: 5000
    })

    removeQuery(['event', 'status'])
  } else {
    visible.value = !!store.informationEvent
  }
})
</script>

<template>
  <Sidebar v-model:visible="visible" position="bottom">
    <template #header>
      <p class="head-3 sm:head-1">
        {{ store.informationEvent?.name }}
      </p>
    </template>

    <EventTags
      v-if="store.informationEvent"
      :event="store.informationEvent"
    />
    <p v-if="store.informationEvent?.description" class="pt-6 text-pretty">
      {{ store.informationEvent.description }}
    </p>

    <div class="flex justify-end items-center flex-wrap gap-x-4 gap-y-2 pt-8">
      <p
        v-if="store.informationEvent?.bookingDeadline"
        class="mr-4 text-secondary body-small text-pretty text-left"
      >
        reservaties sluiten op {{ formatDateUI(store.informationEvent.bookingDeadline) }}
      </p>
      <Button @click="addQuery({ status: 'reservation' })">
        Reserveren
      </Button>
    </div>
  </Sidebar>
</template>
