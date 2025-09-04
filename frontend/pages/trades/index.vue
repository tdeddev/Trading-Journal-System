<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Trades
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and track your trading positions
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0">
          <NuxtLink 
            to="/trades/new"
            class="btn-primary inline-flex items-center"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            New Trade
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tradesStore.trades.length }}</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tradesStore.winRate.toFixed(1) }}%</p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p 
                class="text-2xl font-bold"
                :class="tradesStore.totalPnL >= 0 ? 'profit-positive' : 'profit-negative'"
              >
                ${{ formatNumber(tradesStore.totalPnL) }}
              </p>
            </div>
          </div>
        </div>

        <div class="trading-card p-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:calculator" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Factor</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ tradesStore.profitFactor.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="trading-card p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <!-- Symbol Filter -->
          <div>
            <label class="form-label">Symbol</label>
            <select 
              v-model="filters.symbol"
              @change="applyFilters"
              class="form-input"
            >
              <option value="">All Symbols</option>
              <option value="XAUUSD">XAUUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="EURUSD">EURUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="NAS100">NAS100</option>
              <option value="DJI">DJI</option>
              <option value="SPX500">SPX500</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="form-label">Status</label>
            <select 
              v-model="filters.trade_status"
              @change="applyFilters"
              class="form-input"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="form-label">From Date</label>
            <input 
              v-model="filters.date_from"
              @change="applyFilters"
              type="date"
              class="form-input"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="form-label">To Date</label>
            <input 
              v-model="filters.date_to"
              @change="applyFilters"
              type="date"
              class="form-input"
            />
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button 
              @click="clearFilters"
              class="btn-secondary w-full"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>

          <!-- Refresh -->
          <div class="flex items-end">
            <button 
              @click="refreshTrades"
              :disabled="tradesStore.loading"
              class="btn-primary w-full"
            >
              <Icon 
                name="heroicons:arrow-path" 
                class="w-4 h-4 mr-2"
                :class="{ 'animate-spin': tradesStore.loading }"
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Trades Table -->
      <div class="trading-card">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Your Trades
          </h3>
        </div>

        <!-- Loading State -->
        <div v-if="tradesStore.loading" class="p-6">
          <div class="flex items-center justify-center py-8">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
            <span class="ml-2 text-gray-600 dark:text-gray-400">Loading trades...</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="tradesStore.error" class="p-6">
          <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-400">
                  {{ tradesStore.error }}
                </p>
                <button 
                  @click="refreshTrades"
                  class="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="tradesStore.trades.length === 0" class="p-6">
          <div class="text-center py-8">
            <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-4">No trades found</p>
            <NuxtLink 
              to="/trades/new"
              class="btn-primary inline-flex items-center"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Your First Trade
            </NuxtLink>
          </div>
        </div>

        <!-- Trades List -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Symbol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entry
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Exit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  P&L
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr 
                v-for="trade in tradesStore.trades" 
                :key="trade.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <!-- Symbol -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div 
                      class="w-2 h-2 rounded-full mr-3"
                      :class="getStatusColor(trade.trade_status)"
                    ></div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ trade.symbol }}
                    </div>
                  </div>
                </td>

                <!-- Type -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="trade.trade_type === 'Long' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                  >
                    {{ trade.trade_type }}
                  </span>
                </td>

                <!-- Entry Price -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatPrice(trade.entry_price) }}
                </td>

                <!-- Exit Price -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ trade.exit_price ? formatPrice(trade.exit_price) : '-' }}
                </td>

                <!-- P&L -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    v-if="trade.pnl"
                    :class="trade.pnl >= 0 ? 'profit-positive' : 'profit-negative'"
                    class="font-medium"
                  >
                    ${{ formatNumber(trade.pnl) }}
                  </span>
                  <span v-else class="text-gray-500 dark:text-gray-400">-</span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusBadgeColor(trade.trade_status)"
                  >
                    {{ trade.trade_status }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(trade.entry_time) }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <NuxtLink 
                      :to="`/trades/${trade.id}`"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4" />
                    </NuxtLink>
                    
                    <NuxtLink 
                      :to="`/trades/${trade.id}/edit`"
                      class="text-gray-600 hover:text-gray-900 dark:text-gray-400"
                    >
                      <Icon name="heroicons:pencil" class="w-4 h-4" />
                    </NuxtLink>
                    
                    <button 
                      @click="deleteTrade(trade.id)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="tradesStore.pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing {{ (tradesStore.pagination.currentPage - 1) * tradesStore.pagination.perPage + 1 }}
              to {{ Math.min(tradesStore.pagination.currentPage * tradesStore.pagination.perPage, tradesStore.pagination.total) }}
              of {{ tradesStore.pagination.total }} results
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                @click="previousPage"
                :disabled="tradesStore.pagination.currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span class="text-sm text-gray-700 dark:text-gray-300">
                Page {{ tradesStore.pagination.currentPage }} of {{ tradesStore.pagination.totalPages }}
              </span>
              
              <button 
                @click="nextPage"
                :disabled="tradesStore.pagination.currentPage === tradesStore.pagination.totalPages"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
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
  title: 'Trades - Trading Journal System'
})

const tradesStore = useTradesStore()

// Filters
const filters = reactive({
  symbol: '',
  trade_status: 'all',
  date_from: '',
  date_to: ''
})

// Load trades on mount
onMounted(() => {
  tradesStore.fetchTrades()
})

// Filter methods
const applyFilters = () => {
  tradesStore.setFilters(filters)
  tradesStore.fetchTrades()
}

const clearFilters = () => {
  Object.assign(filters, {
    symbol: '',
    trade_status: 'all',
    date_from: '',
    date_to: ''
  })
  tradesStore.clearFilters()
  tradesStore.fetchTrades()
}

const refreshTrades = () => {
  tradesStore.fetchTrades()
}

// Pagination
const previousPage = () => {
  if (tradesStore.pagination.currentPage > 1) {
    tradesStore.setPage(tradesStore.pagination.currentPage - 1)
    tradesStore.fetchTrades()
  }
}

const nextPage = () => {
  if (tradesStore.pagination.currentPage < tradesStore.pagination.totalPages) {
    tradesStore.setPage(tradesStore.pagination.currentPage + 1)
    tradesStore.fetchTrades()
  }
}

// Delete trade
const deleteTrade = async (id) => {
  if (confirm('Are you sure you want to delete this trade?')) {
    const result = await tradesStore.deleteTrade(id)
    if (result.success) {
      // Refresh list if needed
      if (tradesStore.trades.length === 0 && tradesStore.pagination.currentPage > 1) {
        tradesStore.setPage(tradesStore.pagination.currentPage - 1)
        tradesStore.fetchTrades()
      }
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5
  }).format(price || 0)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open': return 'bg-blue-500'
    case 'Closed': return 'bg-green-500'
    case 'Cancelled': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Closed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}
</script>