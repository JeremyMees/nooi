<script lang="ts" setup>
import { Text } from '@vue-email/components'
import Layout from './Layout.vue'

defineProps<{
  date: string
  success: number
  errors: number
  noMailAddress: string[]
}>()
</script>

<template>
  <Layout
    :title="`Herinnering statistieken ${date}`"
    :preview="`Herinnering statistieken ${date}`"
  >
    <Text>
      Herinnering statistieken voor {{ date }}
    </Text>
    <Text>
      Succesvol verstuurd: {{ success }}
    </Text>
    <Text>
      Errors bij versturen: {{ errors }}
    </Text>
    <Text v-if="noMailAddress.length">
      Geen emailadres gevonden voor de volgende reservaties: <br>
      {{ noMailAddress.join(', ') }}
    </Text>
  </Layout>
</template>
