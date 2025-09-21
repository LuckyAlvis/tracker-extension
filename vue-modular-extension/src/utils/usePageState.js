import { computed, watch, onMounted, onUnmounted } from 'vue'
import { usePageStore } from '@store/page'

/**
 * 页面状态管理 Hook
 * 为各个页面组件提供统一的状态管理接口
 * @param {string} pageName - 页面名称
 * @param {object} defaultState - 默认状态
 * @returns {object} 状态管理对象
 */
export function usePageState(pageName, defaultState = {}) {
  const pageStore = usePageStore()
  
  // 当前页面是否激活
  const isActive = computed(() => pageStore.currentPage === pageName)
  
  // 页面是否已初始化
  const isInitialized = computed(() => pageStore.isPageInitialized(pageName))
  
  // 获取页面状态
  const state = computed(() => pageStore.getPageState(pageName))
  
  /**
   * 更新页面状态
   * @param {object} newState - 新状态
   */
  const updateState = (newState) => {
    pageStore.updatePageState(pageName, newState)
  }
  
  /**
   * 重置页面状态
   */
  const resetState = () => {
    pageStore.resetPageState(pageName)
  }
  
  /**
   * 保存状态到本地存储
   */
  const saveState = async () => {
    try {
      const stateToSave = { ...state.value }
      await chrome.runtime.sendMessage({
        type: 'SAVE_PAGE_STATE',
        data: {
          pageName,
          state: stateToSave
        }
      })
    } catch (error) {
      console.error(`保存 ${pageName} 页面状态失败:`, error)
    }
  }
  
  /**
   * 从本地存储加载状态
   */
  const loadState = async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'GET_PAGE_STATE',
        data: { pageName }
      })
      
      if (result.success && result.data) {
        updateState(result.data)
      }
    } catch (error) {
      console.error(`加载 ${pageName} 页面状态失败:`, error)
    }
  }
  
  /**
   * 页面激活时的回调
   */
  const onActivate = (callback) => {
    watch(isActive, (newActive, oldActive) => {
      if (newActive && !oldActive) {
        callback()
      }
    }, { immediate: true })
  }
  
  /**
   * 页面失活时的回调
   */
  const onDeactivate = (callback) => {
    watch(isActive, (newActive, oldActive) => {
      if (!newActive && oldActive) {
        callback()
      }
    })
  }
  
  /**
   * 页面首次初始化时的回调
   */
  const onFirstInit = (callback) => {
    watch(isInitialized, (initialized) => {
      if (initialized) {
        callback()
      }
    }, { immediate: true })
  }
  
  // 组件挂载时初始化状态
  onMounted(() => {
    if (!isInitialized.value) {
      // 初始化默认状态
      if (Object.keys(defaultState).length > 0) {
        updateState(defaultState)
      }
      
      // 尝试加载保存的状态
      loadState()
    }
  })
  
  // 组件卸载时保存状态
  onUnmounted(() => {
    if (isActive.value) {
      saveState()
    }
  })
  
  return {
    // 状态
    isActive,
    isInitialized,
    state,
    
    // 方法
    updateState,
    resetState,
    saveState,
    loadState,
    
    // 生命周期钩子
    onActivate,
    onDeactivate,
    onFirstInit
  }
}

/**
 * 复杂组件状态管理 Hook
 * 专门用于处理复杂组件（如PDF阅读器）的状态保持
 * @param {string} pageName - 页面名称
 * @param {object} options - 配置选项
 */
export function useComplexComponentState(pageName, options = {}) {
  const {
    autoSave = true,
    saveInterval = 5000,
    preserveScrollPosition = true,
    preserveFormData = true
  } = options
  
  const pageState = usePageState(pageName)
  let saveTimer = null
  
  /**
   * 保存滚动位置
   */
  const saveScrollPosition = () => {
    if (!preserveScrollPosition || !pageState.isActive.value) return
    
    const scrollElements = document.querySelectorAll('[data-preserve-scroll]')
    const scrollData = {}
    
    scrollElements.forEach((element, index) => {
      const key = element.dataset.scrollKey || `scroll_${index}`
      scrollData[key] = {
        scrollTop: element.scrollTop,
        scrollLeft: element.scrollLeft
      }
    })
    
    if (Object.keys(scrollData).length > 0) {
      pageState.updateState({ scrollPositions: scrollData })
    }
  }
  
  /**
   * 恢复滚动位置
   */
  const restoreScrollPosition = () => {
    if (!preserveScrollPosition) return
    
    const scrollPositions = pageState.state.value.scrollPositions || {}
    
    Object.entries(scrollPositions).forEach(([key, position]) => {
      const element = document.querySelector(`[data-scroll-key="${key}"]`) ||
                     document.querySelectorAll('[data-preserve-scroll]')[parseInt(key.replace('scroll_', ''))]
      
      if (element) {
        element.scrollTop = position.scrollTop || 0
        element.scrollLeft = position.scrollLeft || 0
      }
    })
  }
  
  /**
   * 保存表单数据
   */
  const saveFormData = () => {
    if (!preserveFormData || !pageState.isActive.value) return
    
    const forms = document.querySelectorAll('[data-preserve-form]')
    const formData = {}
    
    forms.forEach((form, index) => {
      const key = form.dataset.formKey || `form_${index}`
      const data = new FormData(form)
      formData[key] = Object.fromEntries(data.entries())
    })
    
    if (Object.keys(formData).length > 0) {
      pageState.updateState({ formData })
    }
  }
  
  /**
   * 恢复表单数据
   */
  const restoreFormData = () => {
    if (!preserveFormData) return
    
    const formData = pageState.state.value.formData || {}
    
    Object.entries(formData).forEach(([key, data]) => {
      const form = document.querySelector(`[data-form-key="${key}"]`) ||
                   document.querySelectorAll('[data-preserve-form]')[parseInt(key.replace('form_', ''))]
      
      if (form) {
        Object.entries(data).forEach(([fieldName, value]) => {
          const field = form.querySelector(`[name="${fieldName}"]`)
          if (field) {
            field.value = value
          }
        })
      }
    })
  }
  
  /**
   * 自动保存状态
   */
  const startAutoSave = () => {
    if (!autoSave) return
    
    saveTimer = setInterval(() => {
      saveScrollPosition()
      saveFormData()
      pageState.saveState()
    }, saveInterval)
  }
  
  /**
   * 停止自动保存
   */
  const stopAutoSave = () => {
    if (saveTimer) {
      clearInterval(saveTimer)
      saveTimer = null
    }
  }
  
  // 页面激活时开始自动保存和恢复状态
  pageState.onActivate(() => {
    setTimeout(() => {
      restoreScrollPosition()
      restoreFormData()
    }, 100) // 延迟执行，确保DOM已渲染
    
    startAutoSave()
  })
  
  // 页面失活时停止自动保存并保存当前状态
  pageState.onDeactivate(() => {
    saveScrollPosition()
    saveFormData()
    pageState.saveState()
    stopAutoSave()
  })
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopAutoSave()
  })
  
  return {
    ...pageState,
    
    // 额外方法
    saveScrollPosition,
    restoreScrollPosition,
    saveFormData,
    restoreFormData,
    startAutoSave,
    stopAutoSave
  }
}
