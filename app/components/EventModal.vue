<script setup lang="ts">
const store = useReservationStore()
const route = useRoute()

const visible = ref<boolean>(false)

const isFull = computed<boolean>(() => {
  return (
    !!store.informationEvent?.spots &&
    store.informationEvent.spots <=
      getReservedSpots(store.informationEvent.reservations)
  )
})

const afterDeadline = computed<boolean>(() => {
  return store.informationEvent?.bookingDeadline
    ? isAfterDeadline(
        new Date(),
        new Date(store.informationEvent.bookingDeadline),
      )
    : false
})

watch(visible, value => {
  if (!value && route.query.status === 'info') {
    removeQuery(['event', 'status'])
  }
})

watch(
  () => store.informationEvent,
  () => (visible.value = !!store.informationEvent),
)
</script>

<template>
  <USlideover
    v-model:open="visible"
    side="bottom"
    :description="store.informationEvent?.name"
    :ui="{ description: 'sr-only' }"
  >
    <template #title>
      <span test-id="event-modal-title" class="head-3 sm:head-1">
        {{ store.informationEvent?.name }}
      </span>
    </template>
    <template #body>
      <EventTags
        v-if="store.informationEvent"
        :event="store.informationEvent"
      />
      <ClientOnly>
        <div class="pt-6">
          <LazyMarkdownContent
            v-if="store.informationEvent?.description"
            :content="store.informationEvent.description"
            class="event-description"
          />
        </div>
      </ClientOnly>

      <template v-if="store.informationEvent">
        <template v-if="isFull">
          <p
            v-if="store.informationEvent.external"
            test-id="event-modal-full"
            class="pt-8"
          >
            Dit event is volzet.
          </p>
          <p v-else test-id="event-modal-full" class="pt-8">
            Dit event is volzet. Je kunt je inschrijven op de wachtlijst door te
            mailen naar
            <a href="mailto:zin@nooi.be" class="text-primary underline">
              zin@nooi.be </a
            >. Vermeld ook je telefoonnummer.
          </p>
        </template>
        <div
          v-else-if="!store.informationEvent.external"
          class="flex justify-end items-center flex-wrap gap-x-4 gap-y-2 pt-8"
        >
          <template v-if="store.informationEvent.bookingDeadline">
            <p v-if="afterDeadline" class="body-small text-pretty text-left">
              Inschrijvingen zijn gesloten.
            </p>
            <template v-else>
              <p class="mr-4 body-small text-pretty text-left">
                Inschrijvingen sluiten op
                {{ formatDateUI(store.informationEvent.bookingDeadline) }}
              </p>
              <UButton
                test-id="event-modal-submit"
                @click="addQuery({ status: 'reservation' })"
              >
                Inschrijven
              </UButton>
            </template>
          </template>
        </div>
      </template>
    </template>
  </USlideover>
</template>

<style>
@reference '~/assets/css/main.css';

.event-description {
  max-height: clamp(150px, calc(100vh - 400px), 400px);
  @apply overflow-y-auto pr-2;
}
</style>
