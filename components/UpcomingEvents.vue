<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'

const store = useReservationStore()

const availableEvents = computed<EventReservation[]>(() => {
  return store.events.filter(({ bookingDeadline, spots, reservations }) => {
    const deadline = isBeforeDeadline(new Date(), new Date(bookingDeadline))

    return spots ? (spots <= getReservedSpots(reservations) && deadline) : deadline
  })
})
</script>

<template>
  <div
    v-if="availableEvents.length > 1"
    class="pb-8 space-y-4"
  >
    <h2 class="text-center">
      Opkomende evenementen
    </h2>
    <Swiper
      ref="swiperRef"
      :space-between="16"
      :modules="[EffectCards]"
      effect="cards"
      centered-slides
      free-mode
      grab-cursor
      class="w-full max-w-[400px]"
    >
      <SwiperSlide
        v-for="event in availableEvents"
        :key="event.id"
        class="max-w-md aspect-[9/12]"
      >
        <EventCard
          :event="event"
          class="w-full h-full"
        />
      </SwiperSlide>
    </Swiper>
  </div>
</template>
