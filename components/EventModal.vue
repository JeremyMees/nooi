<script setup lang="ts">
const store = useReservationStore()
const toast = useToast()
const route = useRoute()

const visible = ref<boolean>(false)

const isFull = computed<boolean>(() => {
  return !!store.informationEvent?.spots
    && store.informationEvent.spots <= getReservedSpots(store.informationEvent.reservations)
})

const afterDeadline = computed<boolean>(() => {
  return store.informationEvent?.bookingDeadline
    ? isAfterDeadline(new Date(), new Date(store.informationEvent.bookingDeadline))
    : false
})

watch(visible, (value) => {
  if (!value && route.query.status === 'info') {
    removeQuery(['event', 'status'])
  }
})

watch(() => store.informationEvent, () => visible.value = !!store.informationEvent)
</script>

<template>
  <Sidebar
    v-model:visible="visible"
    position="bottom"
  >
    <template #header>
      <p class="head-3 sm:head-1">
        {{ store.informationEvent?.name }}
      </p>
    </template>

    <EventTags
      v-if="store.informationEvent"
      :event="store.informationEvent"
    />
    <ClientOnly>
      <div class="pt-6">
        <v-md-editor
          v-if="store.informationEvent?.description"
          v-model="store.informationEvent.description"
          mode="preview"
        />
      </div>
    </ClientOnly>

    <template v-if="store.informationEvent">
      <template v-if="isFull">
        <p
          v-if="store.informationEvent.external"
          class="pt-8"
        >
          Dit event is volzet.
        </p>
        <p
          v-else
          class="pt-8"
        >
          Dit event is volzet. Je kunt je inschrijven op de wachtlijst door te mailen naar
          <a
            href="mailto:zin@nooi.be"
            class="text-primary underline"
          >
            zin@nooi.be
          </a>.
          Vermeld ook je telefoonnummer.
        </p>
      </template>
      <div
        v-else-if="!store.informationEvent.external"
        class="flex justify-end items-center flex-wrap gap-x-4 gap-y-2 pt-8"
      >
        <template v-if="store.informationEvent.bookingDeadline">
          <p
            v-if="afterDeadline"
            class="body-small text-pretty text-left"
          >
            Inschrijvingen zijn gesloten.
          </p>
          <template v-else>
            <p class="mr-4 body-small text-pretty text-left">
              Inschrijvingen sluiten op {{ formatDateUI(store.informationEvent.bookingDeadline) }}
            </p>
            <Button @click="addQuery({ status: 'reservation' })">
              Inschrijven
            </Button>
          </template>
        </template>
      </div>
    </template>
  </Sidebar>
</template>

<style>
.v-md-editor--preview {
  max-height: clamp(150px, calc(100vh - 400px), 400px);
  @apply overflow-y-hidden;
}

.github-markdown-body {
  @apply p-0 pr-2;
}
</style>
