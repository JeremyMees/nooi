<script setup lang="ts">
import { Time } from '@internationalized/date'

const model = defineModel<string>()

const open = ref<boolean>(false)
const hourList = useTemplateRef<HTMLElement>('hourList')

const hours = Array.from({ length: 24 }, (_, hour) => hour)
const minutes = [0, 30]

const time = computed<Time | undefined>({
  get: () => {
    const [hour, minute] = model.value?.split(':') ?? []

    return hour && minute ? new Time(+hour, +minute) : undefined
  },
  set: value => {
    model.value = value
      ? `${padDate(value.hour)}:${padDate(value.minute)}`
      : undefined
  },
})

watch(open, async value => {
  if (!value) return

  await nextTick()
  hourList.value
    ?.querySelector('[data-selected="true"]')
    ?.scrollIntoView({ block: 'center' })
})

function pick(part: { hour?: number; minute?: number }): void {
  time.value = (time.value ?? new Time(0, 0)).set(part)

  if (part.minute !== undefined) open.value = false
}
</script>

<template>
  <UInputTime v-model="time" :hour-cycle="24" :step="{ minute: 30 }">
    <template #trailing>
      <UPopover v-model:open="open">
        <UButton
          test-id="time-input-clock"
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-clock"
          aria-label="Kies een uur"
          class="px-0"
        />
        <template #content>
          <div class="flex gap-1 p-2">
            <div
              ref="hourList"
              class="flex max-h-60 shrink-0 flex-col gap-0.5 overflow-y-auto pe-1 [scrollbar-gutter:stable] [scrollbar-width:thin]"
            >
              <UButton
                v-for="hour in hours"
                :key="hour"
                test-id="time-input-hour"
                :data-selected="time?.hour === hour"
                :label="padDate(hour)"
                :color="time?.hour === hour ? 'primary' : 'neutral'"
                :variant="time?.hour === hour ? 'solid' : 'ghost'"
                size="sm"
                class="w-12 shrink-0 justify-center"
                @click="pick({ hour })"
              />
            </div>
            <div class="flex shrink-0 flex-col gap-0.5">
              <UButton
                v-for="minute in minutes"
                :key="minute"
                test-id="time-input-minute"
                :label="padDate(minute)"
                :color="time?.minute === minute ? 'primary' : 'neutral'"
                :variant="time?.minute === minute ? 'solid' : 'ghost'"
                size="sm"
                class="w-12 shrink-0 justify-center"
                @click="pick({ minute })"
              />
            </div>
          </div>
        </template>
      </UPopover>
    </template>
  </UInputTime>
</template>
