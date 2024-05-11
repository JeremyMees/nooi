<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <UpcomingEvents />
    <DatePicker class="max-w-5xl mx-auto" />
    <EventModal />
    <ReservationSidebar />
  </NuxtLayout>
</template>
