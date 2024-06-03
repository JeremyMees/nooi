<script setup lang="ts">
const store = useAdminStore()

const types: DatabaseTable[] = ['reservations', 'events', 'rosters']
</script>

<template>
  <NuxtLayout>
    <div
      v-if="!store.needsAuth"
      class="container flex flex-col gap-20"
    >
      <AdminCard
        v-for="type in types"
        :key="type"
        :type="type"
      />
    </div>
    <LoginDialog />
  </NuxtLayout>
</template>
