<script setup lang="ts">
import * as z from 'zod/mini'
import type { FormSubmitEvent } from '@nuxt/ui'
import { maxSpots } from '~~/shared/constants/info'

const required = 'Dit veld is verplicht'

const props = defineProps<{
  reservation?: AdminReservationRow
  submitLabel: string
}>()

const emit = defineEmits<{ submit: [reservation: ReservationInsert] }>()

const store = useAdminStore()

const typeOptions: Option<BookingType>[] = [
  { label: 'Spel café', value: 'game' },
  { label: 'Reservatie', value: 'reservation' },
  { label: 'Event', value: 'event' },
]

const state = reactive({
  name: props.reservation?.name,
  number: props.reservation?.number,
  email: props.reservation?.email,
  type: props.reservation?.type ?? 'game',
  event: props.reservation?.event?.id,
  day: props.reservation?.day,
  start: props.reservation?.start,
  end: props.reservation?.end,
  spots: props.reservation?.spots,
  exclusive: props.reservation?.exclusive ?? false,
  info: props.reservation?.info,
})

const eventOptions = computed<Option<number>[]>(() =>
  store.events.map(event => ({
    label: `${event.name} (${formatDateUI(event.day)})`,
    value: event.id,
  })),
)

const linkedEvent = computed(() =>
  state.type === 'event'
    ? store.events.find(({ id }) => id === state.event)
    : undefined,
)

const spots = computed<{ min: number; max: number }>(() => {
  const event = linkedEvent.value

  return {
    min: event?.minSpots ?? 1,
    max: event?.spots
      ? event.spots - getReservedSpots(event.reservations)
      : maxSpots,
  }
})

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
    number: z.nullish(
      z.union([
        z.literal(''),
        z
          .string()
          .check(
            z.regex(
              /^\d{10,12}$/,
              'Telefoonnummer moet 10 tot 12 cijfers zijn',
            ),
          ),
      ]),
    ),
    email: z.nullish(
      z.union([
        z.literal(''),
        z.email('Geen geldig e-mailadres').check(z.maxLength(65)),
      ]),
    ),
    type: z.enum(['game', 'reservation', 'event'], required),
    event:
      state.type === 'event'
        ? z.number('Selecteer een event')
        : z.nullish(z.number()),
    day: state.type === 'event' ? z.nullish(z.string()) : z.string(required),
    start: state.type === 'event' ? z.nullish(z.string()) : z.string(required),
    end: z.nullish(z.string()),
    spots: z
      .number(required)
      .check(
        z.minimum(spots.value.min, `Minimum ${spots.value.min}`),
        z.maximum(spots.value.max, `Maximum ${spots.value.max}`),
      ),
    exclusive: z.boolean(),
    info: z.nullish(
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

onMounted(async () => await store.getEvents())

function submit({
  data,
}: FormSubmitEvent<z.output<typeof schema.value>>): void {
  const event = linkedEvent.value
  const contact = {
    name: data.name,
    number: data.number || null,
    email: data.email || null,
    type: data.type,
    spots: data.spots,
    info: data.info || null,
  }

  emit(
    'submit',
    event
      ? {
          ...contact,
          event: event.id,
          day: event.day,
          start: event.start,
          end: event.end,
        }
      : {
          ...contact,
          event: null,
          day: data.day!,
          start: data.start!,
          end: data.end ?? null,
          exclusive: data.exclusive,
        },
  )
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    :validate-on="['blur']"
    @submit="submit"
  >
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4">
      <UFormField label="Naam" name="name" required>
        <UInput v-model="state.name" test-id="reservation-name" />
      </UFormField>
      <UFormField label="Telefoonnummer" name="number">
        <UInput
          :model-value="state.number ?? undefined"
          test-id="reservation-number"
          type="tel"
          @update:model-value="state.number = $event"
        />
      </UFormField>
      <UFormField label="Email" name="email">
        <UInput
          :model-value="state.email ?? undefined"
          test-id="reservation-email"
          type="email"
          @update:model-value="state.email = $event"
        />
      </UFormField>
      <UFormField label="Reservatie type" name="type" required>
        <USelect
          v-model="state.type"
          test-id="reservation-type"
          :items="typeOptions"
        />
      </UFormField>
      <UFormField
        v-if="state.type === 'event'"
        label="Event"
        name="event"
        required
      >
        <USelect
          v-model="state.event"
          test-id="reservation-event"
          placeholder="Selecteer een event"
          :items="eventOptions"
        />
      </UFormField>
      <template v-else>
        <UFormField label="Datum" name="day" required>
          <FormDateInput
            :model-value="state.day ?? undefined"
            test-id="reservation-day"
            @update:model-value="state.day = $event"
          />
        </UFormField>
        <UFormField label="Startuur" name="start" required>
          <FormTimeInput
            :model-value="state.start ?? undefined"
            test-id="reservation-start"
            @update:model-value="state.start = $event"
          />
        </UFormField>
        <UFormField label="Einduur" name="end">
          <FormTimeInput
            :model-value="state.end ?? undefined"
            test-id="reservation-end"
            @update:model-value="state.end = $event"
          />
        </UFormField>
      </template>
      <UFormField label="Aantal plaatsen" name="spots" required>
        <UInputNumber
          v-model="state.spots"
          test-id="reservation-spots"
          orientation="vertical"
          :min="spots.min"
          :max="spots.max"
        />
      </UFormField>
    </div>
    <UFormField v-if="state.type !== 'event'" name="exclusive">
      <UCheckbox
        v-model="state.exclusive"
        test-id="reservation-exclusive"
        label="Exclusief"
      />
    </UFormField>
    <UFormField label="Extra info" name="info">
      <UTextarea
        :model-value="state.info ?? undefined"
        test-id="reservation-info"
        @update:model-value="state.info = $event"
      />
    </UFormField>
    <UButton test-id="reservation-submit" type="submit" :label="submitLabel" />
  </UForm>
</template>
