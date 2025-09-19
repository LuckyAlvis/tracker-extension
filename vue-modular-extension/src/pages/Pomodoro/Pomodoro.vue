<template>
  <div class="pomodoro-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🍅</span>
          番茄钟
        </h1>
        <p class="page-description">
          专注工作，高效管理时间
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
      <!-- 番茄钟显示 -->
      <div class="timer-container">
        <div class="timer-circle" :class="{ 
          'work-mode': currentMode === 'work',
          'break-mode': currentMode === 'shortBreak' || currentMode === 'longBreak',
          'running': isRunning 
        }">
          <svg class="progress-ring" width="300" height="300">
            <circle
              class="progress-ring-background"
              cx="150"
              cy="150"
              r="140"
            />
            <circle
              class="progress-ring-progress"
              cx="150"
              cy="150"
              r="140"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
          
          <div class="timer-content">
            <div class="timer-display">
              {{ formatTime(timeLeft) }}
            </div>
            <div class="timer-mode">
              {{ getModeText() }}
            </div>
            <div class="timer-cycle">
              第 {{ currentCycle }} 个番茄钟
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="timer-controls">
          <button 
            class="btn btn-primary timer-btn"
            @click="toggleTimer"
          >
            {{ isRunning ? '⏸️ 暂停' : '▶️ 开始' }}
          </button>
          
          <button 
            class="btn btn-secondary timer-btn"
            @click="resetTimer"
            :disabled="!isRunning && timeLeft === getCurrentModeDuration() * 60"
          >
            🔄 重置
          </button>
          
          <button 
            class="btn btn-ghost timer-btn"
            @click="skipCycle"
            :disabled="!isRunning"
          >
            ⏭️ 跳过
          </button>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="task-section">
        <div class="task-header">
          <h3>今日任务</h3>
          <button 
            class="btn btn-primary btn-sm"
            @click="showTaskInput = !showTaskInput"
          >
            ➕ 添加任务
          </button>
        </div>

        <!-- 添加任务输入 -->
        <div v-if="showTaskInput" class="task-input-section">
          <div class="input-group">
            <input
              v-model="newTaskText"
              type="text"
              class="input"
              placeholder="输入任务描述..."
              @keyup.enter="addTask"
            />
            <button 
              class="btn btn-primary"
              @click="addTask"
              :disabled="!newTaskText.trim()"
            >
              添加
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
              >
                {{ task.completed ? '✅' : '⭕' }}
              </button>
              
              <span class="task-text">{{ task.text }}</span>
              
              <div class="task-pomodoros">
                <span 
                  v-for="i in task.estimatedPomodoros" 
                  :key="i"
                  class="pomodoro-dot"
                  :class="{ filled: i <= task.completedPomodoros }"
                >
                  🍅
                </span>
              </div>
            </div>
            
            <div class="task-actions">
              <button 
                class="btn btn-ghost btn-sm"
                @click="setActiveTask(task.id)"
                :disabled="task.completed"
              >
                {{ task.id === activeTaskId ? '🎯' : '📌' }}
              </button>
              <button 
                class="btn btn-ghost btn-sm"
                @click="removeTask(task.id)"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div v-if="tasks.length === 0" class="empty-tasks">
            <div class="empty-icon">📝</div>
            <p>还没有任务，添加一个开始专注吧！</p>
          </div>
        </div>
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
    const showTaskInput = ref(false)
    const newTaskText = ref('')
    const activeTaskId = ref(null)
    
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
    const circumference = computed(() => 2 * Math.PI * 140)
    
    const progressOffset = computed(() => {
      const progress = (getCurrentModeDuration() * 60 - timeLeft.value) / (getCurrentModeDuration() * 60)
      return circumference.value - (progress * circumference.value)
    })
    
    // 获取当前模式的持续时间
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
    
    // 获取模式文本
    const getModeText = () => {
      const texts = {
        work: '专注工作',
        shortBreak: '短休息',
        longBreak: '长休息'
      }
      return texts[currentMode.value] || '专注工作'
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
      
      // 显示通知
      if (settings.notifications) {
        showCycleCompleteNotification()
      }
      
      // 更新统计
      if (currentMode.value === 'work') {
        updateWorkStats()
        updateActiveTaskProgress()
      }
      
      // 切换到下一个模式
      switchToNextMode()
      
      // 自动开始下一个周期
      if (settings.autoStart) {
        setTimeout(() => {
          startTimer()
        }, 1000)
      }
    }
    
    // 切换到下一个模式
    const switchToNextMode = () => {
      if (currentMode.value === 'work') {
        // 工作完成，进入休息
        if (currentCycle.value % settings.longBreakInterval === 0) {
          currentMode.value = 'longBreak'
        } else {
          currentMode.value = 'shortBreak'
        }
      } else {
        // 休息完成，进入工作
        currentMode.value = 'work'
        currentCycle.value++
      }
      
      timeLeft.value = getCurrentModeDuration() * 60
    }
    
    // 播放提示音
    const playNotificationSound = () => {
      // 这里可以播放音频文件
      console.log('播放提示音')
    }
    
    // 显示周期完成通知
    const showCycleCompleteNotification = () => {
      const messages = {
        work: '工作时间结束，休息一下吧！',
        shortBreak: '短休息结束，继续专注工作！',
        longBreak: '长休息结束，开始新的工作周期！'
      }
      
      appStore.showNotification({
        type: 'success',
        title: '番茄钟提醒',
        message: messages[currentMode.value],
        duration: 5000
      })
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
      showTaskInput,
      newTaskText,
      activeTaskId,
      settings,
      tasks,
      todayStats,
      weekStats,
      totalStats,
      
      // 计算属性
      circumference,
      progressOffset,
      
      // 方法
      getCurrentModeDuration,
      getModeText,
      formatTime,
      toggleTimer,
      resetTimer,
      skipCycle,
      addTask,
      toggleTask,
      setActiveTask,
      removeTask
    }
  }
}
</script>

<style scoped>
.pomodoro-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
  background-color: var(--bg-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-card);
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
}

.title-icon {
  font-size: var(--font-3xl);
}

.page-description {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
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

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  overflow: hidden;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
}

.timer-circle {
  position: relative;
  width: 300px;
  height: 300px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: none;
  stroke: var(--border-color);
  stroke-width: 8;
}

.progress-ring-progress {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.timer-circle.work-mode .progress-ring-progress {
  stroke: var(--error-color);
}

.timer-circle.break-mode .progress-ring-progress {
  stroke: var(--success-color);
}

.timer-circle.running .progress-ring-progress {
  animation: pulse 2s ease-in-out infinite alternate;
}

.timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-display {
  font-size: 3rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.timer-mode {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.timer-cycle {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
}

.timer-controls {
  display: flex;
  gap: var(--spacing-md);
}

.timer-btn {
  min-width: 120px;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-md);
}

.task-section {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.task-header h3 {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.task-input-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.task-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.task-item:hover {
  background-color: var(--bg-hover);
}

.task-item.active {
  border-color: var(--primary-color);
  background-color: rgba(102, 126, 234, 0.05);
}

.task-item.completed {
  opacity: 0.6;
}

.task-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.task-checkbox {
  background: none;
  border: none;
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.task-text {
  flex: 1;
  font-size: var(--font-sm);
}

.task-item.completed .task-text {
  text-decoration: line-through;
}

.task-pomodoros {
  display: flex;
  gap: 2px;
}

.pomodoro-dot {
  font-size: var(--font-sm);
  opacity: 0.3;
}

.pomodoro-dot.filled {
  opacity: 1;
}

.task-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.empty-tasks {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

@keyframes pulse {
  0% { opacity: 1; }
  100% { opacity: 0.7; }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .timer-circle {
    width: 250px;
    height: 250px;
  }
  
  .timer-display {
    font-size: 2.5rem;
  }
}
</style>
