<script setup lang="ts">
import * as z from 'zod/mini'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  maxSpots,
  minTimeSlot,
  minTimeSlotRental,
} from '~~/shared/constants/info'

defineProps<{ submitLabel: string }>()

const emit = defineEmits<{
  submit: [booking: Omit<BookingRequest, 'type' | 'event' | 'day'>]
}>()

const store = useReservationStore()
const roster = useRosterStore()
const route = useRoute()

const required = 'Dit veld is verplicht'
const closed = 'Wij zijn niet open op dit uur'

const state = reactive({
  name: toRef(store.form, 'name'),
  number: toRef(store.form, 'number'),
  email: toRef(store.form, 'mail'),
  start: undefined as string | undefined,
  end: undefined as string | undefined,
  spots: undefined as number | undefined,
  exclusive: false,
  info: undefined as string | undefined,
})

const filteredRoster = computed<RosterRow[]>(() => {
  return roster.current
    .filter(({ status }: RosterRow) => status === route.query.type)
    .sort((a, b) => a.start.localeCompare(b.start))
})

const timeSlot = computed<number>(() => {
  return route.query.type === 'reservation' ? minTimeSlot : minTimeSlotRental
})

const asksTime = computed<boolean>(
  () => !store.selectedEvent && !!filteredRoster.value.length,
)

const asksEnd = computed<boolean>(
  () => asksTime.value && route.query.type === 'reservation',
)

const spots = computed<{ min: number; max: number }>(() => {
  return {
    min:
      store.selectedEvent?.minSpots ?? filteredRoster.value?.[0]?.minSpots ?? 1,
    max: store.selectedEvent?.spots
      ? store.selectedEvent.spots -
        getReservedSpots(store.selectedEvent.reservations)
      : route.query?.type === 'game'
        ? 8
        : maxSpots,
  }
})

const openTime = z
  .string(required)
  .check(z.refine(time => isWithinRoster(time, filteredRoster.value), closed))

const schema = computed(() =>
  z.object({
    name: z
      .string(required)
      .check(
        z.trim(),
        z.minLength(5, 'Naam moet 5 tot 45 tekens zijn'),
        z.maxLength(45, 'Naam moet 5 tot 45 tekens zijn'),
        z.regex(/^[\p{L} ]+$/u, 'Enkel letters en spaties'),
      ),
    number: z
      .string(required)
      .check(
        z.regex(/^\d{10,12}$/, 'Telefoonnummer moet 10 tot 12 cijfers zijn'),
      ),
    email: z.email('Geen geldig e-mailadres').check(z.maxLength(65)),
    start: asksTime.value ? openTime : z.optional(z.string()),
    end: asksEnd.value
      ? openTime.check(
          z.refine(
            end =>
              !state.start ||
              timeToMinutes(end) - timeToMinutes(state.start) >=
                timeSlot.value * 60,
            `Reservatie mag minimum ${timeSlot.value} uur zijn`,
          ),
        )
      : z.optional(z.string()),
    spots: z
      .number(required)
      .check(
        z.minimum(spots.value.min, `Minimum ${spots.value.min}`),
        z.maximum(spots.value.max, `Maximum ${spots.value.max}`),
      ),
    exclusive: z.boolean(),
    info: z.optional(
      z.union([
        z.literal(''),
        z
          .string()
          .check(
            z.minLength(5, 'Extra info moet 5 tot 500 tekens zijn'),
            z.maxLength(500, 'Extra info moet 5 tot 500 tekens zijn'),
          ),
      ]),
    ),
  }),
)

function submit({
  data,
}: FormSubmitEvent<z.output<typeof schema.value>>): void {
  emit('submit', {
    name: data.name,
    number: data.number,
    email: data.email,
    spots: data.spots,
    exclusive: route.query.type === 'reservation' && data.exclusive,
    ...(asksTime.value ? { start: data.start } : {}),
    ...(asksEnd.value ? { end: data.end } : {}),
    ...(data.info ? { info: data.info } : {}),
  })
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    :validate-on="['blur']"
    @submit="submit"
  >
    <UFormField label="Volledige naam" name="name" required>
      <UInput v-model="state.name" test-id="booking-name" autocomplete="name" />
    </UFormField>
    <UFormField label="Telefoonnummer" name="number" required>
      <UInput
        v-model="state.number"
        test-id="booking-number"
        type="tel"
        autocomplete="tel"
      />
    </UFormField>
    <UFormField label="Email" name="email" required>
      <UInput
        v-model="state.email"
        test-id="booking-email"
        type="email"
        autocomplete="email"
      />
    </UFormField>
    <div v-if="asksTime">
      <p test-id="booking-hours" class="body-small text-surface pb-2">
        {{
          route.query.type === 'reservation'
            ? 'Reserveren of huren is vandaag mogelijk tussen deze uren:'
            : 'Onze openingsuren zijn vandaag:'
        }}
        <template v-for="(item, i) in filteredRoster" :key="item.id">
          {{ formatHour(item.start) }} - {{ formatHour(item.end)
          }}{{ i !== filteredRoster.length - 1 ? ', ' : '' }}
        </template>
      </p>
      <UFormField
        :label="route.query.type === 'game' ? 'Tijdstip' : 'Startuur'"
        name="start"
        required
      >
        <FormTimeInput
          v-model="state.start"
          test-id="booking-start"
          :disabled="!store.form.day"
        />
      </UFormField>
    </div>
    <UFormField v-if="asksEnd" label="Einduur" name="end" required>
      <FormTimeInput
        v-model="state.end"
        test-id="booking-end"
        :disabled="!store.form.day"
      />
    </UFormField>
    <UFormField
      v-if="filteredRoster.length || store.selectedEvent"
      label="Aantal personen"
      name="spots"
      required
    >
      <UInputNumber
        v-model="state.spots"
        test-id="booking-spots"
        orientation="vertical"
        :disabled="!store.selectedEvent && !store.form.day"
        :min="spots.min"
        :max="spots.max"
      />
    </UFormField>
    <AnimationReveal>
      <div
        v-if="route.query.type === 'game' && (state.spots ?? 0) >= 8"
        test-id="booking-large-group"
        class="pb-3"
      >
        <a
          href="https://nooi.be/info/#contact"
          class="body-small text-surface pb-4 underline"
        >
          Contacteer ons via deze link om te boeken voor grotere groepen
        </a>
      </div>
    </AnimationReveal>
    <UFormField
      v-if="route.query.type === 'reservation'"
      name="exclusive"
      help="Voor exclusief gebruik betaal je € 40 per uur, ter plaatse te voldoen. Om een feest of event te organiseren, werken we op maat (zie 'locatie')."
    >
      <UCheckbox
        v-model="state.exclusive"
        test-id="booking-exclusive"
        label="Exclusief"
      />
    </UFormField>
    <UFormField label="Extra info" name="info">
      <UTextarea v-model="state.info" test-id="booking-info" />
    </UFormField>
    <UButton test-id="booking-submit" type="submit" :label="submitLabel" />
  </UForm>
</template>
