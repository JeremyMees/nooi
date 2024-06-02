export const useAdminStore = defineStore('useAdminStore', () => {
  const needsAuth = ref<boolean>(true)

  return {
    needsAuth,
  }
})
