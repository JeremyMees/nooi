<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <div class="space-y-5 container">
      <p class="text-[37px] font-medium text-center tracking-[1.5px]">
        KALENDER
      </p>
      <div class="flex flex-col gap-[10px] font-light text-[18px] leading-[29px]">
        <p class="text-center">
          Vind in Nooi gelijkgestemden voor zinvolle vrijetijdsbeleving, creatieve initiatieven, veilig experimenteren en sociale verdieping.
        </p>
        <p class="text-center">
          Beleef onze activiteiten, sluit je aan bij één van onze clubs, of werk samen met ons jouw idee uit.
        </p>
      </div>
    </div>
    <Reminder />
    <DatePicker class="max-w-5xl mx-auto" />
    <EventModal />
    <ReservationSidebar />
  </NuxtLayout>
</template>
