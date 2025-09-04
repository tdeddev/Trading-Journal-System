<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Trading Journal
        </h1>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            create a new account
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="form-label">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.email }"
                placeholder="your.email@example.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.email }}
              </p>
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="form-label">
              Password
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                  class="h-5 w-5 text-gray-400"
                />
              </button>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.password }}
              </p>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-400">
                  {{ authStore.error }}
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon 
                v-if="authStore.loading" 
                name="heroicons:arrow-path" 
                class="animate-spin -ml-1 mr-3 h-5 w-5" 
              />
              {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p class="text-sm text-blue-800 dark:text-blue-300 mb-2 font-medium">
            Demo Credentials:
          </p>
          <p class="text-xs text-blue-700 dark:text-blue-400">
            Email: demo@trader.com<br>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  auth: false
})

useHead({
  title: 'Sign In - Trading Journal System'
})

const authStore = useAuthStore()
const router = useRouter()

// Form data
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Form validation
const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

// Validate form
const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }
  
  if (!form.email.includes('@')) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  
  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }
  
  return true
}

// Handle login
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  const result = await authStore.login({
    email: form.email,
    password: form.password
  })
  
  if (result.success) {
    // Redirect to dashboard
    await router.push('/dashboard')
  }
}

// Auto-redirect if already authenticated
watchEffect(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>