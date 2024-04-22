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
    <div v-else>
      reservations: {{ store.reservations.length }}
      events: {{ store.events.length }}
      <Button @click="store.sidebarOpen = true">
        Open sidebar
      </Button>
    </div>
    <ReservationSidebar />
  </NuxtLayout>
</template>
