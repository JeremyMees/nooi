<script setup lang="ts">
const store = useReservationStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.unsubscribe())
</script>

<template>
  <NuxtLayout>
    <div class="space-y-5 container">
      <h1 class="text-[37px] font-medium text-center tracking-[1.5px]">
        KALENDER
      </h1>
      <div class="flex flex-col justify-center gap-[10px] font-light text-[18px] leading-[29px] max-w-5xl text-center mx-auto">
        <p>
          In de kalender krijg je een overzicht van onze events en openingstijden. Klik op één van de vakken om de exacte uren te zien en te boeken.
        </p>
        <p>
          Tijdens het open spelcafé staat onze deur open voor iedereen. Op de donkergroene momenten kan je Nooi reserveren voor je eigen activiteit. Dat is gratis, tenzij je Nooi voor jezelf wilt.
        </p>
      </div>
    </div>
    <DatePicker class="max-w-5xl mx-auto" />
    <EventModal />
    <ReservationSidebar />
  </NuxtLayout>
</template>
