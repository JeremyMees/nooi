<script setup lang="ts">
const store = useAdminStore()

const types: DatabaseTable[] = ['reservations', 'events', 'rosters']

onMounted(store.checkSession)
</script>

<template>
  <NuxtLayout>
    <UContainer v-if="store.authenticated" class="flex flex-col gap-20">
      <AdminTable v-for="type in types" :key="type" :type="type" />
    </UContainer>
    <LoginDialog />
  </NuxtLayout>
</template>
