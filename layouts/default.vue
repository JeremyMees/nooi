<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />

    <main class="relative grow pb-[140px] flex flex-col gap-[60px] overflow-hidden">
      <slot />
    </main>

    <Footer />
    <SpeedInsights />
  </div>
</template>
