<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const notFound = computed<boolean>(() => props.error.statusCode === 404)

useSeo()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <UError
        as="div"
        :error="{
          statusCode: error.status,
          statusMessage: notFound
            ? 'Deze pagina bestaat niet'
            : 'Er ging iets mis',
          message: notFound
            ? 'Misschien is de link verouderd of zit er een typfout in.'
            : 'Probeer het later opnieuw of neem contact met ons op.',
        }"
        :clear="{ label: 'Terug naar de kalender', size: 'lg' }"
        redirect="/"
      />
    </NuxtLayout>
  </UApp>
</template>
