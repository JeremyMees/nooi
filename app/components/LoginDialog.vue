<script setup lang="ts">
const store = useAdminStore()

const wrongPassword = ref<boolean>(false)

const needsAuth = computed<boolean>(() => store.authenticated === false)

async function submit({ password }: AdminForm): Promise<void> {
  wrongPassword.value = !(await store.login(password))
}
</script>

<template>
  <UModal
    :open="needsAuth"
    :dismissible="false"
    :close="false"
    title="Inloggen op admin paneel"
    description="Log in met het admin wachtwoord"
    :ui="{ description: 'sr-only' }"
  >
    <template #body>
      <FormKit type="form" submit-label="Inloggen" @submit="submit">
        <FormKit
          type="password"
          name="password"
          label="Wachtwoord"
          validation="required"
        />
        <p v-if="wrongPassword" test-id="login-error" class="text-secondary">
          Wachtwoord is verkeerd
        </p>
      </FormKit>
    </template>
  </UModal>
</template>
