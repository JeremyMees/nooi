<script lang="ts" setup>
defineProps<{
  name: string
  date: string
  time?: string
}>()
</script>

<template>
  <ELayout
    title="Jouw reservatie voor Nooi"
    preview="Jouw reservatie voor Nooi"
    :name="name"
  >
    <EText>
      We hebben je reservatie goed ontvangen en kijken uit naar je komst. Fijn dat we je mogen verwelkomen op
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
    </EText>
    <EText>
      Thomas & An
    </EText>
  </ELayout>
</template>
