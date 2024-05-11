<script setup lang="ts">
const store = useReservationStore()
const toast = useToast()
const route = useRoute()

const visible = ref<boolean>(false)

const freeSpots = computed<number|undefined>(() => {
  if (store.informationEvent?.spots) {
    return store.informationEvent?.spots - getReservedSpots(store.informationEvent.reservations)
  }
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

    <div class="flex flex-wrap gap-2">
      <IconLabel v-if="store.informationEvent?.day" icon="calendar">
        {{ formatDateUI(store.informationEvent.day) }}
      </IconLabel>
      <IconLabel v-if="store.informationEvent?.start" icon="clock">
        {{ formatHour(store.informationEvent.start) }}
        <template v-if="store.informationEvent?.end">
          tot {{ formatHour(store.informationEvent.end) }}
        </template>
      </IconLabel>
      <IconLabel v-if="store.informationEvent?.price" icon="wallet">
        €{{ store.informationEvent.price }} {{ store.informationEvent.onlinePayment ? 'online' : 'ter plaatse' }}
      </IconLabel>
      <IconLabel v-if="freeSpots" icon="user">
        {{ freeSpots }} vrije plaatsen
      </IconLabel>
      <IconLabel
        v-if="store.informationEvent?.min_spots && store.informationEvent.min_spots > 1"
        icon="users"
      >
        minimum voor {{ store.informationEvent.min_spots }} reserveren
      </IconLabel>
      <IconLabel v-if="store.informationEvent?.theme" icon="tag">
        {{ translateTheme(store.informationEvent.theme) }}
      </IconLabel>
    </div>
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
