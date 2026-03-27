<script setup lang="ts">
useSeo()
</script>

<template>
  <div>
    <NuxtLoadingIndicator
      color="linear-gradient(to right,#315546 70%,#53A688 100%)"
      error-color="#C35200"
    />
    <NuxtPage />
    <Toast />
  </div>
</template>
