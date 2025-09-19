/**
 * Chrome Extension 相关工具函数
 */

/**
 * 检查是否在 Chrome 扩展环境中
 */
export const isExtensionContext = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
}

/**
 * 安全地调用 Chrome API
 */
export const safeChrome = (callback, fallback = null) => {
  if (isExtensionContext()) {
    try {
      return callback(chrome)
    } catch (error) {
      console.error('Chrome API 调用失败:', error)
      return fallback
    }
  }
  return fallback
}

/**
 * 获取当前标签页信息
 */
export const getCurrentTab = () => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else if (tabs && tabs[0]) {
        resolve(tabs[0])
      } else {
        reject(new Error('无法获取当前标签页'))
      }
    })
  })
}

/**
 * 创建新标签页
 */
export const createTab = (url, active = true) => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    chrome.tabs.create({ url, active }, (tab) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(tab)
      }
    })
  })
}

/**
 * 发送消息到 background script
 */
export const sendMessage = (message) => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(response)
      }
    })
  })
}

/**
 * 存储数据到本地
 */
export const setStorage = (data) => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve()
      }
    })
  })
}

/**
 * 从本地存储获取数据
 */
export const getStorage = (keys = null) => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(result)
      }
    })
  })
}

/**
 * 清除本地存储数据
 */
export const clearStorage = (keys = null) => {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      reject(new Error('不在扩展环境中'))
      return
    }
    
    if (keys) {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    } else {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    }
  })
}

/**
 * 监听存储变化
 */
export const onStorageChanged = (callback) => {
  if (!isExtensionContext()) {
    return () => {}
  }
  
  chrome.storage.onChanged.addListener(callback)
  
  // 返回取消监听的函数
  return () => {
    chrome.storage.onChanged.removeListener(callback)
  }
}

/**
 * 获取扩展信息
 */
export const getExtensionInfo = () => {
  if (!isExtensionContext()) {
    return null
  }
  
  return {
    id: chrome.runtime.id,
    version: chrome.runtime.getManifest().version,
    name: chrome.runtime.getManifest().name
  }
}

/**
 * 打开侧边栏
 */
export const openSidePanel = async (tabId = null) => {
  if (!isExtensionContext()) {
    throw new Error('不在扩展环境中')
  }
  
  try {
    if (tabId) {
      await chrome.sidePanel.open({ tabId })
    } else {
      const tab = await getCurrentTab()
      await chrome.sidePanel.open({ tabId: tab.id })
    }
  } catch (error) {
    throw new Error(`打开侧边栏失败: ${error.message}`)
  }
}
