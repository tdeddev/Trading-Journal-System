export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to initialize auth from cookies
    authStore.initializeAuth()
    
    // If still not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
      return navigateTo('/auth/login')
    }
  }
  
  // Verify token is still valid (optional background check)
  // This won't block navigation but will refresh auth state
  if (process.client) {
    authStore.verifyToken().catch(() => {
      // Token verification failed, user will be redirected by the store action
    })
  }
})