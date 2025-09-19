<template>
  <div class="pomodoro-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🍅</span>
          专注番茄钟
        </h1>
        <p class="page-description">
          提升效率，掌控时间的艺术
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-secondary"
          @click="showSettings = !showSettings"
          :class="{ active: showSettings }"
        >
          ⚙️ 设置
        </button>
        <button 
          class="btn btn-ghost"
          @click="showStats = !showStats"
          :class="{ active: showStats }"
        >
          📊 统计
        </button>
      </div>
    </div>

    <!-- 设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-grid">
        <div class="setting-item">
          <label>工作时长 (分钟)</label>
          <input 
            v-model.number="settings.workDuration" 
            type="number" 
            min="1" 
            max="60"
            class="input"
          />
        </div>
        <div class="setting-item">
          <label>短休息 (分钟)</label>
          <input 
            v-model.number="settings.shortBreak" 
            type="number" 
            min="1" 
            max="30"
            class="input"
          />
        </div>
        <div class="setting-item">
          <label>长休息 (分钟)</label>
          <input 
            v-model.number="settings.longBreak" 
            type="number" 
            min="1" 
            max="60"
            class="input"
          />
        </div>
        <div class="setting-item">
          <label>长休息间隔</label>
          <input 
            v-model.number="settings.longBreakInterval" 
            type="number" 
            min="2" 
            max="10"
            class="input"
          />
        </div>
      </div>
      
      <div class="setting-toggles">
        <label class="toggle-item">
          <input 
            v-model="settings.autoStart" 
            type="checkbox"
          />
          <span>自动开始下一个周期</span>
        </label>
        <label class="toggle-item">
          <input 
            v-model="settings.notifications" 
            type="checkbox"
          />
          <span>显示通知</span>
        </label>
        <label class="toggle-item">
          <input 
            v-model="settings.soundEnabled" 
            type="checkbox"
          />
          <span>播放提示音</span>
        </label>
      </div>
    </div>

    <!-- 统计面板 -->
    <div v-if="showStats" class="stats-panel">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ todayStats.completed }}</div>
          <div class="stat-label">今日完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ todayStats.totalTime }}</div>
          <div class="stat-label">专注时间 (分钟)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ weekStats.completed }}</div>
          <div class="stat-label">本周完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalStats.completed }}</div>
          <div class="stat-label">总计完成</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 模式切换 -->
      <div class="mode-switcher">
        <button
          :class="currentMode === 'work' ? 'active work-mode' : ''"
          @click="setMode('work')"
          class="mode-btn"
        >
          💼 工作
        </button>
        <button
          :class="currentMode === 'shortBreak' ? 'active short-break-mode' : ''"
          @click="setMode('shortBreak')"
          class="mode-btn"
        >
          ☕ 短休息
        </button>
        <button
          :class="currentMode === 'longBreak' ? 'active long-break-mode' : ''"
          @click="setMode('longBreak')"
          class="mode-btn"
        >
          🛏️ 长休息
        </button>
      </div>

      <!-- 番茄钟计时器 -->
      <div class="timer-container">
        <div class="timer-circle" :class="{ 
          'work-mode': currentMode === 'work',
          'short-break-mode': currentMode === 'shortBreak',
          'long-break-mode': currentMode === 'longBreak',
          'running': isRunning,
          'warning': timeLeft <= 10 && timeLeft > 0
        }">
          <!-- 进度环 SVG -->
          <svg class="progress-ring" viewBox="0 0 100 100">
            <!-- 背景圆环 -->
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#E2E8F0" 
              stroke-width="6"
              class="progress-ring-background"
            />
            <!-- 进度圆环 -->
            <circle
              cx="50" 
              cy="50" 
              r="45" 
              fill="none"
              :stroke="currentColor"
              stroke-width="6"
              stroke-dasharray="283"
              :stroke-dashoffset="progressOffset"
              class="progress-ring-progress"
              stroke-linecap="round"
            />
          </svg>
          
          <!-- 计时器显示 -->
          <div class="timer-content">
            <div class="timer-display" :class="textColorClass">
              {{ formatTime(timeLeft) }}
            </div>
            <div class="timer-mode">
              {{ currentLabel }}
            </div>
            <div class="timer-cycle">
              第 {{ currentCycle }} 个番茄钟
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="timer-controls">
          <button 
            class="control-btn primary"
            @click="toggleTimer"
            :class="{ 'danger': isRunning }"
          >
            <span class="btn-icon">{{ isRunning ? '⏸️' : '▶️' }}</span>
            {{ isRunning ? '暂停' : '开始' }}
          </button>
          
          <button 
            class="control-btn secondary"
            @click="resetTimer"
          >
            <span class="btn-icon">🔄</span>
            重置
          </button>
        </div>

        <!-- 已完成番茄数显示 -->
        <div class="completed-pomodoros">
          <h3 class="section-title">已完成番茄</h3>
          <div class="pomodoro-dots">
            <div 
              v-for="n in 4" 
              :key="n"
              class="pomodoro-dot"
              :class="{ 'completed': n <= completedPomodoros }"
            >
              <span v-if="n <= completedPomodoros">✓</span>
            </div>
          </div>
          <p class="completion-hint">每完成4个番茄，获得一次长休息</p>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="task-section">
        <div class="task-header">
          <h3 class="section-title">
            📋 当前任务
          </h3>
        </div>

        <!-- 添加任务输入 -->
        <div class="task-input-section">
          <div class="input-group">
            <input
              v-model="newTaskText"
              type="text"
              class="task-input"
              placeholder="添加新任务..."
              @keyup.enter="addTask"
            />
            <button 
              class="add-task-btn"
              @click="addTask"
              :disabled="!newTaskText.trim()"
            >
              ➕
            </button>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="task-list">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="task-item"
            :class="{ 
              completed: task.completed,
              active: task.id === activeTaskId 
            }"
          >
            <div class="task-content">
              <button 
                class="task-checkbox"
                @click="toggleTask(task.id)"
                :class="{ 'completed': task.completed }"
              >
                <span v-if="task.completed" class="checkmark">✓</span>
              </button>
              
              <span class="task-text" :class="{ 'completed': task.completed }">
                {{ task.text }}
              </span>
              
              <div class="task-pomodoros">
                <span class="pomodoro-count">{{ task.completedPomodoros }} ×</span>
              </div>
            </div>
            
            <div class="task-actions">
              <button 
                class="action-btn set-active"
                @click="setActiveTask(task.id)"
                :disabled="task.completed"
                :class="{ 'active': task.id === activeTaskId }"
                title="设为当前任务"
              >
                {{ task.id === activeTaskId ? '🎯' : '📌' }}
              </button>
              <button 
                class="action-btn remove"
                @click="removeTask(task.id)"
                title="删除任务"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div v-if="tasks.length === 0" class="empty-tasks">
            <div class="empty-icon">📝</div>
            <p>没有任务，添加一个开始专注吧！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成提示弹窗 -->
    <div
      v-if="showCompletionAlert"
      class="completion-overlay"
      @click="handleCompletionAlert"
    >
      <div
        class="completion-modal"
        @click.stop
      >
        <div class="completion-icon">
          <span>✓</span>
        </div>
        <h3 class="completion-title">{{ completionAlertTitle }}</h3>
        <p class="completion-message">{{ completionAlertMessage }}</p>
        <button
          @click="handleCompletionAlert"
          class="completion-btn"
        >
          {{ completionAlertButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@store/app'

export default {
  name: 'Pomodoro',
  
  setup() {
    const appStore = useAppStore()
    
    // 响应式数据
    const isRunning = ref(false)
    const timeLeft = ref(25 * 60) // 默认25分钟
    const currentMode = ref('work') // work, shortBreak, longBreak
    const currentCycle = ref(1)
    const showSettings = ref(false)
    const showStats = ref(false)
    const newTaskText = ref('')
    const activeTaskId = ref(null)
    
    // 完成提示相关
    const showCompletionAlert = ref(false)
    const completionAlertTitle = ref('')
    const completionAlertMessage = ref('')
    const completionAlertButtonText = ref('')
    
    // 已完成番茄数（每4个一个周期）
    const completedPomodoros = ref(0)
    
    let timerInterval = null
    
    // 设置
    const settings = reactive({
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4,
      autoStart: false,
      notifications: true,
      soundEnabled: true
    })
    
    // 任务列表
    const tasks = ref([])
    
    // 统计数据
    const todayStats = reactive({
      completed: 0,
      totalTime: 0
    })
    
    const weekStats = reactive({
      completed: 0
    })
    
    const totalStats = reactive({
      completed: 0
    })
    
    // 计算属性
    const circumference = computed(() => 283) // 2 * Math.PI * 45 (SVG圆的周长)
    
    const progressOffset = computed(() => {
      const totalSeconds = getTotalSecondsForMode(currentMode.value)
      return (timeLeft.value / totalSeconds) * circumference.value
    })
    
    // 当前模式的标签文本
    const currentLabel = computed(() => {
      switch(currentMode.value) {
        case 'work': return '专注工作中...'
        case 'shortBreak': return '短暂休息一下'
        case 'longBreak': return '好好放松一下'
        default: return ''
      }
    })
    
    // 当前进度环的颜色
    const currentColor = computed(() => {
      switch(currentMode.value) {
        case 'work': return '#3B82F6' // 蓝色
        case 'shortBreak': return '#10B981' // 绿色
        case 'longBreak': return '#F59E0B' // 橙色
        default: return '#3B82F6'
      }
    })
    
    // 文本颜色类（用于时间显示）
    const textColorClass = computed(() => {
      // 最后10秒添加警告颜色
      if (timeLeft.value <= 10 && timeLeft.value > 0) {
        return 'text-danger warning-pulse'
      }
      switch(currentMode.value) {
        case 'work': return 'text-primary'
        case 'shortBreak': return 'text-success'
        case 'longBreak': return 'text-warning'
        default: return 'text-primary'
      }
    })
    
    // 根据模式获取总秒数
    const getTotalSecondsForMode = (mode) => {
      switch(mode) {
        case 'work': return settings.workDuration * 60
        case 'shortBreak': return settings.shortBreak * 60
        case 'longBreak': return settings.longBreak * 60
        default: return 25 * 60
      }
    }
    
    // 设置模式并重置计时器
    const setMode = (mode) => {
      if (isRunning.value) {
        pauseTimer()
      }
      currentMode.value = mode
      resetTimer()
    }
    
    // 获取当前模式的持续时间（分钟）
    const getCurrentModeDuration = () => {
      switch (currentMode.value) {
        case 'work':
          return settings.workDuration
        case 'shortBreak':
          return settings.shortBreak
        case 'longBreak':
          return settings.longBreak
        default:
          return settings.workDuration
      }
    }
    
    // 格式化时间显示
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    // 开始/暂停计时器
    const toggleTimer = () => {
      if (isRunning.value) {
        pauseTimer()
      } else {
        startTimer()
      }
    }
    
    // 开始计时器
    const startTimer = () => {
      isRunning.value = true
      timerInterval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
        } else {
          completeCurrentCycle()
        }
      }, 1000)
    }
    
    // 暂停计时器
    const pauseTimer = () => {
      isRunning.value = false
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
    
    // 重置计时器
    const resetTimer = () => {
      pauseTimer()
      timeLeft.value = getCurrentModeDuration() * 60
    }
    
    // 跳过当前周期
    const skipCycle = () => {
      completeCurrentCycle()
    }
    
    // 完成当前周期
    const completeCurrentCycle = () => {
      pauseTimer()
      
      // 播放提示音
      if (settings.soundEnabled) {
        playNotificationSound()
      }
      
      // 处理完成后的逻辑
      if (currentMode.value === 'work') {
        completedPomodoros.value++
        updateWorkStats()
        updateActiveTaskProgress()
        showWorkCompletionAlert()
      } else {
        showBreakCompletionAlert()
      }
    }
    
    // 显示工作完成提示
    const showWorkCompletionAlert = () => {
      completionAlertTitle.value = '专注时段完成！'
      completionAlertMessage.value = '你已完成一个番茄钟，该休息一下了。'
      completionAlertButtonText.value = '开始休息'
      showCompletionAlert.value = true
    }
    
    // 显示休息完成提示
    const showBreakCompletionAlert = () => {
      completionAlertTitle.value = '休息结束！'
      completionAlertMessage.value = '休息时间结束，准备开始新的专注时段吧。'
      completionAlertButtonText.value = '开始工作'
      showCompletionAlert.value = true
    }
    
    // 处理完成提示的按钮点击
    const handleCompletionAlert = () => {
      showCompletionAlert.value = false
      
      if (currentMode.value === 'work') {
        // 工作完成后，根据已完成数量决定休息类型
        const shouldTakeLongBreak = completedPomodoros.value % 4 === 0
        setMode(shouldTakeLongBreak ? 'longBreak' : 'shortBreak')
      } else {
        // 休息完成后，回到工作模式
        setMode('work')
      }
      
      // 自动开始下一个周期（如果设置了自动开始）
      if (settings.autoStart) {
        setTimeout(() => {
          startTimer()
        }, 1000)
      }
    }
    
    // 播放提示音（使用Web Audio API创建简单提示音）
    const playNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime) // 频率
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime) // 音量
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.5) // 持续0.5秒
      } catch (e) {
        console.log('提示音播放失败:', e)
      }
    }
    
    
    // 更新工作统计
    const updateWorkStats = () => {
      todayStats.completed++
      todayStats.totalTime += settings.workDuration
      weekStats.completed++
      totalStats.completed++
      
      // 保存统计数据
      saveStats()
    }
    
    // 更新活跃任务进度
    const updateActiveTaskProgress = () => {
      if (activeTaskId.value) {
        const task = tasks.value.find(t => t.id === activeTaskId.value)
        if (task && !task.completed) {
          task.completedPomodoros++
          if (task.completedPomodoros >= task.estimatedPomodoros) {
            task.completed = true
            appStore.showNotification({
              type: 'success',
              title: '任务完成',
              message: `恭喜完成任务：${task.text}`,
              duration: 3000
            })
          }
        }
      }
    }
    
    // 添加任务
    const addTask = () => {
      if (!newTaskText.value.trim()) return
      
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.value.trim(),
        estimatedPomodoros: 1,
        completedPomodoros: 0,
        completed: false,
        createdAt: new Date()
      }
      
      tasks.value.push(newTask)
      newTaskText.value = ''
      showTaskInput.value = false
      
      // 如果没有活跃任务，设置为活跃任务
      if (!activeTaskId.value) {
        activeTaskId.value = newTask.id
      }
      
      saveTasks()
    }
    
    // 切换任务完成状态
    const toggleTask = (taskId) => {
      const task = tasks.value.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        if (task.completed && activeTaskId.value === taskId) {
          activeTaskId.value = null
        }
        saveTasks()
      }
    }
    
    // 设置活跃任务
    const setActiveTask = (taskId) => {
      activeTaskId.value = activeTaskId.value === taskId ? null : taskId
    }
    
    // 删除任务
    const removeTask = (taskId) => {
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index > -1) {
        tasks.value.splice(index, 1)
        if (activeTaskId.value === taskId) {
          activeTaskId.value = null
        }
        saveTasks()
      }
    }
    
    // 保存任务到本地存储
    const saveTasks = () => {
      chrome.storage.local.set({
        'pomodoro-tasks': tasks.value,
        'active-task-id': activeTaskId.value
      })
    }
    
    // 加载任务
    const loadTasks = async () => {
      try {
        const result = await chrome.storage.local.get(['pomodoro-tasks', 'active-task-id'])
        if (result['pomodoro-tasks']) {
          tasks.value = result['pomodoro-tasks']
        }
        if (result['active-task-id']) {
          activeTaskId.value = result['active-task-id']
        }
      } catch (error) {
        console.error('加载任务失败:', error)
      }
    }
    
    // 保存统计数据
    const saveStats = () => {
      chrome.storage.local.set({
        'pomodoro-stats': {
          today: todayStats,
          week: weekStats,
          total: totalStats,
          lastUpdate: new Date().toDateString()
        }
      })
    }
    
    // 加载统计数据
    const loadStats = async () => {
      try {
        const result = await chrome.storage.local.get(['pomodoro-stats'])
        if (result['pomodoro-stats']) {
          const stats = result['pomodoro-stats']
          const today = new Date().toDateString()
          
          // 如果是新的一天，重置今日统计
          if (stats.lastUpdate !== today) {
            todayStats.completed = 0
            todayStats.totalTime = 0
          } else {
            Object.assign(todayStats, stats.today)
            Object.assign(weekStats, stats.week)
            Object.assign(totalStats, stats.total)
          }
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }
    
    // 保存设置
    const saveSettings = () => {
      chrome.storage.local.set({
        'pomodoro-settings': settings
      })
    }
    
    // 加载设置
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get(['pomodoro-settings'])
        if (result['pomodoro-settings']) {
          Object.assign(settings, result['pomodoro-settings'])
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
    
    // 监听设置变化
    watch(settings, () => {
      saveSettings()
      // 如果当前没有运行，更新时间显示
      if (!isRunning.value) {
        timeLeft.value = getCurrentModeDuration() * 60
      }
    }, { deep: true })
    
    // 监听工作/休息时长变化时，更新当前计时器（如果处于对应模式且未运行）
    watch(() => settings.workDuration, (newVal) => {
      if (currentMode.value === 'work' && !isRunning.value) {
        timeLeft.value = newVal * 60
      }
    })
    
    watch(() => settings.shortBreak, (newVal) => {
      if (currentMode.value === 'shortBreak' && !isRunning.value) {
        timeLeft.value = newVal * 60
      }
    })
    
    watch(() => settings.longBreak, (newVal) => {
      if (currentMode.value === 'longBreak' && !isRunning.value) {
        timeLeft.value = newVal * 60
      }
    })
    
    // 组件挂载
    onMounted(async () => {
      await loadSettings()
      await loadTasks()
      await loadStats()
      timeLeft.value = getCurrentModeDuration() * 60
    })
    
    // 组件卸载
    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    })
    
    return {
      // 状态
      isRunning,
      timeLeft,
      currentMode,
      currentCycle,
      showSettings,
      showStats,
      newTaskText,
      activeTaskId,
      settings,
      tasks,
      todayStats,
      weekStats,
      totalStats,
      
      // 完成提示相关
      showCompletionAlert,
      completionAlertTitle,
      completionAlertMessage,
      completionAlertButtonText,
      completedPomodoros,
      
      // 计算属性
      circumference,
      progressOffset,
      currentLabel,
      currentColor,
      textColorClass,
      
      // 方法
      setMode,
      getCurrentModeDuration,
      formatTime,
      toggleTimer,
      resetTimer,
      addTask,
      toggleTask,
      setActiveTask,
      removeTask,
      handleCompletionAlert
    }
  }
}
</script>

<style scoped>
.pomodoro-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', system-ui, sans-serif;
}

.page-header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #3B82F6;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 0 0 0.5rem 0;
  transition: all 0.3s ease;
}

.page-title:hover {
  color: rgba(59, 130, 246, 0.8);
}

.title-icon {
  font-size: 1.2em;
  margin-right: 0.5rem;
}

.page-description {
  color: #64748B;
  font-size: 1.125rem;
  margin: 0;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.settings-panel,
.stats-panel {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.setting-item label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.setting-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.stat-card {
  padding: var(--spacing-lg);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
}

.stat-value {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* 模式切换器 */
.mode-switcher {
  display: flex;
  background: rgba(243, 244, 246, 0.8);
  border-radius: 9999px;
  padding: 0.25rem;
  margin: 2rem auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 24rem;
  width: 100%;
}

.mode-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mode-btn:hover {
  color: #374151;
}

.mode-btn.active.work-mode {
  background: #3B82F6;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.mode-btn.active.short-break-mode {
  background: #10B981;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.mode-btn.active.long-break-mode {
  background: #F59E0B;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 2rem 2rem;
  overflow-y: auto;
}

/* 计时器容器 */
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  margin-bottom: 2rem;
}

.timer-circle {
  position: relative;
  width: clamp(16rem, 20vw, 20rem);
  height: clamp(16rem, 20vw, 20rem);
  margin: 2.5rem 0;
}

.timer-circle.warning {
  animation: warning-pulse 1s ease-in-out infinite;
}

/* 进度环样式 */
.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: none;
  stroke: #E2E8F0;
  stroke-width: 6;
}

.progress-ring-progress {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  transition: all 1s ease-in-out;
}

.timer-circle.running .progress-ring-progress {
  animation: progress-pulse 2s ease-in-out infinite;
}

/* 计时器内容 */
.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-display {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.timer-display.text-primary { color: #3B82F6; }
.timer-display.text-success { color: #10B981; }
.timer-display.text-warning { color: #F59E0B; }
.timer-display.text-danger { color: #EF4444; }

.timer-display.warning-pulse {
  animation: warning-pulse 1s ease-in-out infinite;
}

.timer-mode {
  font-size: 1.125rem;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 0.25rem;
}

.timer-cycle {
  font-size: 0.875rem;
  color: #94A3B8;
}

/* 控制按钮 */
.timer-controls {
  display: flex;
  gap: 1rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.control-btn.primary {
  background: #3B82F6;
  color: white;
}

.control-btn.primary:hover {
  background: rgba(59, 130, 246, 0.9);
}

.control-btn.danger {
  background: #EF4444;
  color: white;
}

.control-btn.danger:hover {
  background: rgba(239, 68, 68, 0.9);
}

.control-btn.secondary {
  background: #E5E7EB;
  color: #374151;
}

.control-btn.secondary:hover {
  background: #D1D5DB;
}

.btn-icon {
  font-size: 1.125rem;
}

/* 已完成番茄数显示 */
.completed-pomodoros {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title {
  color: #64748B;
  font-weight: 500;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.pomodoro-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pomodoro-dot {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #E5E7EB;
  border: 2px dashed #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pomodoro-dot.completed {
  background: #3B82F6;
  border: 2px solid #3B82F6;
  transform: scale(1.1);
}

.completion-hint {
  color: #9CA3AF;
  font-size: 0.875rem;
  margin: 0;
}

/* 任务列表 */
.task-section {
  width: 100%;
  max-width: 28rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.task-header {
  padding: 1.5rem 1.5rem 0;
}

.task-input-section {
  padding: 0 1.5rem 1rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.task-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.task-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-task-btn {
  padding: 0.75rem 1rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-task-btn:hover {
  background: rgba(59, 130, 246, 0.9);
}

.add-task-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 任务列表项 */
.task-list {
  padding: 0 1.5rem 1.5rem;
  max-height: 10rem;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.task-item:hover {
  background: #F3F4F6;
}

.task-item.active {
  border: 2px solid #3B82F6;
  background: rgba(59, 130, 246, 0.05);
}

.task-item.completed {
  opacity: 0.6;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.task-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid #D1D5DB;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.task-checkbox.completed {
  background: #10B981;
  border-color: #10B981;
}

.checkmark {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.task-text {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.task-text.completed {
  text-decoration: line-through;
  color: #9CA3AF;
}

.task-pomodoros {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-right: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #F3F4F6;
}

.action-btn.set-active.active {
  color: #3B82F6;
}

.empty-tasks {
  text-align: center;
  padding: 2rem;
  color: #9CA3AF;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 完成提示弹窗 */
.completion-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.completion-modal {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 24rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1);
  animation: modal-appear 0.3s ease-out;
}

.completion-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #10B981;
  font-size: 1.5rem;
  font-weight: 600;
}

.completion-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #111827;
}

.completion-message {
  color: #6B7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.completion-btn {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.completion-btn:hover {
  background: rgba(59, 130, 246, 0.9);
  transform: translateY(-1px);
}

/* 动画效果 */
@keyframes warning-pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes progress-pulse {
  0%, 100% { 
    opacity: 1;
  }
  50% { 
    opacity: 0.8;
  }
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 1rem 1rem;
  }
  
  .timer-circle {
    width: 14rem;
    height: 14rem;
  }
  
  .timer-display {
    font-size: 2.5rem;
  }
  
  .mode-switcher {
    margin: 1rem auto;
  }
  
  .timer-controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .control-btn {
    padding: 0.75rem 1.5rem;
  }
}

/* 移除重复的样式，使用上面定义的现代化样式 */
</style>
