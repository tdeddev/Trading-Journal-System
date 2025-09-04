<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global meta
useHead({
  title: 'Trading Journal System',
  meta: [
    { name: 'description', content: 'Professional Forex & Index Trading Journal System' }
  ]
})

// Initialize auth store on app mount
const authStore = useAuthStore()
onMounted(() => {
  authStore.initializeAuth()
})
</script>