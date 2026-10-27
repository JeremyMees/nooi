<script setup lang="ts">
import * as z from 'zod/mini'
import type { FormSubmitEvent } from '@nuxt/ui'

const required = 'Dit veld is verplicht'

const schema = z.object({
  name: z.string(required).check(z.trim(), z.minLength(1, required)),
  theme: z.string(required).check(z.trim(), z.minLength(1, required)),
  day: z.string(required).check(z.minLength(1, required)),
  start: z.string(required).check(z.minLength(1, required)),
  end: z.nullish(z.string()),
  bookingDeadline: z.string(required).check(z.minLength(1, required)),
  minSpots: z
    .number(required)
    .check(
      z.minimum(1, 'Minimum 1 persoon'),
      z.maximum(100, 'Maximum 100 personen'),
    ),
  spots: z.nullish(
    z
      .number()
      .check(
        z.minimum(1, 'Minimum 1 plaats'),
        z.maximum(100, 'Maximum 100 plaatsen'),
      ),
  ),
  price: z.nullish(z.number().check(z.minimum(1, 'Minimum € 1'))),
  unitPrice: z.boolean(),
  onlinePayment: z.boolean(),
  external: z.boolean(),
  description: z.string(),
})

type Schema = z.output<typeof schema>

type EventForm = Omit<Schema, 'end' | 'spots' | 'price'> & {
  end: string | null
  spots: number | null
  price: number | null
}

const props = defineProps<{ event?: EventRow; submitLabel: string }>()

const emit = defineEmits<{ submit: [event: EventForm] }>()

const state = reactive<Partial<Schema>>({
  name: props.event?.name,
  theme: props.event?.theme,
  day: props.event?.day,
  start: props.event?.start,
  end: props.event?.end,
  bookingDeadline: props.event?.bookingDeadline,
  minSpots: props.event?.minSpots ?? 1,
  spots: props.event?.spots,
  price: props.event?.price,
  unitPrice: props.event?.unitPrice ?? false,
  onlinePayment: props.event?.onlinePayment ?? false,
  external: props.event?.external ?? false,
  description: props.event?.description ?? '',
})

function submit({ data }: FormSubmitEvent<Schema>): void {
  emit('submit', {
    ...data,
    end: data.end ?? null,
    spots: data.spots ?? null,
    price: data.price ?? null,
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
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4">
      <UFormField label="Naam" name="name" required>
        <UInput v-model="state.name" test-id="event-name" />
      </UFormField>
      <UFormField
        label="Thema"
        name="theme"
        help="Thema's komma gescheiden"
        required
      >
        <UInput v-model="state.theme" test-id="event-theme" />
      </UFormField>
      <UFormField label="Datum" name="day" required>
        <FormDateInput v-model="state.day" test-id="event-day" />
      </UFormField>
      <UFormField label="Startuur" name="start" required>
        <FormTimeInput v-model="state.start" test-id="event-start" />
      </UFormField>
      <UFormField label="Einduur" name="end">
        <FormTimeInput
          :model-value="state.end ?? undefined"
          test-id="event-end"
          @update:model-value="state.end = $event"
        />
      </UFormField>
      <UFormField label="Boeking deadline" name="bookingDeadline" required>
        <FormDateInput
          v-model="state.bookingDeadline"
          test-id="event-booking-deadline"
        />
      </UFormField>
      <UFormField label="Minimum personen" name="minSpots" required>
        <UInputNumber
          v-model="state.minSpots"
          orientation="vertical"
          test-id="event-min-spots"
          :min="1"
          :max="100"
        />
      </UFormField>
      <UFormField label="Aantal plaatsen" name="spots">
        <UInputNumber
          v-model="state.spots"
          orientation="vertical"
          test-id="event-spots"
          :min="1"
          :max="100"
        />
      </UFormField>
      <UFormField label="Prijs" name="price">
        <UInputNumber
          v-model="state.price"
          orientation="vertical"
          test-id="event-price"
          :min="1"
          :step="0.01"
          :format-options="{ style: 'currency', currency: 'EUR' }"
        />
      </UFormField>
    </div>
    <div class="mb-4 flex flex-col gap-2">
      <UCheckbox
        v-model="state.unitPrice"
        test-id="event-unit-price"
        label="Eenheidsprijs"
      />
      <UCheckbox
        v-model="state.onlinePayment"
        test-id="event-online-payment"
        label="Online betalen"
      />
      <UCheckbox
        v-model="state.external"
        test-id="event-external"
        label="Extern event"
      />
    </div>
    <UFormField label="Omschrijving" name="description">
      <MarkdownEditor v-model:content="state.description" />
    </UFormField>
    <UButton test-id="event-submit" type="submit" :label="submitLabel" />
  </UForm>
</template>
