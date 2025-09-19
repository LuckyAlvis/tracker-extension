<template>
  <div class="notes-page">
    <!-- 即将推出页面 -->
    <div class="coming-soon-container">
      <div class="coming-soon-content">
        <div class="coming-soon-icon">📝</div>
        <h1 class="coming-soon-title">笔记模块</h1>
        <p class="coming-soon-description">
          强大的知识管理系统即将与您见面
        </p>
        
        <div class="feature-preview">
          <h3>即将推出的功能</h3>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">✍️</span>
              <div class="feature-info">
                <h4>富文本编辑</h4>
                <p>支持 Markdown 和富文本编辑</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">🗂️</span>
              <div class="feature-info">
                <h4>分类整理</h4>
                <p>灵活的文件夹和标签系统</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">🔍</span>
              <div class="feature-info">
                <h4>全文搜索</h4>
                <p>快速查找笔记内容</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">🔗</span>
              <div class="feature-info">
                <h4>双向链接</h4>
                <p>构建知识网络和关联</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="coming-soon-actions">
          <button class="btn btn-primary" @click="goBack">
            ← 返回主页
          </button>
          <button class="btn btn-secondary" @click="notifyWhenReady">
            🔔 上线提醒
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAppStore } from '@store/app'

export default {
  name: 'Notes',
  
  setup() {
    const router = useRouter()
    const appStore = useAppStore()
    
    const goBack = () => {
      router.push('/reading')
    }
    
    const notifyWhenReady = () => {
      appStore.showNotification({
        type: 'success',
        title: '提醒已设置',
        message: '笔记模块上线时我们会通知您！',
        duration: 3000
      })
    }
    
    return {
      goBack,
      notifyWhenReady
    }
  }
}
</script>

<style scoped>
.notes-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.coming-soon-container {
  max-width: 600px;
  padding: var(--spacing-2xl);
  text-align: center;
}

.coming-soon-icon {
  font-size: 6rem;
  margin-bottom: var(--spacing-lg);
}

.coming-soon-title {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
}

.coming-soon-description {
  font-size: var(--font-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-2xl);
}

.feature-preview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  text-align: left;
}

.feature-preview h3 {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-xl);
}

.feature-list {
  display: grid;
  gap: var(--spacing-lg);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.feature-icon {
  font-size: var(--font-2xl);
  margin-top: var(--spacing-xs);
}

.feature-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-md);
  font-weight: var(--font-semibold);
}

.feature-info p {
  margin: 0;
  opacity: 0.8;
  font-size: var(--font-sm);
}

.coming-soon-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
