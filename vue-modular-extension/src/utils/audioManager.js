/**
 * 音频管理器
 * 负责管理番茄钟的各种音效
 */

class AudioManager {
  constructor() {
    this.audioContext = null
    this.sounds = new Map()
    this.isEnabled = true
    this.volume = 0.7
    
    // 初始化音频上下文
    this.initAudioContext()
    
    // 预定义的音效配置
    this.soundConfigs = {
      // 番茄钟完成音效
      workComplete: {
        frequency: 800,
        duration: 0.3,
        type: 'sine',
        pattern: [
          { freq: 800, duration: 0.15 },
          { freq: 1000, duration: 0.15 },
          { freq: 1200, duration: 0.3 }
        ]
      },
      
      // 休息完成音效
      breakComplete: {
        frequency: 600,
        duration: 0.4,
        type: 'sine',
        pattern: [
          { freq: 600, duration: 0.2 },
          { freq: 500, duration: 0.2 }
        ]
      },
      
      // 10秒警告音效
      warning: {
        frequency: 1000,
        duration: 0.1,
        type: 'square',
        pattern: [
          { freq: 1000, duration: 0.1 }
        ]
      },
      
      // 按钮点击音效
      click: {
        frequency: 800,
        duration: 0.05,
        type: 'sine',
        pattern: [
          { freq: 800, duration: 0.05 }
        ]
      },
      
      // 任务完成音效
      taskComplete: {
        frequency: 1200,
        duration: 0.2,
        type: 'sine',
        pattern: [
          { freq: 1200, duration: 0.1 },
          { freq: 1400, duration: 0.1 }
        ]
      }
    }
  }
  
  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    try {
      // 创建音频上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // 处理浏览器的自动播放策略
      if (this.audioContext.state === 'suspended') {
        const resumeAudio = () => {
          this.audioContext.resume()
          document.removeEventListener('click', resumeAudio)
          document.removeEventListener('keydown', resumeAudio)
        }
        document.addEventListener('click', resumeAudio)
        document.addEventListener('keydown', resumeAudio)
      }
    } catch (error) {
      console.warn('音频上下文初始化失败:', error)
      this.audioContext = null
    }
  }
  
  /**
   * 播放指定的音效
   * @param {string} soundName - 音效名称
   * @param {Object} options - 播放选项
   */
  async playSound(soundName, options = {}) {
    if (!this.isEnabled || !this.audioContext) {
      return
    }
    
    const config = this.soundConfigs[soundName]
    if (!config) {
      console.warn(`未找到音效配置: ${soundName}`)
      return
    }
    
    try {
      // 确保音频上下文处于运行状态
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      // 播放音效模式
      if (config.pattern && config.pattern.length > 0) {
        await this.playPattern(config.pattern, options)
      } else {
        await this.playTone(config.frequency, config.duration, config.type, options)
      }
    } catch (error) {
      console.warn(`播放音效失败 (${soundName}):`, error)
    }
  }
  
  /**
   * 播放音效模式（多个音调组合）
   * @param {Array} pattern - 音效模式
   * @param {Object} options - 播放选项
   */
  async playPattern(pattern, options = {}) {
    const startTime = this.audioContext.currentTime
    let currentTime = startTime
    
    for (const note of pattern) {
      this.createTone(
        note.freq, 
        note.duration, 
        'sine', 
        currentTime,
        options
      )
      currentTime += note.duration + 0.05 // 添加小间隔
    }
  }
  
  /**
   * 播放单个音调
   * @param {number} frequency - 频率
   * @param {number} duration - 持续时间
   * @param {string} type - 波形类型
   * @param {Object} options - 播放选项
   */
  async playTone(frequency, duration, type = 'sine', options = {}) {
    const startTime = this.audioContext.currentTime
    this.createTone(frequency, duration, type, startTime, options)
  }
  
  /**
   * 创建音调
   * @param {number} frequency - 频率
   * @param {number} duration - 持续时间
   * @param {string} type - 波形类型
   * @param {number} startTime - 开始时间
   * @param {Object} options - 播放选项
   */
  createTone(frequency, duration, type, startTime, options = {}) {
    // 创建振荡器
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    // 设置波形类型和频率
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)
    
    // 设置音量包络
    const volume = (options.volume || this.volume) * 0.3 // 降低音量避免刺耳
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
    
    // 连接音频节点
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // 启动和停止振荡器
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }
  
  /**
   * 设置音量
   * @param {number} volume - 音量 (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
  
  /**
   * 启用/禁用音效
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
  }
  
  /**
   * 获取音效启用状态
   */
  getEnabled() {
    return this.isEnabled
  }
  
  /**
   * 获取当前音量
   */
  getVolume() {
    return this.volume
  }
  
  /**
   * 播放工作完成音效
   */
  playWorkComplete() {
    return this.playSound('workComplete')
  }
  
  /**
   * 播放休息完成音效
   */
  playBreakComplete() {
    return this.playSound('breakComplete')
  }
  
  /**
   * 播放警告音效
   */
  playWarning() {
    return this.playSound('warning')
  }
  
  /**
   * 播放点击音效
   */
  playClick() {
    return this.playSound('click', { volume: 0.3 })
  }
  
  /**
   * 播放任务完成音效
   */
  playTaskComplete() {
    return this.playSound('taskComplete')
  }
  
  /**
   * 销毁音频管理器
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.sounds.clear()
  }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager()

export default audioManager
