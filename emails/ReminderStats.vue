<script lang="ts" setup>
defineProps<{
  date: string
  success: number
  errors: number
  noMailAddress: string[]
}>()
</script>

<template>
  <ELayout
    :title="`Herinnering statistieken ${date}`"
    :preview="`Herinnering statistieken ${date}`"
  >
    <EText>
      Herinnering statistieken voor {{ date }}
    </EText>
    <EText>
      Succesvol verstuurd: {{ success }}
    </EText>
    <EText>
      Errors bij versturen: {{ errors }}
    </EText>
    <EText v-if="noMailAddress.length">
      Geen emailadres gevonden voor de volgende reservaties: <br>
      {{ noMailAddress.join(', ') }}
    </EText>
  </ELayout>
</template>
