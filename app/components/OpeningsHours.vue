<script setup lang="ts">
const store = useRosterStore()

const today = formatDay(new Date())

const filteredRoster = computed<RosterRow[]>(() =>
  store.getDayRoster(today).filter(({ status }) => status === 'game'),
)
</script>

<template>
  <AnimationReveal>
    <div
      v-if="filteredRoster.length"
      test-id="openings-hours"
      class="bg-teal max-w-5xl w-fit mx-auto text-center p-5 rounded-lg shadow"
    >
      <p test-id="openings-hours-text" class="body-small">
        Onze openingsuren zijn vandaag:
        <template v-for="(item, i) in filteredRoster" :key="item.id">
          {{ formatHour(item.start) }} - {{ formatHour(item.end)
          }}{{ i !== filteredRoster.length - 1 ? ', ' : '' }}
        </template>
      </p>
    </div>
  </AnimationReveal>
</template>
