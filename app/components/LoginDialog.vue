<script setup lang="ts">
import * as z from 'zod/mini'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  password: z
    .string('Dit veld is verplicht')
    .check(z.minLength(1, 'Dit veld is verplicht')),
})

type Schema = z.output<typeof schema>

const store = useAdminStore()

const state = reactive<Partial<Schema>>({ password: undefined })
const wrongPassword = ref<boolean>(false)

const needsAuth = computed<boolean>(() => store.authenticated === false)

async function submit({ data }: FormSubmitEvent<Schema>): Promise<void> {
  wrongPassword.value = !(await store.login(data.password))
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
      <UForm
        :schema="schema"
        :state="state"
        :validate-on="['blur']"
        @submit="submit"
      >
        <UFormField label="Wachtwoord" name="password" required>
          <UInput
            v-model="state.password"
            test-id="login-password"
            type="password"
            autocomplete="current-password"
          />
        </UFormField>
        <p
          v-if="wrongPassword"
          test-id="login-error"
          class="mb-4 text-secondary"
        >
          Wachtwoord is verkeerd
        </p>
        <UButton test-id="login-submit" type="submit" label="Inloggen" />
      </UForm>
    </template>
  </UModal>
</template>
