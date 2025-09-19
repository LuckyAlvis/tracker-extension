import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用设置
  const settings = reactive({
    theme: 'light', // light, dark, high-contrast
    defaultPage: 'reading',
    lastRoute: '/reading',
    language: 'zh-CN',
    notifications: true,
    autoSave: true,
    initialized: false
  })
  
  // 应用状态
  const isLoading = ref(false)
  const notifications = ref([])
  const currentTab = ref(null)
  
  // 加载设置
  const loadSettings = async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'GET_SETTINGS'
      })
      
      if (result.success && result.data) {
        Object.assign(settings, result.data)
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
  
  // 保存设置
  const saveSettings = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        data: settings
      })
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }
  
  // 更新设置
  const updateSettings = async (newSettings) => {
    Object.assign(settings, newSettings)
    await saveSettings()
  }
  
  // 应用主题
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }
  
  // 切换主题
  const toggleTheme = async () => {
    const themes = ['light', 'dark', 'high-contrast']
    const currentIndex = themes.indexOf(settings.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    
    await updateSettings({ theme: nextTheme })
    applyTheme()
  }
  
  // 获取当前标签页信息
  const getCurrentTab = async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'GET_TAB_INFO'
      })
      
      if (result.success) {
        currentTab.value = result.data
        return result.data
      }
    } catch (error) {
      console.error('获取标签页信息失败:', error)
    }
    return null
  }
  
  // 显示通知
  const showNotification = (notification) => {
    const id = Date.now().toString()
    const notificationItem = {
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 3000,
      ...notification
    }
    
    notifications.value.push(notificationItem)
    
    // 自动移除通知
    if (notificationItem.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notificationItem.duration)
    }
    
    return id
  }
  
  // 移除通知
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // 清空所有通知
  const clearNotifications = () => {
    notifications.value = []
  }
  
  // 设置加载状态
  const setLoading = (loading) => {
    isLoading.value = loading
  }
  
  return {
    // 状态
    settings,
    isLoading,
    notifications,
    currentTab,
    
    // 方法
    loadSettings,
    saveSettings,
    updateSettings,
    applyTheme,
    toggleTheme,
    getCurrentTab,
    showNotification,
    removeNotification,
    clearNotifications,
    setLoading
  }
})
