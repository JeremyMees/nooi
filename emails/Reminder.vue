<script lang="ts" setup>
import { Text } from '@vue-email/components'
import Layout from './Layout.vue'

defineProps<{
  name: string
  date: string
  time?: string
  event?: string
}>()
</script>

<template>
  <Layout
    title="We zien je snel in Nooi!"
    preview="We zien je snel in Nooi!"
    :name="name"
  >
    <Text>
      Graag herinneren wij je aan je
      <template v-if="event">
        inschrijving voor
        <span class="font-bold text-[#305445]">
          {{ event }}
        </span>
      </template>
      <template v-else>
        boeking bij ons
      </template>
      op
      <span class="font-bold text-[#305445]">
        {{ date }}
      </span>
      <template v-if="time">
        om
        <span class="font-bold text-[#305445]">
          {{ time }}
        </span>
      </template>.
    </Text>
    <Text>
      Heb je nog vragen? Laat het ons weten.
    </Text>
    <Text>
      Tot snel!
      <br>
      Thomas & An
    </Text>
  </Layout>
</template>
