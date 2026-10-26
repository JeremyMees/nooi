<script setup lang="ts">
useSeo()
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="linear-gradient(to right,#315546 70%,#53A688 100%)"
      error-color="#C35200"
    />
    <NuxtPage />
    <Toast />
  </UApp>
</template>
