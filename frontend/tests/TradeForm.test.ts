import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeForm from '@/components/TradeForm.vue'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    }
  })
}))

vi.mock('@/stores/trades', () => ({
  useTradesStore: () => ({
    fetchTrades: vi.fn(),
    trades: []
  })
}))

// Mock Icon component
const MockIcon = {
  name: 'Icon',
  template: '<span class="mock-icon">{{ name }}</span>',
  props: ['name']
}

describe('TradeForm', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TradeForm, {
      global: {
        components: {
          Icon: MockIcon
        },
        stubs: {
          'client-only': {
            template: '<div><slot /></div>'
          }
        }
      }
    })
  })

  it('renders the trade form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toContain('Add New Trade')
  })

  it('displays all required form fields', () => {
    // Symbol field
    expect(wrapper.find('select[name="symbol"]').exists()).toBe(true)
    
    // Trade type
    expect(wrapper.find('select[name="trade_type"]').exists()).toBe(true)
    
    // Entry price
    expect(wrapper.find('input[type="number"][placeholder*="Entry price"]').exists()).toBe(true)
    
    // Lot size
    expect(wrapper.find('input[type="number"][placeholder*="lot size"]').exists()).toBe(true)
    
    // Entry time
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
  })

  it('validates required fields', async () => {
    const form = wrapper.find('form')
    
    // Try to submit empty form
    await form.trigger('submit.prevent')
    
    // Should show validation errors
    expect(wrapper.vm.errors).toBeDefined()
  })

  it('calculates risk correctly when stop loss is set', async () => {
    await wrapper.setData({
      tradeForm: {
        symbol: 'XAUUSD',
        trade_type: 'Long',
        entry_price: 1950.00,
        stop_loss: 1940.00,
        lot_size: 0.10,
        account_balance: 10000
      }
    })

    await wrapper.vm.$nextTick()

    // Should calculate risk based on the difference
    const calculatedRisk = wrapper.vm.calculatedRisk
    expect(calculatedRisk).toBeGreaterThan(0)
  })

  it('shows different symbols in the dropdown', () => {
    const symbolSelect = wrapper.find('select[name="symbol"]')
    const options = symbolSelect.findAll('option')
    
    expect(options.length).toBeGreaterThan(1)
    expect(options.some(option => option.text().includes('XAUUSD'))).toBe(true)
    expect(options.some(option => option.text().includes('GBPUSD'))).toBe(true)
  })

  it('toggles between Long and Short trade types', async () => {
    const tradeTypeSelect = wrapper.find('select[name="trade_type"]')
    
    await tradeTypeSelect.setValue('Long')
    expect(wrapper.vm.tradeForm.trade_type).toBe('Long')
    
    await tradeTypeSelect.setValue('Short')
    expect(wrapper.vm.tradeForm.trade_type).toBe('Short')
  })

  it('enables/disables submit button based on form validity', async () => {
    const submitButton = wrapper.find('button[type="submit"]')
    
    // Initially should be enabled (we'll assume form validation allows empty submission)
    expect(submitButton.attributes('disabled')).toBeUndefined()
    
    // Fill in required fields
    await wrapper.setData({
      tradeForm: {
        symbol: 'XAUUSD',
        trade_type: 'Long',
        entry_price: 1950.00,
        lot_size: 0.10,
        entry_time: new Date().toISOString().slice(0, 16)
      }
    })
    
    await wrapper.vm.$nextTick()
    
    // Button should still be enabled with valid data
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('resets form when reset button is clicked', async () => {
    // Fill form with data
    await wrapper.setData({
      tradeForm: {
        symbol: 'XAUUSD',
        trade_type: 'Long',
        entry_price: 1950.00,
        lot_size: 0.10
      }
    })

    // Click reset button
    const resetButton = wrapper.find('button[type="button"]')
    await resetButton.trigger('click')

    // Form should be reset
    expect(wrapper.vm.tradeForm.symbol).toBe('')
    expect(wrapper.vm.tradeForm.entry_price).toBe('')
  })

  it('displays loading state during form submission', async () => {
    await wrapper.setData({ saving: true })
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Adding Trade...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('shows success message after successful submission', async () => {
    await wrapper.setData({ 
      successMessage: 'Trade added successfully!' 
    })
    
    expect(wrapper.find('.text-green-800').text()).toBe('Trade added successfully!')
  })

  it('handles different lot size inputs correctly', async () => {
    const lotSizeInput = wrapper.find('input[placeholder*="lot size"]')
    
    await lotSizeInput.setValue('0.01')
    expect(wrapper.vm.tradeForm.lot_size).toBe(0.01)
    
    await lotSizeInput.setValue('1.5')
    expect(wrapper.vm.tradeForm.lot_size).toBe(1.5)
  })
})