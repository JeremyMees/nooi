<script setup lang="ts">
const store = useReservationStore()

const themes = ref<EventTheme[]>(['culinary', 'creative', 'game', 'lecture', 'market'])

function toggleTheme (theme: EventTheme): void {
  store.selectedThemes.includes(theme)
    ? store.selectedThemes.splice(store.selectedThemes.indexOf(theme), 1)
    : store.selectedThemes.push(theme)
}
</script>

<template>
  <div class="flex flex-col gap-2 items-start">
    <div class="flex flex-wrap items-center gap-4">
      <button
        v-for="theme in themes"
        :key="theme"
        class="flex items-center gap-2 group rounded-lg px-2 py-1"
        :class="[
          getEventBorder(theme),
          store.selectedThemes.includes(theme) && getEventLines(theme),
          {
            'ring': store.selectedThemes.includes(theme)
          }
        ]"
        @click="toggleTheme(theme)"
      >
        <div
          class="w-5 h-5 rounded-lg transition-colors duration-300 shadow"
          :class="[
            getEventColor(theme),
            store.selectedThemes.includes(theme) && 'border-2 border-surface-300/50'
          ]"
        />
        <span class="capitalize">
          {{ translateTheme(theme) }}
        </span>
      </button>
    </div>
    <AnimationReveal>
      <Button
        v-if="store.selectedThemes.length"
        size="small"
        text
        icon="pi pi-trash"
        severity="secondary"
        label="Verwijder thema filters"
        @click="store.selectedThemes = []"
      />
    </AnimationReveal>
  </div>
</template>
