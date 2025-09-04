<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {{ authStore.userDisplayName }}! Here's your trading overview.
        </p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Trades -->
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalTrades }}</p>
            </div>
          </div>
        </div>

        <!-- Win Rate -->
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:trophy" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.winRate }}%</p>
            </div>
          </div>
        </div>

        <!-- Total P&L -->
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p 
                class="text-2xl font-bold"
                :class="stats.totalPnL >= 0 ? 'profit-positive' : 'profit-negative'"
              >
                ${{ formatNumber(stats.totalPnL) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Active Strategies -->
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:lightbulb" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Strategies</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalStrategies }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Trades -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Recent Trades
              </h3>
              <NuxtLink 
                to="/trades"
                class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
              >
                View all
              </NuxtLink>
            </div>
          </div>
          
          <div class="p-6">
            <div v-if="recentTrades.length === 0" class="text-center py-8">
              <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">No trades yet</p>
              <NuxtLink 
                to="/trades/new"
                class="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
                Add your first trade
              </NuxtLink>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="trade in recentTrades" 
                :key="trade.id"
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="trade.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'"
                  ></div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ trade.symbol }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(trade.entry_time) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p 
                    class="font-medium"
                    :class="trade.pnl >= 0 ? 'profit-positive' : 'profit-negative'"
                  >
                    ${{ formatNumber(trade.pnl) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ trade.trade_type }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Chart Placeholder -->
        <div class="trading-card">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Equity Curve
            </h3>
          </div>
          
          <div class="p-6">
            <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-center">
                <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-500 dark:text-gray-400">Chart coming soon</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Will show your equity curve here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink 
            to="/trades/new"
            class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
          >
            <div class="flex items-center">
              <Icon name="heroicons:plus-circle" class="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <div class="ml-3">
                <p class="font-medium text-blue-900 dark:text-blue-100">New Trade</p>
                <p class="text-sm text-blue-600 dark:text-blue-400">Record a trade</p>
              </div>
            </div>
          </NuxtLink>
          
          <NuxtLink 
            to="/sessions/new"
            class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
          >
            <div class="flex items-center">
              <Icon name="heroicons:play-circle" class="w-8 h-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              <div class="ml-3">
                <p class="font-medium text-green-900 dark:text-green-100">New Session</p>
                <p class="text-sm text-green-600 dark:text-green-400">Start trading</p>
              </div>
            </div>
          </NuxtLink>
          
          <NuxtLink 
            to="/strategies"
            class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
          >
            <div class="flex items-center">
              <Icon name="heroicons:lightbulb" class="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <div class="ml-3">
                <p class="font-medium text-purple-900 dark:text-purple-100">Strategies</p>
                <p class="text-sm text-purple-600 dark:text-purple-400">Manage plans</p>
              </div>
            </div>
          </NuxtLink>
          
          <NuxtLink 
            to="/analytics"
            class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors group"
          >
            <div class="flex items-center">
              <Icon name="heroicons:chart-pie" class="w-8 h-8 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              <div class="ml-3">
                <p class="font-medium text-yellow-900 dark:text-yellow-100">Analytics</p>
                <p class="text-sm text-yellow-600 dark:text-yellow-400">View reports</p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Dashboard - Trading Journal System'
})

const authStore = useAuthStore()

// Mock data - will be replaced with real API calls
const stats = reactive({
  totalTrades: 0,
  winRate: 0,
  totalPnL: 0,
  totalStrategies: 0
})

const recentTrades = ref([])

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Load dashboard data
const loadDashboardData = async () => {
  try {
    // This will be replaced with actual API calls
    // const { $api } = useNuxtApp()
    // const response = await $api.get('/users/dashboard')
    
    // For now, use mock data
    stats.totalTrades = 156
    stats.winRate = 68.5
    stats.totalPnL = 2450.30
    stats.totalStrategies = 4
    
    recentTrades.value = [
      {
        id: 1,
        symbol: 'XAUUSD',
        trade_type: 'Long',
        pnl: 125.50,
        entry_time: '2024-01-15T14:30:00Z'
      },
      {
        id: 2,
        symbol: 'GBPUSD',
        trade_type: 'Short',
        pnl: -45.20,
        entry_time: '2024-01-15T12:15:00Z'
      },
      {
        id: 3,
        symbol: 'NAS100',
        trade_type: 'Long',
        pnl: 89.75,
        entry_time: '2024-01-15T10:45:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

// Load data on mount
onMounted(() => {
  loadDashboardData()
})
</script>