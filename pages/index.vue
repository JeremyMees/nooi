<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <div v-if="store.loading">
      loading...
    </div>
    <div v-else class="flex flex-col gap-y-4 items-start">
      <p>
        reservations: {{ store.reservations.length }}
      </p>
      <p>
        events: {{ store.events.length }}
      </p>
      <Button @click="store.sidebarOpen = true">
        Reservatie maken
      </Button>
      <Button
        v-for="event in store.events"
        :key="event.id"
        @click="store.selectedEvent = event"
      >
        Reservatie maken {{ event.name }}
      </Button>
    </div>
    <ReservationSidebar />
  </NuxtLayout>
</template>
