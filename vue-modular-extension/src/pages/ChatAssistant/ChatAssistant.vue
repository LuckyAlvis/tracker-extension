<template>
  <div class="chat-assistant-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🤖</span>
          聊天助手
        </h1>
        <p class="page-description">
          智能对话助手，为您提供专业的AI服务
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-secondary"
          @click="refreshAssistant"
          title="刷新助手"
        >
          🔄 刷新
        </button>
        <button 
          class="btn btn-primary"
          @click="openInNewTab"
          title="在新标签页打开"
        >
          🔗 新标签页
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载聊天助手...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="retryLoad">
        重试
      </button>
    </div>
    
    <!-- 聊天助手内容 -->
    <div v-else class="chat-content">
      <iframe
        ref="chatFrame"
        :src="showWelcome ? '' : assistantUrl"
        class="chat-iframe"
        @load="onFrameLoad"
        @error="onFrameError"
        frameborder="0"
        allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
      ></iframe>
    </div>
    
    <!-- 功能说明 -->
    <div v-if="showWelcome" class="welcome-overlay">
      <div class="welcome-content">
        <div class="welcome-icon">🤖</div>
        <h2>欢迎使用聊天助手</h2>
        <p>这是一个智能AI助手，可以帮助您：</p>
        
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">💬</span>
            <span>智能对话交流</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📝</span>
            <span>文档编写协助</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔍</span>
            <span>信息查询分析</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💡</span>
            <span>创意灵感启发</span>
          </div>
        </div>
        
        <button class="btn btn-primary" @click="startChat">
          开始对话
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@store/app'

export default {
  name: 'ChatAssistant',
  
  setup() {
    const appStore = useAppStore()
    
    // 响应式数据
    const isLoading = ref(true)
    const error = ref('')
    const showWelcome = ref(true)
    const chatFrame = ref(null)
    
    // 聊天助手URL
    const assistantUrl = 'https://assistant.biz.3311csci.com/?lang=zh-CN&open_in_browser=true#/personalAssistant'
    
    // 刷新助手
    const refreshAssistant = () => {
      if (chatFrame.value) {
        isLoading.value = true
        error.value = ''
        
        // 强制重新加载
        chatFrame.value.src = ''
        setTimeout(() => {
          chatFrame.value.src = assistantUrl
        }, 100)
        
        // 设置超时
        setTimeout(() => {
          if (isLoading.value) {
            isLoading.value = false
            appStore.showNotification({
              type: 'success',
              title: '聊天助手已刷新',
              message: '页面已重新加载'
            })
          }
        }, 3000)
      }
    }
    
    // 在新标签页打开
    const openInNewTab = async () => {
      try {
        await chrome.tabs.create({ url: assistantUrl })
        appStore.showNotification({
          type: 'success',
          title: '页面已打开',
          message: '聊天助手已在新标签页中打开'
        })
      } catch (error) {
        console.error('打开新标签页失败:', error)
        appStore.showNotification({
          type: 'error',
          title: '操作失败',
          message: '无法打开新标签页'
        })
      }
    }
    
    // 开始对话
    const startChat = () => {
      showWelcome.value = false
      isLoading.value = true
      
      // 立即开始加载，并设置超时检测
      setTimeout(() => {
        // 设置一个合理的超时时间来停止加载状态
        setTimeout(() => {
          if (isLoading.value) {
            isLoading.value = false
            appStore.showNotification({
              type: 'success',
              title: '聊天助手已加载',
              message: '如果页面显示异常，请点击刷新按钮'
            })
          }
        }, 3000) // 3秒后自动停止加载状态
      }, 100)
    }
    
    // iframe加载完成
    const onFrameLoad = () => {
      // 由于跨域限制，load事件可能不会触发
      // 我们主要依赖超时机制
      if (isLoading.value) {
        isLoading.value = false
        error.value = ''
        
        appStore.showNotification({
          type: 'success',
          title: '聊天助手已就绪',
          message: '您可以开始与AI助手对话了'
        })
      }
    }
    
    // iframe加载错误
    const onFrameError = () => {
      isLoading.value = false
      error.value = '无法连接到聊天助手服务，请检查网络连接'
      
      appStore.showNotification({
        type: 'error',
        title: '连接失败',
        message: '无法加载聊天助手，请稍后重试'
      })
    }
    
    // 重试加载
    const retryLoad = () => {
      error.value = ''
      isLoading.value = true
      showWelcome.value = false
      
      // 强制重新加载iframe
      setTimeout(() => {
        if (chatFrame.value) {
          chatFrame.value.src = ''
          setTimeout(() => {
            chatFrame.value.src = assistantUrl
          }, 100)
        }
        
        // 设置超时
        setTimeout(() => {
          if (isLoading.value) {
            isLoading.value = false
            appStore.showNotification({
              type: 'success',
              title: '聊天助手已加载',
              message: '如果页面显示异常，请尝试在新标签页打开'
            })
          }
        }, 3000)
      }, 100)
    }
    
    // 监听iframe消息（如果需要与助手页面通信）
    const handleMessage = (event) => {
      // 只处理来自助手域名的消息
      if (event.origin !== 'https://assistant.biz.3311csci.com') {
        return
      }
      
      // 处理来自助手的消息
      console.log('收到助手消息:', event.data)
    }
    
    // 组件挂载
    onMounted(() => {
      // 添加消息监听器
      window.addEventListener('message', handleMessage)
      
      // 延迟显示欢迎界面
      setTimeout(() => {
        if (showWelcome.value) {
          isLoading.value = false
        }
      }, 500)
    })
    
    // 组件卸载
    onUnmounted(() => {
      // 移除消息监听器
      window.removeEventListener('message', handleMessage)
    })
    
    return {
      isLoading,
      error,
      showWelcome,
      chatFrame,
      assistantUrl,
      refreshAssistant,
      openInNewTab,
      startChat,
      onFrameLoad,
      onFrameError,
      retryLoad
    }
  }
}
</script>

<style scoped>
.chat-assistant-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.title-icon {
  font-size: var(--font-xxl);
}

.page-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: var(--font-xxl);
}

.error-state h3 {
  margin: 0;
  color: var(--text-primary);
}

.error-state p {
  margin: 0;
  color: var(--text-secondary);
  text-align: center;
}

.chat-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.welcome-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.welcome-content h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: var(--font-xl);
}

.welcome-content p {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.feature-icon {
  font-size: var(--font-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .welcome-content {
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: var(--spacing-md);
  }
  
  .btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
}
</style>
