<script lang="ts" setup>
defineProps<{
  name: string
  date: string
  time?: string
  event?: string
}>()
</script>

<template>
  <ELayout
    title="We zien je snel in Nooi!"
    preview="We zien je snel in Nooi!"
    :name="name"
  >
    <EText>
      Graag herinneren wij je aan je
      <template v-if="event">
        inschrijving voor
        <span class="font-bold text-primary">
          {{ event }}
        </span>
      </template>
      <template v-else>
        boeking bij ons
      </template>
      op
      <span class="font-bold text-primary">
        {{ date }}
      </span>
      <template v-if="time">
        om
        <span class="font-bold text-primary">
          {{ time }}
        </span>
      </template>.
    </EText>
    <EText>
      Heb je nog vragen? Laat het ons weten.
    </EText>
    <EText>
      Tot snel!
      <br>
      Thomas & An
    </EText>
  </ELayout>
</template>
