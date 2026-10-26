<script setup lang="ts">
const store = useAdminStore()

const wrongPassword = ref<boolean>(false)

const needsAuth = computed<boolean>(() => store.authenticated === false)

async function submit({ password }: AdminForm): Promise<void> {
  wrongPassword.value = !(await store.login(password))
}
</script>

<template>
  <Dialog
    v-model:visible="needsAuth"
    modal
    header="Inloggen op admin paneel"
    :closable="false"
  >
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
  </Dialog>
</template>
