<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-white" />
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                Trading Journal
              </span>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <NuxtLink 
                to="/dashboard" 
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="heroicons:squares-2x2" class="w-4 h-4 mr-2" />
                Dashboard
              </NuxtLink>
              
              <NuxtLink 
                to="/trades" 
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-2" />
                Trades
              </NuxtLink>
              
              <NuxtLink 
                to="/sessions" 
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="heroicons:clock" class="w-4 h-4 mr-2" />
                Sessions
              </NuxtLink>
              
              <NuxtLink 
                to="/strategies" 
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="heroicons:lightbulb" class="w-4 h-4 mr-2" />
                Strategies
              </NuxtLink>
              
              <NuxtLink 
                to="/analytics" 
                class="nav-link"
                active-class="nav-link-active"
              >
                <Icon name="heroicons:chart-pie" class="w-4 h-4 mr-2" />
                Analytics
              </NuxtLink>
            </div>
          </div>

          <!-- User Menu -->
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <!-- Theme Toggle -->
              <button
                @click="toggleTheme"
                class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Icon 
                  :name="isDark ? 'heroicons:sun' : 'heroicons:moon'" 
                  class="w-5 h-5" 
                />
              </button>

              <!-- Notifications -->
              <button class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Icon name="heroicons:bell" class="w-5 h-5" />
              </button>

              <!-- Profile Dropdown -->
              <div class="ml-3 relative">
                <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
                  <button class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {{ userInitials }}
                      </span>
                    </div>
                    <span class="ml-2 text-gray-700 dark:text-gray-300">
                      {{ authStore.userDisplayName }}
                    </span>
                  </button>
                </UDropdown>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Icon 
                :name="mobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" 
                class="h-6 w-6" 
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div 
        v-show="mobileMenuOpen"
        class="md:hidden border-t border-gray-200 dark:border-gray-700"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink 
            to="/dashboard" 
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="heroicons:squares-2x2" class="w-4 h-4 mr-3" />
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/trades" 
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-3" />
            Trades
          </NuxtLink>
          
          <NuxtLink 
            to="/sessions" 
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="heroicons:clock" class="w-4 h-4 mr-3" />
            Sessions
          </NuxtLink>
          
          <NuxtLink 
            to="/strategies" 
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="heroicons:lightbulb" class="w-4 h-4 mr-3" />
            Strategies
          </NuxtLink>
          
          <NuxtLink 
            to="/analytics" 
            class="mobile-nav-link"
            @click="mobileMenuOpen = false"
          >
            <Icon name="heroicons:chart-pie" class="w-4 h-4 mr-3" />
            Analytics
          </NuxtLink>
        </div>
        
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center px-5">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                {{ userInitials }}
              </span>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800 dark:text-white">
                {{ authStore.userDisplayName }}
              </div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ authStore.user?.email }}
              </div>
            </div>
          </div>
          <div class="mt-3 px-2 space-y-1">
            <NuxtLink 
              to="/profile" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
            >
              Profile
            </NuxtLink>
            <NuxtLink 
              to="/settings" 
              class="mobile-nav-link"
              @click="mobileMenuOpen = false"
            >
              Settings
            </NuxtLink>
            <button 
              @click="handleLogout"
              class="mobile-nav-link w-full text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Trading Journal System. All rights reserved.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
              Privacy Policy
            </a>
            <a href="#" class="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const colorMode = useColorMode()

// Mobile menu state
const mobileMenuOpen = ref(false)

// Theme handling
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// User display
const userInitials = computed(() => {
  if (!authStore.user) return 'U'
  
  const firstName = authStore.user.first_name || ''
  const lastName = authStore.user.last_name || ''
  const username = authStore.user.username || ''
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  } else if (firstName) {
    return firstName[0].toUpperCase()
  } else if (username) {
    return username[0].toUpperCase()
  }
  
  return 'U'
})

// User menu items
const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'heroicons:user',
    to: '/profile'
  }, {
    label: 'Settings',
    icon: 'heroicons:cog-6-tooth',
    to: '/settings'
  }],
  [{
    label: 'Sign out',
    icon: 'heroicons:arrow-right-on-rectangle',
    click: () => handleLogout()
  }]
]

// Handle logout
const handleLogout = async () => {
  mobileMenuOpen.value = false
  await authStore.logout()
}

// Close mobile menu when clicking outside
onClickOutside(mobileMenuOpen, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center;
}

.nav-link-active {
  @apply text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20;
}

.mobile-nav-link {
  @apply block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center;
}
</style>