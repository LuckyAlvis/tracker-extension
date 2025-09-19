/**
 * 通用工具函数
 */

/**
 * 格式化时间
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化日期
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取相对时间
 */
export const getRelativeTime = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now - target
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) {
    return '刚刚'
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return formatDate(date, 'MM-DD')
  }
}

/**
 * 防抖函数
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
}

/**
 * 生成唯一ID
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${prefix}${timestamp}${random}`
}

/**
 * 文件大小格式化
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * URL 验证
 */
export const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * 处理 URL
 */
export const processUrl = (url) => {
  if (!url) return ''
  
  // 如果是本地文件路径，转换为 file:// 协议
  if (url.match(/^[A-Za-z]:\\/)) {
    return `file:///${url.replace(/\\/g, '/')}`
  }
  
  // 如果没有协议，默认添加 https://
  if (!url.match(/^https?:\/\//) && !url.match(/^file:\/\//)) {
    return `https://${url}`
  }
  
  return url
}

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 获取文件名（不含扩展名）
 */
export const getFileName = (filename) => {
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * 颜色工具
 */
export const colorUtils = {
  // 十六进制转 RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // RGB 转十六进制
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  // 获取对比色
  getContrastColor: (hex) => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return '#000000'
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }
}

/**
 * 本地存储工具
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('存储失败:', error)
      return false
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('读取存储失败:', error)
      return defaultValue
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('删除存储失败:', error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('清空存储失败:', error)
      return false
    }
  }
}

/**
 * 数组工具
 */
export const arrayUtils = {
  // 数组去重
  unique: (arr) => [...new Set(arr)],
  
  // 数组分组
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = (groups[item[key]] = groups[item[key]] || [])
      group.push(item)
      return groups
    }, {})
  },
  
  // 数组排序
  sortBy: (arr, key, order = 'asc') => {
    return [...arr].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })
  },
  
  // 数组分页
  paginate: (arr, page, pageSize) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return arr.slice(start, end)
  }
}

/**
 * 字符串工具
 */
export const stringUtils = {
  // 截断字符串
  truncate: (str, length, suffix = '...') => {
    if (str.length <= length) return str
    return str.substring(0, length) + suffix
  },
  
  // 首字母大写
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  
  // 驼峰转短横线
  kebabCase: (str) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  },
  
  // 短横线转驼峰
  camelCase: (str) => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  }
}

/**
 * 数字工具
 */
export const numberUtils = {
  // 格式化数字
  format: (num, decimals = 0) => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  },
  
  // 随机数
  random: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  
  // 百分比
  percentage: (value, total) => {
    return total === 0 ? 0 : Math.round((value / total) * 100)
  }
}
