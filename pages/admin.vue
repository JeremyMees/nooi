<script setup lang="ts">
const store = useAdminStore()

const types: DatabaseTable[] = ['reservations', 'events', 'rosters']
</script>

<template>
  <NuxtLayout>
    <div
      v-if="store.authCookie === 'authenticated'"
      class="container flex flex-col gap-20"
    >
      <AdminTable
        v-for="type in types"
        :key="type"
        :type="type"
      />
    </div>
    <LoginDialog />
  </NuxtLayout>
</template>
