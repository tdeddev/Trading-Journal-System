<template>
  <div class="py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <NuxtLink 
            to="/trades"
            class="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Trade
          </h1>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Record a new trading position with all the details
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="tradesStore.error" class="mb-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div class="flex">
          <Icon name="heroicons:x-circle" class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-400">
              {{ tradesStore.error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Trade Form -->
      <div class="trading-card">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Symbol -->
              <div>
                <label for="symbol" class="form-label required">Symbol</label>
                <select 
                  id="symbol"
                  v-model="form.symbol"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.symbol }"
                >
                  <option value="">Select Symbol</option>
                  <option value="XAUUSD">XAUUSD (Gold)</option>
                  <option value="GBPUSD">GBPUSD (Cable)</option>
                  <option value="EURUSD">EURUSD (Fiber)</option>
                  <option value="USDJPY">USDJPY (Ninja)</option>
                  <option value="NAS100">NAS100 (Nasdaq)</option>
                  <option value="DJI">DJI (Dow Jones)</option>
                  <option value="SPX500">SPX500 (S&P 500)</option>
                </select>
                <p v-if="errors.symbol" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ errors.symbol }}
                </p>
              </div>

              <!-- Trade Type -->
              <div>
                <label for="trade_type" class="form-label required">Trade Type</label>
                <select 
                  id="trade_type"
                  v-model="form.trade_type"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.trade_type }"
                >
                  <option value="">Select Type</option>
                  <option value="Long">Long (Buy)</option>
                  <option value="Short">Short (Sell)</option>
                </select>
                <p v-if="errors.trade_type" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ errors.trade_type }}
                </p>
              </div>

              <!-- Entry Price -->
              <div>
                <label for="entry_price" class="form-label required">Entry Price</label>
                <input 
                  id="entry_price"
                  v-model="form.entry_price"
                  type="number"
                  step="0.00001"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.entry_price }"
                  placeholder="1850.50"
                />
                <p v-if="errors.entry_price" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ errors.entry_price }}
                </p>
              </div>

              <!-- Lot Size -->
              <div>
                <label for="lot_size" class="form-label required">Lot Size</label>
                <input 
                  id="lot_size"
                  v-model="form.lot_size"
                  type="number"
                  step="0.01"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.lot_size }"
                  placeholder="0.10"
                />
                <p v-if="errors.lot_size" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ errors.lot_size }}
                </p>
              </div>

              <!-- Entry Time -->
              <div>
                <label for="entry_time" class="form-label required">Entry Date & Time</label>
                <input 
                  id="entry_time"
                  v-model="form.entry_time"
                  type="datetime-local"
                  required
                  class="form-input"
                  :class="{ 'border-red-500': errors.entry_time }"
                />
                <p v-if="errors.entry_time" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ errors.entry_time }}
                </p>
              </div>
            </div>
          </div>

          <!-- Risk Management -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Risk Management
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Stop Loss -->
              <div>
                <label for="stop_loss" class="form-label">Stop Loss</label>
                <input 
                  id="stop_loss"
                  v-model="form.stop_loss"
                  type="number"
                  step="0.00001"
                  class="form-input"
                  placeholder="1840.00"
                />
              </div>

              <!-- Take Profit -->
              <div>
                <label for="take_profit" class="form-label">Take Profit</label>
                <input 
                  id="take_profit"
                  v-model="form.take_profit"
                  type="number"
                  step="0.00001"
                  class="form-input"
                  placeholder="1870.00"
                />
              </div>
            </div>
          </div>

          <!-- Strategy & Psychology -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Strategy & Psychology
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Strategy -->
              <div>
                <label for="strategy_id" class="form-label">Strategy</label>
                <select 
                  id="strategy_id"
                  v-model="form.strategy_id"
                  class="form-input"
                >
                  <option value="">Select Strategy (Optional)</option>
                  <option value="1">Pullback Strategy</option>
                  <option value="2">Fibonacci Retracement</option>
                  <option value="3">Mean Reversion</option>
                  <option value="4">Custom Strategy</option>
                </select>
              </div>

              <!-- Emotion -->
              <div>
                <label for="emotion" class="form-label">Emotional State</label>
                <select 
                  id="emotion"
                  v-model="form.emotion"
                  class="form-input"
                >
                  <option value="">Select Emotion (Optional)</option>
                  <option value="Confident">😎 Confident</option>
                  <option value="Anxious">😰 Anxious</option>
                  <option value="Greedy">🤑 Greedy</option>
                  <option value="Fearful">😨 Fearful</option>
                  <option value="Patient">😌 Patient</option>
                  <option value="Impulsive">🤯 Impulsive</option>
                  <option value="Disciplined">🧘 Disciplined</option>
                  <option value="Revenge">😡 Revenge</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Notes & Tags -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Additional Information
            </h3>
            
            <div class="space-y-6">
              <!-- Notes -->
              <div>
                <label for="notes" class="form-label">Trading Notes</label>
                <textarea 
                  id="notes"
                  v-model="form.notes"
                  rows="4"
                  class="form-input"
                  placeholder="Describe your trade setup, market analysis, or any observations..."
                ></textarea>
              </div>

              <!-- Tags -->
              <div>
                <label for="tags" class="form-label">Tags</label>
                <input 
                  id="tags"
                  v-model="form.tags"
                  type="text"
                  class="form-input"
                  placeholder="trend-following, breakout, london-session (comma separated)"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add tags to help categorize this trade (separated by commas)
                </p>
              </div>
            </div>
          </div>

          <!-- Risk Calculator (Optional Feature) -->
          <div v-if="form.entry_price && form.stop_loss && form.lot_size" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Risk Calculator</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700 dark:text-blue-300">Risk Amount:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100 ml-2">
                  ${{ calculateRisk() }}
                </span>
              </div>
              <div>
                <span class="text-blue-700 dark:text-blue-300">Risk in Pips:</span>
                <span class="font-medium text-blue-900 dark:text-blue-100 ml-2">
                  {{ calculatePips() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="mb-4 sm:mb-0">
              <NuxtLink 
                to="/trades"
                class="btn-secondary inline-flex items-center"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4 mr-2" />
                Cancel
              </NuxtLink>
            </div>

            <div class="flex space-x-4">
              <button 
                type="button"
                @click="saveDraft"
                class="btn-secondary inline-flex items-center"
              >
                <Icon name="heroicons:document" class="w-4 h-4 mr-2" />
                Save Draft
              </button>

              <button 
                type="submit"
                :disabled="tradesStore.loading"
                class="btn-primary inline-flex items-center"
              >
                <Icon 
                  v-if="tradesStore.loading"
                  name="heroicons:arrow-path" 
                  class="w-4 h-4 mr-2 animate-spin" 
                />
                <Icon 
                  v-else
                  name="heroicons:plus" 
                  class="w-4 h-4 mr-2" 
                />
                {{ tradesStore.loading ? 'Adding Trade...' : 'Add Trade' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'New Trade - Trading Journal System'
})

const router = useRouter()
const tradesStore = useTradesStore()

// Form data
const form = reactive({
  symbol: '',
  trade_type: '',
  entry_price: '',
  lot_size: '',
  entry_time: '',
  stop_loss: '',
  take_profit: '',
  strategy_id: '',
  emotion: '',
  notes: '',
  tags: ''
})

// Form validation errors
const errors = reactive({
  symbol: '',
  trade_type: '',
  entry_price: '',
  lot_size: '',
  entry_time: ''
})

// Initialize form with current datetime
onMounted(() => {
  const now = new Date()
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  form.entry_time = localDateTime.toISOString().slice(0, 16)
})

// Form validation
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  let isValid = true
  
  if (!form.symbol) {
    errors.symbol = 'Symbol is required'
    isValid = false
  }
  
  if (!form.trade_type) {
    errors.trade_type = 'Trade type is required'
    isValid = false
  }
  
  if (!form.entry_price || parseFloat(form.entry_price) <= 0) {
    errors.entry_price = 'Valid entry price is required'
    isValid = false
  }
  
  if (!form.lot_size || parseFloat(form.lot_size) <= 0) {
    errors.lot_size = 'Valid lot size is required'
    isValid = false
  }
  
  if (!form.entry_time) {
    errors.entry_time = 'Entry time is required'
    isValid = false
  }
  
  return isValid
}

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  // Prepare trade data
  const tradeData = {
    symbol: form.symbol,
    trade_type: form.trade_type,
    entry_price: parseFloat(form.entry_price),
    lot_size: parseFloat(form.lot_size),
    entry_time: form.entry_time,
    stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
    take_profit: form.take_profit ? parseFloat(form.take_profit) : null,
    strategy_id: form.strategy_id ? parseInt(form.strategy_id) : null,
    emotion: form.emotion || null,
    notes: form.notes || null,
    tags: form.tags || null
  }
  
  const result = await tradesStore.createTrade(tradeData)
  
  if (result.success) {
    // Redirect to trades list
    await router.push('/trades')
  }
}

// Save as draft (placeholder)
const saveDraft = () => {
  // In a real app, this would save to localStorage or a drafts table
  localStorage.setItem('trade_draft', JSON.stringify(form))
  alert('Draft saved locally!')
}

// Risk calculator
const calculateRisk = () => {
  if (!form.entry_price || !form.stop_loss || !form.lot_size) return '0.00'
  
  const entry = parseFloat(form.entry_price)
  const stop = parseFloat(form.stop_loss)
  const lotSize = parseFloat(form.lot_size)
  
  // Simplified calculation - would need to be more sophisticated for real use
  const priceDiff = Math.abs(entry - stop)
  let multiplier = 100000 // Default forex multiplier
  
  // Adjust multiplier based on symbol
  if (form.symbol === 'XAUUSD') multiplier = 100
  if (form.symbol === 'USDJPY') multiplier = 1000
  if (['NAS100', 'DJI', 'SPX500'].includes(form.symbol)) multiplier = 1
  
  const risk = priceDiff * lotSize * multiplier
  return risk.toFixed(2)
}

const calculatePips = () => {
  if (!form.entry_price || !form.stop_loss) return '0'
  
  const entry = parseFloat(form.entry_price)
  const stop = parseFloat(form.stop_loss)
  
  // Simplified pip calculation
  let pipMultiplier = 10000
  if (form.symbol === 'USDJPY') pipMultiplier = 100
  if (form.symbol === 'XAUUSD') pipMultiplier = 10
  if (['NAS100', 'DJI', 'SPX500'].includes(form.symbol)) pipMultiplier = 1
  
  const pips = Math.abs(entry - stop) * pipMultiplier
  return pips.toFixed(1)
}
</script>

<style scoped>
.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 2px;
}
</style>