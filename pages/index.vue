<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <DatePicker class="max-w-5xl mx-auto" />
    <!-- <UpcomingEvents /> -->
    <EventModal />
    <ReservationSidebar />
  </NuxtLayout>
</template>
