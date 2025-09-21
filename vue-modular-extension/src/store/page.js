import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

/**
 * 页面状态管理
 * 用于控制页面显示/隐藏切换，保持组件实例不被销毁
 */
export const usePageStore = defineStore('page', () => {
  // 当前激活的页面
  const currentPage = ref('reading')
  
  // 页面历史记录（用于前进后退功能）
  const pageHistory = ref(['reading'])
  const historyIndex = ref(0)
  
  // 页面状态缓存（用于存储各页面的特定状态）
  const pageStates = reactive({
    reading: {
      // 阅读页面状态
      currentUrl: '',
      scrollPosition: 0,
      pdfPage: 1,
      pdfZoom: 1,
      lastVisited: null
    },
    pomodoro: {
      // 番茄钟页面状态
      isRunning: false,
      currentSession: 0,
      timeRemaining: 25 * 60, // 25分钟
      sessionType: 'work', // work, break, longBreak
      lastStartTime: null
    },
    settings: {
      // 设置页面状态
      activeTab: 'general',
      unsavedChanges: false,
      lastModified: null
    },
    fitness: {
      // 健身页面状态（预留）
      currentWorkout: null,
      exerciseTimer: 0,
      lastSession: null
    },
    accounting: {
      // 记账页面状态（预留）
      currentTransaction: null,
      selectedCategory: '',
      dateRange: null
    },
    notes: {
      // 笔记页面状态（预留）
      currentNote: null,
      selectedFolder: '',
      searchQuery: ''
    }
  })
  
  // 页面初始化状态（用于检查页面是否已经初始化）
  const pageInitialized = reactive({
    reading: false,
    pomodoro: false,
    settings: false,
    fitness: false,
    accounting: false,
    notes: false
  })
  
  /**
   * 设置当前页面
   * @param {string} pageName - 页面名称
   */
  const setCurrentPage = (pageName) => {
    if (currentPage.value !== pageName) {
      // 更新历史记录
      if (historyIndex.value < pageHistory.value.length - 1) {
        // 如果不在历史记录的末尾，删除后面的记录
        pageHistory.value = pageHistory.value.slice(0, historyIndex.value + 1)
      }
      
      pageHistory.value.push(pageName)
      historyIndex.value = pageHistory.value.length - 1
      
      // 限制历史记录长度
      if (pageHistory.value.length > 20) {
        pageHistory.value = pageHistory.value.slice(-20)
        historyIndex.value = pageHistory.value.length - 1
      }
      
      currentPage.value = pageName
      
      // 标记页面为已初始化
      if (!pageInitialized[pageName]) {
        pageInitialized[pageName] = true
      }
      
      console.log(`页面切换: ${pageName}`)
    }
  }
  
  /**
   * 获取指定页面的状态
   * @param {string} pageName - 页面名称
   * @returns {object} 页面状态对象
   */
  const getPageState = (pageName) => {
    return pageStates[pageName] || {}
  }
  
  /**
   * 更新指定页面的状态
   * @param {string} pageName - 页面名称
   * @param {object} newState - 新的状态数据
   */
  const updatePageState = (pageName, newState) => {
    if (pageStates[pageName]) {
      Object.assign(pageStates[pageName], newState)
    }
  }
  
  /**
   * 重置指定页面的状态
   * @param {string} pageName - 页面名称
   */
  const resetPageState = (pageName) => {
    if (pageStates[pageName]) {
      // 获取默认状态
      const defaultStates = {
        reading: {
          currentUrl: '',
          scrollPosition: 0,
          pdfPage: 1,
          pdfZoom: 1,
          lastVisited: null
        },
        pomodoro: {
          isRunning: false,
          currentSession: 0,
          timeRemaining: 25 * 60,
          sessionType: 'work',
          lastStartTime: null
        },
        settings: {
          activeTab: 'general',
          unsavedChanges: false,
          lastModified: null
        },
        fitness: {
          currentWorkout: null,
          exerciseTimer: 0,
          lastSession: null
        },
        accounting: {
          currentTransaction: null,
          selectedCategory: '',
          dateRange: null
        },
        notes: {
          currentNote: null,
          selectedFolder: '',
          searchQuery: ''
        }
      }
      
      Object.assign(pageStates[pageName], defaultStates[pageName] || {})
    }
  }
  
  /**
   * 检查页面是否已初始化
   * @param {string} pageName - 页面名称
   * @returns {boolean} 是否已初始化
   */
  const isPageInitialized = (pageName) => {
    return pageInitialized[pageName] || false
  }
  
  /**
   * 后退到上一个页面
   */
  const goBack = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      currentPage.value = pageHistory.value[historyIndex.value]
      return true
    }
    return false
  }
  
  /**
   * 前进到下一个页面
   */
  const goForward = () => {
    if (historyIndex.value < pageHistory.value.length - 1) {
      historyIndex.value++
      currentPage.value = pageHistory.value[historyIndex.value]
      return true
    }
    return false
  }
  
  /**
   * 检查是否可以后退
   */
  const canGoBack = () => {
    return historyIndex.value > 0
  }
  
  /**
   * 检查是否可以前进
   */
  const canGoForward = () => {
    return historyIndex.value < pageHistory.value.length - 1
  }
  
  /**
   * 获取页面历史记录
   */
  const getPageHistory = () => {
    return {
      history: [...pageHistory.value],
      currentIndex: historyIndex.value
    }
  }
  
  /**
   * 清空页面历史记录
   */
  const clearHistory = () => {
    pageHistory.value = [currentPage.value]
    historyIndex.value = 0
  }
  
  return {
    // 状态
    currentPage,
    pageHistory,
    historyIndex,
    pageStates,
    pageInitialized,
    
    // 方法
    setCurrentPage,
    getPageState,
    updatePageState,
    resetPageState,
    isPageInitialized,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    getPageHistory,
    clearHistory
  }
})
