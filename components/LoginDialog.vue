<script setup lang="ts">
const store = useAdminStore()
const { adminPassword } = useRuntimeConfig().public
</script>

<template>
  <Dialog
    v-model:visible="store.needsAuth"
    modal
    header="Inloggen op admin paneel"
    :closable="false"
  >
    <FormKit
      type="form"
      submit-label="Inloggen"
      @submit="store.needsAuth = false"
    >
      <FormKit
        type="password"
        name="password"
        label="Wachtwoord"
        :validation="`required|is:${adminPassword}`"
        :validation-messages="{ is: 'Wachtwoord is verkeerd' }"
      />
    </FormKit>
  </Dialog>
</template>
