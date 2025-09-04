import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationCenter from '@/components/NotificationCenter.vue'

// Mock Nuxt composables
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn()
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $api: mockApi
  })
}))

// Mock Icon component
const MockIcon = {
  name: 'Icon',
  template: '<span class="mock-icon">{{ name }}</span>',
  props: ['name']
}

describe('NotificationCenter', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    
    wrapper = mount(NotificationCenter, {
      global: {
        components: {
          Icon: MockIcon
        }
      }
    })
  })

  it('renders notification bell icon', () => {
    const bellIcon = wrapper.find('button')
    expect(bellIcon.exists()).toBe(true)
    expect(wrapper.findComponent(MockIcon).props('name')).toBe('heroicons:bell')
  })

  it('shows unread count badge when there are unread notifications', async () => {
    await wrapper.setData({ unreadCount: 3 })
    
    const badge = wrapper.find('.bg-red-500')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('3')
  })

  it('shows 9+ when unread count is greater than 9', async () => {
    await wrapper.setData({ unreadCount: 15 })
    
    const badge = wrapper.find('.bg-red-500')
    expect(badge.text()).toBe('9+')
  })

  it('toggles notification dropdown when bell is clicked', async () => {
    const bellButton = wrapper.find('button')
    
    // Initially dropdown should be hidden
    expect(wrapper.find('.absolute.right-0').exists()).toBe(false)
    
    // Click bell to show dropdown
    await bellButton.trigger('click')
    expect(wrapper.vm.showNotifications).toBe(true)
  })

  it('loads notifications when dropdown is opened for first time', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          notification_type: 'info',
          title: 'Test Notification',
          message: 'Test message',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ]
    })

    const bellButton = wrapper.find('button')
    await bellButton.trigger('click')

    expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
      params: { limit: 10, offset: 0 }
    })
  })

  it('displays notifications in dropdown', async () => {
    const notifications = [
      {
        id: 1,
        notification_type: 'info',
        title: 'Test Info',
        message: 'Info message',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        notification_type: 'success',
        title: 'Test Success',
        message: 'Success message',
        is_read: true,
        created_at: new Date().toISOString()
      }
    ]

    await wrapper.setData({ 
      showNotifications: true, 
      notifications 
    })

    const notificationItems = wrapper.findAll('[data-testid="notification-item"]')
    expect(notificationItems.length).toBe(0) // No test ID in component, so checking differently
    
    // Check if notifications are rendered by looking for titles
    expect(wrapper.text()).toContain('Test Info')
    expect(wrapper.text()).toContain('Test Success')
  })

  it('marks notification as read when clicked', async () => {
    mockApi.post.mockResolvedValue({ success: true })

    const notifications = [{
      id: 1,
      notification_type: 'info',
      title: 'Test Notification',
      message: 'Test message',
      is_read: false,
      created_at: new Date().toISOString()
    }]

    await wrapper.setData({ 
      showNotifications: true, 
      notifications,
      unreadCount: 1
    })

    // Simulate clicking on notification
    await wrapper.vm.markAsRead(1)

    expect(mockApi.post).toHaveBeenCalledWith('/notifications/mark-read/1')
    expect(wrapper.vm.unreadCount).toBe(0)
  })

  it('marks all notifications as read', async () => {
    mockApi.post.mockResolvedValue({ success: true })

    await wrapper.setData({ 
      showNotifications: true,
      unreadCount: 3
    })

    await wrapper.vm.markAllAsRead()

    expect(mockApi.post).toHaveBeenCalledWith('/notifications/mark-all-read')
    expect(wrapper.vm.unreadCount).toBe(0)
  })

  it('deletes notification when delete button is clicked', async () => {
    mockApi.delete.mockResolvedValue({ success: true })

    const notifications = [{
      id: 1,
      notification_type: 'info',
      title: 'Test Notification',
      message: 'Test message',
      is_read: false,
      created_at: new Date().toISOString()
    }]

    await wrapper.setData({ 
      showNotifications: true, 
      notifications
    })

    await wrapper.vm.deleteNotification(1)

    expect(mockApi.delete).toHaveBeenCalledWith('/notifications/1')
    expect(wrapper.vm.notifications.length).toBe(0)
  })

  it('shows loading state when fetching notifications', async () => {
    await wrapper.setData({ 
      showNotifications: true, 
      loading: true 
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading notifications...')
  })

  it('shows empty state when no notifications exist', async () => {
    await wrapper.setData({ 
      showNotifications: true, 
      loading: false,
      notifications: []
    })

    expect(wrapper.text()).toContain('No notifications yet')
  })

  it('gets correct notification icon for different types', () => {
    expect(wrapper.vm.getNotificationIcon('info')).toBe('heroicons:information-circle')
    expect(wrapper.vm.getNotificationIcon('success')).toBe('heroicons:check-circle')
    expect(wrapper.vm.getNotificationIcon('warning')).toBe('heroicons:exclamation-triangle')
    expect(wrapper.vm.getNotificationIcon('error')).toBe('heroicons:x-circle')
    expect(wrapper.vm.getNotificationIcon('milestone')).toBe('heroicons:trophy')
    expect(wrapper.vm.getNotificationIcon('achievement')).toBe('heroicons:star')
  })

  it('formats date correctly', () => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneHourAgo = new Date(now.getTime() - 3600000)
    const oneDayAgo = new Date(now.getTime() - 86400000)

    expect(wrapper.vm.formatDate(now.toISOString())).toBe('Just now')
    expect(wrapper.vm.formatDate(oneMinuteAgo.toISOString())).toBe('1m ago')
    expect(wrapper.vm.formatDate(oneHourAgo.toISOString())).toBe('1h ago')
    expect(wrapper.vm.formatDate(oneDayAgo.toISOString())).toBe('1d ago')
  })

  it('shows toast notifications', async () => {
    wrapper.vm.showToast('success', 'Test Title', 'Test Message')

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.toasts.length).toBe(1)
    expect(wrapper.vm.toasts[0].title).toBe('Test Title')
    expect(wrapper.vm.toasts[0].message).toBe('Test Message')
    expect(wrapper.vm.toasts[0].type).toBe('success')
  })

  it('auto-removes toast after timeout', async () => {
    vi.useFakeTimers()
    
    wrapper.vm.showToast('info', 'Test', 'Message')
    expect(wrapper.vm.toasts.length).toBe(1)

    // Fast-forward time
    vi.advanceTimersByTime(5000)
    
    // Wait for next tick and timeout
    await new Promise(resolve => setTimeout(resolve, 300))
    
    expect(wrapper.vm.toasts.length).toBe(0)
    
    vi.useRealTimers()
  })

  it('loads unread count on mount', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: { unread_count: 5 }
    })

    // Simulate component mount by calling the method directly
    await wrapper.vm.loadUnreadCount()

    expect(mockApi.get).toHaveBeenCalledWith('/notifications/unread-count')
    expect(wrapper.vm.unreadCount).toBe(5)
  })
})