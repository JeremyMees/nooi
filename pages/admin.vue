<script setup lang="ts">
const store = useAdminStore()
</script>

<template>
  <NuxtLayout>
    <div
      v-if="!store.needsAuth"
      class="container"
    >
      <h2>
        Admin paneel
      </h2>
    </div>
    <LoginDialog />
  </NuxtLayout>
</template>
