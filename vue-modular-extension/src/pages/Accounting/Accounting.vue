<template>
  <div class="accounting-page">
    <!-- 即将推出页面 -->
    <div class="coming-soon-container">
      <div class="coming-soon-content">
        <div class="coming-soon-icon">💰</div>
        <h1 class="coming-soon-title">记账模块</h1>
        <p class="coming-soon-description">
          智能财务管理工具正在精心开发中
        </p>
        
        <div class="feature-preview">
          <h3>即将推出的功能</h3>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">📈</span>
              <div class="feature-info">
                <h4>收支记录</h4>
                <p>快速记录日常收入和支出</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">🏷️</span>
              <div class="feature-info">
                <h4>分类管理</h4>
                <p>自定义收支分类和标签</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <div class="feature-info">
                <h4>数据分析</h4>
                <p>可视化财务报表和趋势分析</p>
              </div>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">💡</span>
              <div class="feature-info">
                <h4>预算规划</h4>
                <p>智能预算建议和超支提醒</p>
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
  name: 'Accounting',
  
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
        message: '记账模块上线时我们会通知您！',
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
.accounting-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
