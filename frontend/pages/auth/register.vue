<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          Trading Journal
        </h1>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign in here
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="form-label">
              Username
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                autocomplete="username"
                required
                class="form-input"
                :class="{ 'border-red-500': errors.username }"
                placeholder="Choose a username"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.username }}
              </p>
            </div>
          </div>

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

          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="form-label">
                First name
              </label>
              <div class="mt-1">
                <input
                  id="firstName"
                  v-model="form.firstName"
                  name="firstName"
                  type="text"
                  autocomplete="given-name"
                  class="form-input"
                  placeholder="First name"
                />
              </div>
            </div>
            
            <div>
              <label for="lastName" class="form-label">
                Last name
              </label>
              <div class="mt-1">
                <input
                  id="lastName"
                  v-model="form.lastName"
                  name="lastName"
                  type="text"
                  autocomplete="family-name"
                  class="form-input"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          <!-- Timezone Field -->
          <div>
            <label for="timezone" class="form-label">
              Timezone
            </label>
            <div class="mt-1">
              <select
                id="timezone"
                v-model="form.timezone"
                name="timezone"
                class="form-input"
              >
                <option value="GMT">GMT (London)</option>
                <option value="EST">EST (New York)</option>
                <option value="JST">JST (Tokyo)</option>
                <option value="AEDT">AEDT (Sydney)</option>
              </select>
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
                autocomplete="new-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Create a password"
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

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="form-label">
              Confirm password
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="form-input pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                  class="h-5 w-5 text-gray-400"
                />
              </button>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <!-- Terms Agreement -->
          <div class="flex items-center">
            <input
              id="agreeTerms"
              v-model="form.agreeTerms"
              name="agreeTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label for="agreeTerms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the 
              <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">Terms of Service</a>
              and
              <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">Privacy Policy</a>
            </label>
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
              {{ authStore.loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
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
  title: 'Create Account - Trading Journal System'
})

const authStore = useAuthStore()
const router = useRouter()

// Form data
const form = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  timezone: 'GMT',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// Form validation
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validate form
const validateForm = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  if (!form.username) {
    errors.username = 'Username is required'
    return false
  }
  
  if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    return false
  }
  
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
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }
  
  if (!form.agreeTerms) {
    alert('Please agree to the Terms of Service and Privacy Policy')
    return false
  }
  
  return true
}

// Handle registration
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  const result = await authStore.register({
    username: form.username,
    email: form.email,
    password: form.password,
    first_name: form.firstName || undefined,
    last_name: form.lastName || undefined,
    timezone: form.timezone
  })
  
  if (result.success) {
    // Redirect to dashboard after successful registration
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