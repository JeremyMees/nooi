<script setup lang="ts">
import * as z from 'zod/mini'
import type { FormSubmitEvent } from '@nuxt/ui'

const required = 'Dit veld is verplicht'

const schema = z.object({
  day: z.string(required).check(z.minLength(1, required)),
  start: z.string(required).check(z.minLength(1, required)),
  end: z.string(required).check(z.minLength(1, required)),
  status: z.enum(['game', 'reservation', 'occupied'], required),
  minSpots: z
    .number(required)
    .check(
      z.minimum(1, 'Minimum 1 persoon'),
      z.maximum(100, 'Maximum 100 personen'),
    ),
  allowReservation: z.boolean(),
})

type Schema = z.output<typeof schema>

const props = defineProps<{ roster?: RosterRow; submitLabel: string }>()

const emit = defineEmits<{ submit: [roster: Schema] }>()

const statusOptions: Option<RosterRow['status']>[] = [
  { label: 'Open spelcafé', value: 'game' },
  { label: 'Reservatie', value: 'reservation' },
  { label: 'Bezet', value: 'occupied' },
]

const state = reactive<Partial<Schema>>({
  day: props.roster?.day,
  start: props.roster?.start,
  end: props.roster?.end,
  status: props.roster?.status ?? 'game',
  minSpots: props.roster?.minSpots ?? 1,
  allowReservation: props.roster?.allowReservation ?? true,
})

function submit({ data }: FormSubmitEvent<Schema>): void {
  emit('submit', data)
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
      <UFormField label="Datum" name="day" required>
        <FormDateInput v-model="state.day" test-id="roster-day" />
      </UFormField>
      <UFormField label="Startuur" name="start" required>
        <FormTimeInput v-model="state.start" test-id="roster-start" />
      </UFormField>
      <UFormField label="Einduur" name="end" required>
        <FormTimeInput v-model="state.end" test-id="roster-end" />
      </UFormField>
      <UFormField label="Status" name="status" required>
        <USelect
          v-model="state.status"
          test-id="roster-status"
          :items="statusOptions"
        />
      </UFormField>
      <UFormField label="Minimum personen" name="minSpots" required>
        <UInputNumber
          v-model="state.minSpots"
          orientation="vertical"
          test-id="roster-min-spots"
          :min="1"
          :max="100"
        />
      </UFormField>
    </div>
    <UFormField name="allowReservation">
      <UCheckbox
        v-model="state.allowReservation"
        test-id="roster-allow-reservation"
        label="Toestaan om te reserveren"
      />
    </UFormField>
    <UButton test-id="roster-submit" type="submit" :label="submitLabel" />
  </UForm>
</template>
