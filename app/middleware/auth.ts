export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  // Siempre verificar sesión en SSR para evitar flash
  if (import.meta.server || !isAuthenticated.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
