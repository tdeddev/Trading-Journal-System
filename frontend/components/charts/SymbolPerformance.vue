<template>
  <div class="relative">
    <canvas 
      ref="chartCanvas"
      class="w-full h-64"
    ></canvas>
    
    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 rounded-lg"
    >
      <Icon name="heroicons:arrow-path" class="w-6 h-6 text-blue-600 animate-spin" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading chart...</span>
    </div>

    <!-- Error State -->
    <div 
      v-if="error" 
      class="absolute inset-0 flex items-center justify-center bg-red-50/80 dark:bg-red-900/20 rounded-lg"
    >
      <div class="text-center">
        <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p class="text-sm text-red-800 dark:text-red-400">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

interface Props {
  data?: any[]
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  error: ''
})

const chartCanvas = ref<HTMLCanvasElement>()
const chart = ref<Chart>()
const colorMode = useColorMode()

// Computed chart configuration
const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        label: 'P&L',
        data: [0],
        backgroundColor: ['#e5e7eb']
      }]
    }
  }

  const labels = props.data.map(item => item.symbol)
  const pnlData = props.data.map(item => parseFloat(item.total_pnl || 0))
  
  // Color bars based on profit/loss
  const backgroundColors = pnlData.map(value => 
    value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
  )
  const borderColors = pnlData.map(value => 
    value >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
  )

  return {
    labels,
    datasets: [{
      label: 'Total P&L ($)',
      data: pnlData,
      backgroundColor: backgroundColors,
      borderColor: borderColors,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: colorMode.value === 'dark' ? '#1f2937' : '#ffffff',
      titleColor: colorMode.value === 'dark' ? '#f3f4f6' : '#111827',
      bodyColor: colorMode.value === 'dark' ? '#d1d5db' : '#374151',
      borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: function(context) {
          const value = context.parsed.y
          const symbol = context.label
          const dataPoint = props.data?.find(item => item.symbol === symbol)
          
          if (dataPoint) {
            const winRate = dataPoint.total_trades > 0 ? 
              ((dataPoint.winning_trades / dataPoint.total_trades) * 100).toFixed(1) : '0.0'
            
            return [
              `P&L: $${value.toFixed(2)}`,
              `Trades: ${dataPoint.total_trades}`,
              `Win Rate: ${winRate}%`
            ]
          }
          
          return `P&L: $${value.toFixed(2)}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        color: colorMode.value === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db'
      },
      ticks: {
        color: colorMode.value === 'dark' ? '#9ca3af' : '#6b7280'
      }
    },
    y: {
      display: true,
      grid: {
        color: colorMode.value === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: colorMode.value === 'dark' ? '#4b5563' : '#d1d5db'
      },
      ticks: {
        color: colorMode.value === 'dark' ? '#9ca3af' : '#6b7280',
        callback: function(value) {
          return '$' + value.toFixed(0)
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}))

// Initialize chart
const initChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  chart.value = new Chart(chartCanvas.value, {
    type: 'bar',
    data: chartData.value,
    options: chartOptions.value
  })
}

// Update chart data
const updateChart = () => {
  if (!chart.value) return

  chart.value.data = chartData.value
  chart.value.options = chartOptions.value
  chart.value.update()
}

// Watch for data changes
watch(() => props.data, () => {
  if (chart.value) {
    updateChart()
  }
}, { deep: true })

// Watch for theme changes
watch(() => colorMode.value, () => {
  if (chart.value) {
    updateChart()
  }
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>