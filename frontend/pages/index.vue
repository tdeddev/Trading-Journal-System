<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="relative bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-16 md:py-20">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Trading Journal
              <span class="text-blue-600 dark:text-blue-400">System</span>
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional Forex & Index trading journal with advanced analytics, 
              multi-user support, and comprehensive performance tracking.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink 
                to="/auth/register"
                class="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
                Get Started
              </NuxtLink>
              
              <NuxtLink 
                to="/auth/login"
                class="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
              >
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 mr-2" />
                Sign In
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Features Section -->
    <div class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Core Features
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Everything you need for professional trading analysis
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:chart-bar-square" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multi-user System
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Support for multiple traders with separate profiles and analytics
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:clock" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Trading Sessions
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Track London, New York, Tokyo, and Sydney trading sessions
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:calculator" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Auto P&L Calculation
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Automatic profit/loss calculation for Forex and Index trades
            </p>
          </div>
          
          <!-- Feature 4 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:lightbulb" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Strategy Tracking
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Monitor Pullback, Fibonacci, Mean Reversion, and custom strategies
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:heart" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Emotion Analysis
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Track emotional states and their impact on trading performance
            </p>
          </div>
          
          <!-- Feature 6 -->
          <div class="trading-card p-6">
            <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <Icon name="heroicons:chart-pie" class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Advanced Analytics
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              10+ interactive charts and comprehensive performance metrics
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats Section -->
    <div class="bg-blue-600 dark:bg-blue-800 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-white mb-2">4</div>
            <div class="text-blue-100">Trading Sessions</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-white mb-2">8</div>
            <div class="text-blue-100">Emotion Categories</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-white mb-2">10+</div>
            <div class="text-blue-100">Analytics Charts</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CTA Section -->
    <div class="bg-white dark:bg-gray-800 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Improve Your Trading?
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Start tracking your trades with our professional journal system and take your trading to the next level.
        </p>
        
        <NuxtLink 
          to="/auth/register"
          class="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
        >
          <Icon name="heroicons:rocket-launch" class="w-5 h-5 mr-2" />
          Start Your Journal
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Home - Trading Journal System',
  meta: [
    { name: 'description', content: 'Professional Forex & Index Trading Journal System with advanced analytics, multi-user support, and comprehensive performance tracking.' }
  ]
})

// Auto-redirect if already authenticated
const authStore = useAuthStore()
watchEffect(() => {
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  }
})
</script>