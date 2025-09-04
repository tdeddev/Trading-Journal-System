<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Trading Strategies
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your Pullback, Fibonacci, Mean Reversion, and custom trading strategies
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0 flex space-x-3">
          <button 
            @click="toggleActiveOnly"
            :class="strategiesStore.activeOnly ? 'btn-primary' : 'btn-secondary'"
            class="inline-flex items-center"
          >
            <Icon name="heroicons:eye" class="w-4 h-4 mr-2" />
            {{ strategiesStore.activeOnly ? 'Active Only' : 'Show All' }}
          </button>
          
          <NuxtLink 
            to="/strategies/new"
            class="btn-primary inline-flex items-center"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            New Strategy
          </NuxtLink>
        </div>
      </div>

      <!-- Strategy Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:lightbulb" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Strategies</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ strategiesStore.strategyStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ strategiesStore.strategyStats.active }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Profitable</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ strategiesStore.strategyStats.profitable }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ strategiesStore.strategyStats.totalTrades }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performer -->
      <div v-if="strategiesStore.topPerformingStrategy" class="mb-8">
        <div class="trading-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                🏆 Top Performing Strategy
              </h3>
              <div class="flex items-center space-x-4">
                <span class="font-semibold text-xl text-gray-900 dark:text-white">
                  {{ strategiesStore.topPerformingStrategy.strategy_name }}
                </span>
                <span 
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="strategiesStore.getStrategyColor(strategiesStore.topPerformingStrategy.strategy_type)"
                >
                  {{ strategiesStore.topPerformingStrategy.strategy_type }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
              <p class="text-2xl font-bold profit-positive">
                ${{ formatNumber(strategiesStore.topPerformingStrategy.total_pnl || 0) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategies List -->
      <div class="trading-card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Your Strategies
            </h3>
            <button 
              @click="refreshStrategies"
              :disabled="strategiesStore.loading"
              class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              <Icon 
                name="heroicons:arrow-path" 
                class="w-4 h-4 mr-1"
                :class="{ 'animate-spin': strategiesStore.loading }"
              />
              Refresh
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="strategiesStore.loading" class="p-6">
          <div class="flex items-center justify-center py-8">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
            <span class="ml-2 text-gray-600 dark:text-gray-400">Loading strategies...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="strategiesStore.error" class="p-6">
          <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-400">
                  {{ strategiesStore.error }}
                </p>
                <button 
                  @click="refreshStrategies"
                  class="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="strategiesStore.strategies.length === 0" class="p-6">
          <div class="text-center py-8">
            <Icon name="heroicons:lightbulb" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              {{ strategiesStore.activeOnly ? 'No active strategies found' : 'No strategies found' }}
            </p>
            <NuxtLink 
              to="/strategies/new"
              class="btn-primary inline-flex items-center"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Create Your First Strategy
            </NuxtLink>
          </div>
        </div>

        <!-- Strategies Grid -->
        <div v-else class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="strategy in strategiesStore.strategies" 
              :key="strategy.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              :class="{ 'opacity-60': !strategy.is_active }"
            >
              <!-- Strategy Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {{ strategy.strategy_name }}
                    </h3>
                    <div 
                      class="w-2 h-2 rounded-full ml-2"
                      :class="strategy.is_active ? 'bg-green-500' : 'bg-gray-400'"
                    ></div>
                  </div>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="strategiesStore.getStrategyColor(strategy.strategy_type)"
                  >
                    {{ strategy.strategy_type }}
                  </span>
                </div>
                
                <div class="flex space-x-1">
                  <button 
                    @click="toggleStrategy(strategy.id, !strategy.is_active)"
                    class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    :title="strategy.is_active ? 'Deactivate' : 'Activate'"
                  >
                    <Icon 
                      :name="strategy.is_active ? 'heroicons:pause' : 'heroicons:play'" 
                      class="w-4 h-4" 
                    />
                  </button>
                  <button 
                    @click="refreshStrategyStats(strategy.id)"
                    class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Refresh Stats"
                  >
                    <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Performance Rating -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                  <span 
                    class="text-sm font-medium"
                    :class="strategiesStore.getPerformanceColor(
                      strategiesStore.getPerformanceRating(
                        strategy.calculated_profit_factor || 0, 
                        strategy.calculated_success_rate || 0
                      )
                    )"
                  >
                    {{ strategiesStore.getPerformanceRating(
                      strategy.calculated_profit_factor || 0, 
                      strategy.calculated_success_rate || 0
                    ) }}
                  </span>
                </div>
              </div>

              <!-- Strategy Stats -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Total Trades:</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ strategy.total_trades_count || 0 }}
                  </span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Win Rate:</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ (strategy.calculated_success_rate || 0) }}%
                  </span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Profit Factor:</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ (strategy.calculated_profit_factor || 0) }}
                  </span>
                </div>
                
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Total P&L:</span>
                  <span 
                    class="font-medium"
                    :class="(strategy.total_pnl || 0) >= 0 ? 'profit-positive' : 'profit-negative'"
                  >
                    ${{ formatNumber(strategy.total_pnl || 0) }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div v-if="strategy.description" class="mb-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ strategy.description }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <NuxtLink 
                  :to="`/strategies/${strategy.id}`"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm font-medium"
                >
                  View Details
                </NuxtLink>
                
                <div class="flex space-x-2">
                  <NuxtLink 
                    :to="`/strategies/${strategy.id}/edit`"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  >
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </NuxtLink>
                  
                  <button 
                    @click="deleteStrategy(strategy.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400"
                    :disabled="(strategy.total_trades_count || 0) > 0"
                    :title="(strategy.total_trades_count || 0) > 0 ? 'Cannot delete strategy with trades' : 'Delete strategy'"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Comparison Chart Placeholder -->
      <div class="mt-8 trading-card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Strategy Performance Comparison
          </h3>
        </div>
        
        <div class="p-6">
          <div class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-center">
              <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">Performance comparison chart</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Coming soon in Analytics phase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Strategies - Trading Journal System'
})

const strategiesStore = useStrategiesStore()

// Load strategies on mount
onMounted(() => {
  strategiesStore.fetchStrategies(true) // Start with active only
})

// Methods
const refreshStrategies = () => {
  strategiesStore.fetchStrategies(strategiesStore.activeOnly)
}

const toggleActiveOnly = () => {
  strategiesStore.fetchStrategies(!strategiesStore.activeOnly)
}

const toggleStrategy = async (id, isActive) => {
  await strategiesStore.toggleStrategyStatus(id, isActive)
}

const refreshStrategyStats = async (id) => {
  await strategiesStore.refreshStrategyStats(id)
}

const deleteStrategy = async (id) => {
  if (confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
    const result = await strategiesStore.deleteStrategy(id)
    if (!result.success && result.error?.includes('existing trades')) {
      alert('Cannot delete strategy with existing trades. Consider deactivating it instead.')
    }
  }
}

// Utility functions
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>