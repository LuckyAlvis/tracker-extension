<template>
  <div id="app" class="app-container">
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 主应用内容 -->
    <div v-else class="app-content">
      <!-- 导航栏 -->
      <Navigation />
      
      <!-- 路由视图 -->
      <main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 全局通知 -->
    <Notification />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@components/Navigation/Navigation.vue'
import Notification from '@components/Common/Notification.vue'
import { useAppStore } from '@store/app'

export default {
  name: 'App',
  components: {
    Navigation,
    Notification
  },
  
  setup() {
    const router = useRouter()
    const appStore = useAppStore()
    const isLoading = ref(true)
    
    // 应用初始化
    const initializeApp = async () => {
      try {
        // 加载用户设置
        await appStore.loadSettings()
        
        // 应用主题
        appStore.applyTheme()
        
        // 导航到默认页面或恢复上次访问的页面
        const lastRoute = appStore.settings.lastRoute || '/reading'
        if (router.currentRoute.value.path === '/') {
          router.push(lastRoute)
        }
        
      } catch (error) {
        console.error('应用初始化失败:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // 监听路由变化，保存当前路由
    router.afterEach((to) => {
      appStore.updateSettings({ lastRoute: to.path })
    })
    
    onMounted(() => {
      initializeApp()
    })
    
    return {
      isLoading
    }
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.global-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
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

.app-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
