<script setup lang="ts">
const store = useReservationStore()
const toast = useToast()
const route = useRoute()

const visible = ref<boolean>(false)

const isFull = computed<boolean>(() => {
  return !!store.informationEvent?.spots
    && store.informationEvent.spots <= getReservedSpots(store.informationEvent.reservations)
})

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
      detail: `De inschrijvingsperiode voor ${event.name} is afgelopen.`,
      life: 5000,
    })

    removeQuery(['event', 'status'])
  }
  else {
    visible.value = !!store.informationEvent
  }
})
</script>

<template>
  <Sidebar
    v-model:visible="visible"
    position="bottom"
  >
    <template #header>
      <p class="head-3 sm:head-1">
        {{ store.informationEvent?.name }}
      </p>
    </template>

    <EventTags
      v-if="store.informationEvent"
      :event="store.informationEvent"
    />
    <p
      v-if="store.informationEvent?.description"
      class="pt-6 text-pretty"
    >
      {{ store.informationEvent.description }}
    </p>

    <div
      v-if="!isFull"
      class="flex justify-end items-center flex-wrap gap-x-4 gap-y-2 pt-8"
    >
      <p
        v-if="store.informationEvent?.bookingDeadline"
        class="mr-4 body-small text-pretty text-left"
      >
        {{ store.informationEvent?.external ? ' externe' : '' }}
        Inschrijvingen sluiten op {{ formatDateUI(store.informationEvent.bookingDeadline) }}
      </p>
      <Button
        v-if="store.informationEvent && !store.informationEvent.external"
        @click="addQuery({ status: 'reservation' })"
      >
        Inschrijven
      </Button>
    </div>
    <p
      v-else
      class="pt-8"
    >
      Het evenement is volzet. wil je op de wachtlijst? Stuur dan een mailtje naar
      <a
        href="mailto:zin@nooi.be"
        class="text-primary underline"
      >
        zin@nooi.be
      </a>.
    </p>
  </Sidebar>
</template>
