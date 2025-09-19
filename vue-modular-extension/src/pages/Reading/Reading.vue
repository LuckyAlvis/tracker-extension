<template>
  <div class="reading-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">📖</span>
          阅读中心
        </h1>
        <p class="page-description">
          支持在线网页、本地文件和文档阅读
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          class="btn btn-secondary"
          @click="toggleUrlInput"
          :class="{ active: showUrlInput }"
        >
          {{ showUrlInput ? '隐藏输入' : '输入网址' }}
        </button>
        <button 
          class="btn btn-primary"
          @click="selectFile"
        >
          📁 选择文件
        </button>
      </div>
    </div>
    
    <!-- URL 输入区域 -->
    <div v-if="showUrlInput" class="url-input-section">
      <div class="input-group">
        <input
          v-model="inputUrl"
          type="text"
          class="input url-input"
          placeholder="输入网址或文件路径 (支持 http://, https://, file://)"
          @keyup.enter="loadUrl"
        />
        <button 
          class="btn btn-primary"
          @click="loadUrl"
          :disabled="!inputUrl.trim()"
        >
          加载
        </button>
      </div>
      
      <!-- 快速链接 -->
      <div class="quick-links">
        <span class="quick-links-label">快速链接:</span>
        <button
          v-for="link in quickLinks"
          :key="link.url"
          class="quick-link-btn"
          @click="loadQuickLink(link)"
          :title="link.description"
        >
          {{ link.name }}
        </button>
      </div>
    </div>
    
    <!-- 当前文档信息 -->
    <div v-if="currentDocument" class="document-info">
      <div class="document-header">
        <div class="document-details">
          <span class="document-type">{{ getDocumentType() }}</span>
          <span class="document-name">{{ currentDocument.name }}</span>
        </div>
        <div class="document-actions">
          <button 
            class="btn btn-ghost"
            @click="refreshDocument"
            title="刷新文档"
          >
            🔄
          </button>
          <button 
            class="btn btn-ghost"
            @click="openInNewTab"
            title="在新标签页打开"
          >
            🔗
          </button>
          <button 
            class="btn btn-ghost"
            @click="closeDocument"
            title="关闭文档"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
    
    <!-- 文档查看器 -->
    <div class="document-viewer" :class="{ 'has-document': currentDocument }">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载文档...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retryLoad">
          重试
        </button>
      </div>
      
      <div v-else-if="currentDocument" class="document-content">
        <!-- 网页内容 -->
        <iframe
          v-if="currentDocument.type === 'webpage'"
          :src="currentDocument.url"
          class="document-iframe"
          @load="onDocumentLoad"
          @error="onDocumentError"
        ></iframe>
        
        <!-- 文本内容 -->
        <div
          v-else-if="currentDocument.type === 'text'"
          class="text-content"
          v-html="currentDocument.content"
        ></div>
        
        <!-- PDF 查看器 -->
        <div v-else-if="currentDocument.type === 'pdf'" class="pdf-viewer">
          <embed
            :src="currentDocument.url"
            type="application/pdf"
            class="pdf-embed"
          />
        </div>
      </div>
      
      <!-- 欢迎界面 -->
      <div v-else class="welcome-state">
        <div class="welcome-content">
          <div class="welcome-icon">📚</div>
          <h2>欢迎使用阅读中心</h2>
          <p>选择一个文档开始阅读</p>
          
          <div class="welcome-features">
            <div class="feature-item">
              <span class="feature-icon">🌐</span>
              <span>支持网页浏览</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📄</span>
              <span>本地文件阅读</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📋</span>
              <span>PDF 文档查看</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文件选择器 -->
    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.html,.htm,.txt,.md"
      @change="handleFileSelect"
      style="display: none;"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAppStore } from '@store/app'

export default {
  name: 'Reading',
  
  setup() {
    const appStore = useAppStore()
    
    // 响应式数据
    const showUrlInput = ref(false)
    const inputUrl = ref('')
    const isLoading = ref(false)
    const error = ref('')
    const fileInput = ref(null)
    
    const currentDocument = ref(null)
    
    // 快速链接
    const quickLinks = ref([
      {
        name: '微信读书',
        url: 'https://weread.qq.com/',
        description: '微信读书网页版'
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: 'GitHub 代码托管平台'
      },
      {
        name: '掘金',
        url: 'https://juejin.cn',
        description: '掘金技术社区'
      },
      {
        name: 'MDN',
        url: 'https://developer.mozilla.org',
        description: 'MDN Web 文档'
      }
    ])
    
    // 切换 URL 输入显示
    const toggleUrlInput = () => {
      showUrlInput.value = !showUrlInput.value
      if (showUrlInput.value) {
        // 获取当前标签页 URL 作为默认值
        getCurrentTabUrl()
      }
    }
    
    // 获取当前标签页 URL
    const getCurrentTabUrl = async () => {
      try {
        const tabInfo = await appStore.getCurrentTab()
        if (tabInfo && tabInfo.url) {
          inputUrl.value = tabInfo.url
        }
      } catch (error) {
        console.error('获取当前标签页 URL 失败:', error)
      }
    }
    
    // 加载 URL
    const loadUrl = async () => {
      if (!inputUrl.value.trim()) return
      
      isLoading.value = true
      error.value = ''
      
      try {
        const url = processUrl(inputUrl.value.trim())
        
        currentDocument.value = {
          name: getDocumentName(url),
          url: url,
          type: getDocumentTypeFromUrl(url),
          loadTime: new Date()
        }
        
        // 保存到历史记录
        saveToHistory(currentDocument.value)
        
        appStore.showNotification({
          type: 'success',
          title: '文档加载成功',
          message: `已加载: ${currentDocument.value.name}`
        })
        
      } catch (err) {
        error.value = err.message
        appStore.showNotification({
          type: 'error',
          title: '加载失败',
          message: err.message
        })
      } finally {
        isLoading.value = false
      }
    }
    
    // 处理 URL
    const processUrl = (url) => {
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
    
    // 获取文档名称
    const getDocumentName = (url) => {
      try {
        const urlObj = new URL(url)
        if (urlObj.protocol === 'file:') {
          return urlObj.pathname.split('/').pop() || '本地文件'
        }
        return urlObj.hostname || url
      } catch {
        return url
      }
    }
    
    // 根据 URL 判断文档类型
    const getDocumentTypeFromUrl = (url) => {
      if (url.includes('.pdf')) return 'pdf'
      if (url.includes('.txt') || url.includes('.md')) return 'text'
      return 'webpage'
    }
    
    // 获取文档类型显示名称
    const getDocumentType = () => {
      if (!currentDocument.value) return ''
      
      const types = {
        webpage: '网页',
        pdf: 'PDF',
        text: '文本'
      }
      
      return types[currentDocument.value.type] || '文档'
    }
    
    // 加载快速链接
    const loadQuickLink = (link) => {
      inputUrl.value = link.url
      loadUrl()
    }
    
    // 选择文件
    const selectFile = () => {
      fileInput.value?.click()
    }
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      isLoading.value = true
      error.value = ''
      
      try {
        const fileUrl = URL.createObjectURL(file)
        
        currentDocument.value = {
          name: file.name,
          url: fileUrl,
          type: getFileType(file),
          size: file.size,
          loadTime: new Date()
        }
        
        // 如果是文本文件，读取内容
        if (currentDocument.value.type === 'text') {
          const reader = new FileReader()
          reader.onload = (e) => {
            currentDocument.value.content = formatTextContent(e.target.result)
            isLoading.value = false
          }
          reader.readAsText(file)
        } else {
          isLoading.value = false
        }
        
        appStore.showNotification({
          type: 'success',
          title: '文件加载成功',
          message: `已加载: ${file.name}`
        })
        
      } catch (err) {
        error.value = '文件加载失败'
        isLoading.value = false
        appStore.showNotification({
          type: 'error',
          title: '文件加载失败',
          message: err.message
        })
      }
    }
    
    // 获取文件类型
    const getFileType = (file) => {
      const extension = file.name.split('.').pop().toLowerCase()
      
      if (extension === 'pdf') return 'pdf'
      if (['txt', 'md', 'markdown'].includes(extension)) return 'text'
      if (['html', 'htm'].includes(extension)) return 'webpage'
      
      return 'text'
    }
    
    // 格式化文本内容
    const formatTextContent = (content) => {
      // 简单的 Markdown 渲染
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
    }
    
    // 刷新文档
    const refreshDocument = () => {
      if (currentDocument.value) {
        const iframe = document.querySelector('.document-iframe')
        if (iframe) {
          iframe.src = iframe.src
        }
      }
    }
    
    // 在新标签页打开
    const openInNewTab = async () => {
      if (currentDocument.value) {
        try {
          await chrome.tabs.create({ url: currentDocument.value.url })
        } catch (error) {
          console.error('打开新标签页失败:', error)
        }
      }
    }
    
    // 关闭文档
    const closeDocument = () => {
      currentDocument.value = null
      error.value = ''
    }
    
    // 重试加载
    const retryLoad = () => {
      if (inputUrl.value) {
        loadUrl()
      }
    }
    
    // 文档加载完成
    const onDocumentLoad = () => {
      isLoading.value = false
    }
    
    // 文档加载错误
    const onDocumentError = () => {
      error.value = '文档加载失败，请检查网址是否正确'
      isLoading.value = false
    }
    
    // 保存到历史记录
    const saveToHistory = (document) => {
      // 这里可以实现历史记录功能
      console.log('保存到历史记录:', document)
    }
    
    // 组件挂载时的初始化
    onMounted(() => {
      // 可以在这里恢复上次的文档状态
    })
    
    return {
      showUrlInput,
      inputUrl,
      isLoading,
      error,
      currentDocument,
      quickLinks,
      fileInput,
      
      toggleUrlInput,
      loadUrl,
      loadQuickLink,
      selectFile,
      handleFileSelect,
      getDocumentType,
      refreshDocument,
      openInNewTab,
      closeDocument,
      retryLoad,
      onDocumentLoad,
      onDocumentError
    }
  }
}
</script>

<style scoped>
.reading-page {
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

.url-input-section {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.input-group {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.url-input {
  flex: 1;
}

.quick-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.quick-links-label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.quick-link-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-card);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-link-btn:hover {
  background-color: var(--primary-color);
  color: var(--text-inverse);
  border-color: var(--primary-color);
}

.document-info {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.document-details {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.document-type {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--primary-color);
  color: var(--text-inverse);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.document-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.document-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.document-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loading-state,
.error-state,
.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: var(--spacing-2xl);
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

.error-icon,
.welcome-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.document-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许 flex 子元素收缩 */
}

.pdf-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.document-iframe,
.pdf-embed {
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
}

.text-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
}

.welcome-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.feature-icon {
  font-size: var(--font-xl);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
