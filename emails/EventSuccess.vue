<script lang="ts" setup>
import { Text } from '@vue-email/components'
import Layout from './Layout.vue'

defineProps<{
  name: string
  date: string
  event: string
  time?: string
}>()
</script>

<template>
  <Layout
    title="Jouw inschrijving voor Nooi"
    preview="Jouw inschrijving bij Nooi"
    :name="name"
  >
    <Text>
      We hebben je inschrijving voor {{ event }} goed ontvangen en kijken uit naar je komst. Fijn dat we je mogen verwelkomen op
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
