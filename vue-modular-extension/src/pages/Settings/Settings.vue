<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">⚙️</span>
          设置
        </h1>
        <p class="page-description">
          个性化配置您的开发工具箱
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-secondary"
          @click="resetToDefaults"
        >
          🔄 恢复默认
        </button>
        <button 
          class="btn btn-primary"
          @click="exportSettings"
        >
          📤 导出设置
        </button>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 外观设置 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🎨</span>
            外观设置
          </h2>
          <p class="section-description">自定义界面外观和主题</p>
        </div>
        
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">主题模式</label>
            <div class="theme-selector">
              <button
                v-for="theme in themes"
                :key="theme.value"
                class="theme-option"
                :class="{ active: appStore.settings.theme === theme.value }"
                @click="changeTheme(theme.value)"
              >
                <span class="theme-icon">{{ theme.icon }}</span>
                <span class="theme-name">{{ theme.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">语言</label>
            <select 
              v-model="appStore.settings.language" 
              class="input"
              @change="updateSettings"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">默认页面</label>
            <select 
              v-model="appStore.settings.defaultPage" 
              class="input"
              @change="updateSettings"
            >
              <option value="reading">阅读中心</option>
              <option value="pomodoro">番茄钟</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🔔</span>
            通知设置
          </h2>
          <p class="section-description">管理通知和提醒</p>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">启用通知</label>
              <p class="setting-desc">显示系统通知和提醒</p>
            </div>
            <label class="toggle-switch">
              <input 
                v-model="appStore.settings.notifications" 
                type="checkbox"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">声音提醒</label>
              <p class="setting-desc">播放提示音</p>
            </div>
            <label class="toggle-switch">
              <input 
                v-model="notificationSettings.sound" 
                type="checkbox"
                @change="saveNotificationSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">桌面通知</label>
              <p class="setting-desc">显示桌面弹窗通知</p>
            </div>
            <label class="toggle-switch">
              <input 
                v-model="notificationSettings.desktop" 
                type="checkbox"
                @change="saveNotificationSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 数据设置 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">💾</span>
            数据管理
          </h2>
          <p class="section-description">管理您的数据和隐私</p>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">自动保存</label>
              <p class="setting-desc">自动保存您的工作进度</p>
            </div>
            <label class="toggle-switch">
              <input 
                v-model="appStore.settings.autoSave" 
                type="checkbox"
                @change="updateSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">数据同步</label>
              <p class="setting-desc">在不同设备间同步数据</p>
            </div>
            <label class="toggle-switch">
              <input 
                v-model="dataSettings.sync" 
                type="checkbox"
                @change="saveDataSettings"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="data-actions">
          <button class="btn btn-secondary" @click="exportData">
            📤 导出数据
          </button>
          <button class="btn btn-secondary" @click="importData">
            📥 导入数据
          </button>
          <button class="btn btn-ghost text-error" @click="clearAllData">
            🗑️ 清除所有数据
          </button>
        </div>
      </div>

      <!-- 关于信息 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">ℹ️</span>
            关于
          </h2>
          <p class="section-description">插件信息和帮助</p>
        </div>
        
        <div class="about-content">
          <div class="about-item">
            <span class="about-label">版本</span>
            <span class="about-value">{{ version }}</span>
          </div>
          
          <div class="about-item">
            <span class="about-label">构建时间</span>
            <span class="about-value">{{ buildTime }}</span>
          </div>
          
          <div class="about-item">
            <span class="about-label">技术栈</span>
            <span class="about-value">Vue 3 + Chrome Extension V3</span>
          </div>
          
          <div class="about-actions">
            <button class="btn btn-ghost" @click="openGitHub">
              🔗 GitHub
            </button>
            <button class="btn btn-ghost" @click="showChangelog">
              📋 更新日志
            </button>
            <button class="btn btn-ghost" @click="showHelp">
              ❓ 帮助
            </button>
          </div>
        </div>
      </div>

      <!-- 开发者选项 -->
      <div v-if="showDeveloperOptions" class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">🛠️</span>
            开发者选项
          </h2>
          <p class="section-description">调试和开发工具</p>
        </div>
        
        <div class="developer-actions">
          <button class="btn btn-ghost" @click="openDevTools">
            🔧 打开开发者工具
          </button>
          <button class="btn btn-ghost" @click="reloadExtension">
            🔄 重新加载插件
          </button>
          <button class="btn btn-ghost" @click="showStorageInfo">
            💾 存储信息
          </button>
        </div>
      </div>
    </div>

    <!-- 导入文件选择器 -->
    <input
      ref="importFileInput"
      type="file"
      accept=".json"
      @change="handleImportFile"
      style="display: none;"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '@store/app'

export default {
  name: 'Settings',
  
  setup() {
    const appStore = useAppStore()
    
    // 响应式数据
    const importFileInput = ref(null)
    const showDeveloperOptions = ref(false)
    
    // 主题选项
    const themes = ref([
      { value: 'light', name: '浅色', icon: '☀️' },
      { value: 'dark', name: '深色', icon: '🌙' },
      { value: 'high-contrast', name: '高对比度', icon: '🔆' }
    ])
    
    // 通知设置
    const notificationSettings = reactive({
      sound: true,
      desktop: true,
      vibration: false
    })
    
    // 数据设置
    const dataSettings = reactive({
      sync: false,
      backup: true,
      compression: true
    })
    
    // 版本信息
    const version = ref('1.0.0')
    const buildTime = ref(new Date().toLocaleDateString())
    
    // 检查是否显示开发者选项
    const checkDeveloperMode = () => {
      // 连续点击版本号5次显示开发者选项
      let clickCount = 0
      const versionElement = document.querySelector('.about-value')
      
      if (versionElement) {
        versionElement.addEventListener('click', () => {
          clickCount++
          if (clickCount >= 5) {
            showDeveloperOptions.value = true
            appStore.showNotification({
              type: 'info',
              title: '开发者模式',
              message: '开发者选项已启用'
            })
          }
        })
      }
    }
    
    // 更改主题
    const changeTheme = async (theme) => {
      await appStore.updateSettings({ theme })
      appStore.applyTheme()
      
      appStore.showNotification({
        type: 'success',
        title: '主题已更改',
        message: `已切换到${themes.value.find(t => t.value === theme)?.name}主题`
      })
    }
    
    // 更新设置
    const updateSettings = () => {
      appStore.saveSettings()
    }
    
    // 保存通知设置
    const saveNotificationSettings = () => {
      chrome.storage.local.set({
        'notification-settings': notificationSettings
      })
    }
    
    // 保存数据设置
    const saveDataSettings = () => {
      chrome.storage.local.set({
        'data-settings': dataSettings
      })
    }
    
    // 恢复默认设置
    const resetToDefaults = async () => {
      if (confirm('确定要恢复所有默认设置吗？此操作不可撤销。')) {
        const defaultSettings = {
          theme: 'light',
          defaultPage: 'reading',
          lastRoute: '/reading',
          language: 'zh-CN',
          notifications: true,
          autoSave: true,
          initialized: true
        }
        
        await appStore.updateSettings(defaultSettings)
        appStore.applyTheme()
        
        // 重置其他设置
        Object.assign(notificationSettings, {
          sound: true,
          desktop: true,
          vibration: false
        })
        
        Object.assign(dataSettings, {
          sync: false,
          backup: true,
          compression: true
        })
        
        saveNotificationSettings()
        saveDataSettings()
        
        appStore.showNotification({
          type: 'success',
          title: '设置已重置',
          message: '所有设置已恢复为默认值'
        })
      }
    }
    
    // 导出设置
    const exportSettings = () => {
      const settingsData = {
        appSettings: appStore.settings,
        notificationSettings,
        dataSettings,
        exportTime: new Date().toISOString(),
        version: version.value
      }
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vue-extension-settings-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      
      appStore.showNotification({
        type: 'success',
        title: '设置已导出',
        message: '设置文件已保存到下载文件夹'
      })
    }
    
    // 导入数据
    const importData = () => {
      importFileInput.value?.click()
    }
    
    // 处理导入文件
    const handleImportFile = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (data.appSettings) {
            await appStore.updateSettings(data.appSettings)
          }
          
          if (data.notificationSettings) {
            Object.assign(notificationSettings, data.notificationSettings)
            saveNotificationSettings()
          }
          
          if (data.dataSettings) {
            Object.assign(dataSettings, data.dataSettings)
            saveDataSettings()
          }
          
          appStore.showNotification({
            type: 'success',
            title: '导入成功',
            message: '设置已从文件导入'
          })
          
        } catch (error) {
          appStore.showNotification({
            type: 'error',
            title: '导入失败',
            message: '文件格式不正确或已损坏'
          })
        }
      }
      
      reader.readAsText(file)
    }
    
    // 导出数据
    const exportData = async () => {
      try {
        const allData = await chrome.storage.local.get(null)
        
        const exportData = {
          ...allData,
          exportTime: new Date().toISOString(),
          version: version.value
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vue-extension-data-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        
        URL.revokeObjectURL(url)
        
        appStore.showNotification({
          type: 'success',
          title: '数据已导出',
          message: '所有数据已保存到下载文件夹'
        })
        
      } catch (error) {
        appStore.showNotification({
          type: 'error',
          title: '导出失败',
          message: '无法导出数据'
        })
      }
    }
    
    // 清除所有数据
    const clearAllData = async () => {
      if (confirm('确定要清除所有数据吗？此操作不可撤销，将删除所有任务、统计和设置。')) {
        try {
          await chrome.storage.local.clear()
          
          appStore.showNotification({
            type: 'success',
            title: '数据已清除',
            message: '所有数据已删除，页面将重新加载'
          })
          
          // 延迟重新加载页面
          setTimeout(() => {
            window.location.reload()
          }, 2000)
          
        } catch (error) {
          appStore.showNotification({
            type: 'error',
            title: '清除失败',
            message: '无法清除数据'
          })
        }
      }
    }
    
    // 打开 GitHub
    const openGitHub = () => {
      chrome.tabs.create({ 
        url: 'https://github.com/your-username/vue-modular-extension' 
      })
    }
    
    // 显示更新日志
    const showChangelog = () => {
      appStore.showNotification({
        type: 'info',
        title: '更新日志',
        message: 'v1.0.0: 初始版本发布，包含阅读中心和番茄钟功能',
        duration: 5000
      })
    }
    
    // 显示帮助
    const showHelp = () => {
      appStore.showNotification({
        type: 'info',
        title: '使用帮助',
        message: '点击左侧导航切换功能，在设置中可以自定义主题和行为',
        duration: 5000
      })
    }
    
    // 开发者选项方法
    const openDevTools = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.debugger.attach({ tabId: tabs[0].id }, '1.0')
      })
    }
    
    const reloadExtension = () => {
      chrome.runtime.reload()
    }
    
    const showStorageInfo = async () => {
      const data = await chrome.storage.local.get(null)
      const size = JSON.stringify(data).length
      
      appStore.showNotification({
        type: 'info',
        title: '存储信息',
        message: `已使用 ${(size / 1024).toFixed(2)} KB 存储空间`,
        duration: 3000
      })
    }
    
    // 加载设置
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get([
          'notification-settings',
          'data-settings'
        ])
        
        if (result['notification-settings']) {
          Object.assign(notificationSettings, result['notification-settings'])
        }
        
        if (result['data-settings']) {
          Object.assign(dataSettings, result['data-settings'])
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
    
    // 组件挂载
    onMounted(() => {
      loadSettings()
      checkDeveloperMode()
    })
    
    return {
      appStore,
      importFileInput,
      showDeveloperOptions,
      themes,
      notificationSettings,
      dataSettings,
      version,
      buildTime,
      
      changeTheme,
      updateSettings,
      saveNotificationSettings,
      saveDataSettings,
      resetToDefaults,
      exportSettings,
      importData,
      handleImportFile,
      exportData,
      clearAllData,
      openGitHub,
      showChangelog,
      showHelp,
      openDevTools,
      reloadExtension,
      showStorageInfo
    }
  }
}
</script>

<style scoped>
.settings-page {
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

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.settings-section {
  margin-bottom: var(--spacing-2xl);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
}

.section-icon {
  font-size: var(--font-xl);
}

.section-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-sm);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.settings-list {
  padding: var(--spacing-lg);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  min-width: 120px; /* 设置最小宽度，防止文字换行 */
  white-space: nowrap; /* 防止文字换行 */
}

.setting-info {
  flex: 1;
}

.setting-desc {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin: 0;
}

.theme-selector {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 80px;
}

.theme-option:hover {
  border-color: var(--primary-color);
}

.theme-option.active {
  border-color: var(--primary-color);
  background-color: rgba(102, 126, 234, 0.1);
}

.theme-icon {
  font-size: var(--font-xl);
}

.theme-name {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: var(--transition-fast);
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: var(--transition-fast);
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.data-actions,
.about-actions,
.developer-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.about-content {
  padding: var(--spacing-lg);
}

.about-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.about-item:last-of-type {
  border-bottom: none;
  margin-bottom: var(--spacing-lg);
}

.about-label {
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.about-value {
  color: var(--text-primary);
  cursor: pointer;
}

.text-error {
  color: var(--error-color) !important;
}

.text-error:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
}
</style>
