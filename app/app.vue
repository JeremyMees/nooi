<script setup lang="ts">
import { nl } from '@nuxt/ui/locale'

useSeo()
</script>

<template>
  <UApp :locale="nl">
    <NuxtLoadingIndicator
      color="linear-gradient(to right,#315546 70%,#53A688 100%)"
      error-color="#C35200"
    />
    <NuxtPage />
  </UApp>
</template>
