<script lang="ts" setup>
import { Text } from '@vue-email/components'
import Layout from './Layout.vue'

defineProps<{
  name: string
  date: string
  time?: string
}>()
</script>

<template>
  <Layout
    title="Jouw boeking voor Nooi"
    preview="Jouw boeking voor Nooi"
    :name="name"
  >
    <Text>
      We hebben je boeking goed ontvangen en kijken uit naar je komst. Fijn dat we je mogen verwelkomen op
      <span class="font-bold text-primary">
        {{ date }}
      </span>
      <template v-if="time">
        om
        <span class="font-bold text-primary">
          {{ time }}
        </span>
      </template>.
      Mocht je nog vragen hebben, aarzel dan niet om contact met ons op te nemen. Tot binnenkort!
    </Text>
    <Text>
      Thomas & An
    </Text>
  </Layout>
</template>
