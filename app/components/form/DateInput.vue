<script setup lang="ts">
import { parseDate, type CalendarDate } from '@internationalized/date'

const model = defineModel<string>()

const open = ref<boolean>(false)

const date = computed<CalendarDate | undefined>({
  get: () => (model.value ? parseDate(model.value.slice(0, 10)) : undefined),
  set: value => {
    model.value = value?.toString()
    open.value = false
  },
})
</script>

<template>
  <UInputDate v-model="date">
    <template #trailing>
      <UPopover v-model:open="open">
        <UButton
          test-id="date-input-calendar"
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-calendar"
          aria-label="Kies een datum"
          class="px-0"
        />
        <template #content>
          <UCalendar v-model="date" :week-starts-on="1" class="p-2" />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
