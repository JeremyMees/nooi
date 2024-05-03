<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <DatePicker class="max-w-3xl mx-auto" />
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
    </div>
    <EventModal />
    <ReservationSidebar />
  </NuxtLayout>
</template>
