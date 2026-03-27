<script setup lang="ts">
const store = useRosterStore()
const rosters = ref<RosterRow[]>([])

const filteredRoster = computed<RosterRow[]>(() => {
  return rosters.value
    .filter(({ status }) => status === 'game')
    .sort((a, b) => a.start.localeCompare(b.start))
})

onMounted(async () => {
  rosters.value = await store.fetchRoster(new Date())
})
</script>

<template>
  <AnimationReveal>
    <div
      v-if="filteredRoster.length"
      class="bg-teal max-w-5xl w-fit mx-auto text-center p-5 rounded-lg shadow"
    >
      <p class="body-small">
        Onze openingsuren zijn vandaag:
        <template
          v-for="(item, i) in filteredRoster"
          :key="item.id"
        >
          {{ formatHour(item.start) }} -
          {{ formatHour(item.end) }}{{ i !== filteredRoster.length - 1 ? ', ' : '' }}
        </template>
      </p>
    </div>
  </AnimationReveal>
</template>
