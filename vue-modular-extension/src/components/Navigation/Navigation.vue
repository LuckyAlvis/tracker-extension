<template>
  <nav class="navigation">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-logo">
        <span class="logo-icon">🏗️</span>
        <span class="logo-text">中建工具箱</span>
      </div>
      
      <!-- 主导航菜单 -->
      <ul class="nav-menu">
        <li 
          v-for="item in navigationItems" 
          :key="item.path"
          class="nav-item"
        >
          <a
            href="#"
            class="nav-link"
            :class="{ 
              active: isCurrentPage(item.path),
              'coming-soon': item.meta?.comingSoon 
            }"
            @click.prevent="handleNavClick(item)"
          >
            <span class="nav-icon">{{ item.meta.icon }}</span>
            <span class="nav-text">{{ item.meta.title }}</span>
            <span 
              v-if="item.meta?.comingSoon" 
              class="coming-soon-badge"
            >
              即将推出
            </span>
          </a>
        </li>
      </ul>
      
      <!-- 右侧操作按钮 -->
      <div class="nav-actions">
        <button 
          class="shortcut-btn"
          @click="openCurrentPage"
          title="在新标签页打开当前页面"
        >
          🔗
        </button>
        <button 
          class="shortcut-btn"
          @click="refreshData"
          title="刷新数据"
        >
          🔄
        </button>
        <button 
          class="btn btn-ghost nav-btn"
          @click="toggleTheme"
          :title="`切换到${getNextTheme()}主题`"
        >
          {{ themeIcon }}
        </button>
        
        <!-- 版本信息 -->
        <div class="version-info">
          <span class="version">v1.0.0</span>
          <span class="build-info">Beta</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@store/app'
import { usePageStore } from '@store/page'
import { getNavigationItems } from '@/router'

export default {
  name: 'Navigation',
  
  setup() {
    const router = useRouter()
    const route = useRoute()
    const appStore = useAppStore()
    const pageStore = usePageStore()
    
    const navigationItems = ref([])
    
    // 主题相关
    const themeIcon = computed(() => {
      const icons = {
        light: '☀️',
        dark: '🌙',
        'high-contrast': '🔆'
      }
      return icons[appStore.settings.theme] || '☀️'
    })
    
    const getNextTheme = () => {
      const themes = {
        light: '深色',
        dark: '高对比度',
        'high-contrast': '浅色'
      }
      return themes[appStore.settings.theme] || '深色'
    }
    
    // 切换主题
    const toggleTheme = () => {
      appStore.toggleTheme()
    }
    
    // 路径到页面名称的映射
    const getPageFromPath = (path) => {
      const pathMap = {
        '/reading': 'reading',
        '/pomodoro': 'pomodoro',
        '/chat-assistant': 'chat-assistant',
        '/settings': 'settings',
        '/fitness': 'fitness',
        '/accounting': 'accounting',
        '/notes': 'notes'
      }
      return pathMap[path] || 'reading'
    }
    
    // 检查是否为当前页面
    const isCurrentPage = (path) => {
      const pageName = getPageFromPath(path)
      return pageStore.currentPage === pageName
    }
    
    // 处理导航点击
    const handleNavClick = (item) => {
      if (item.meta?.comingSoon) {
        appStore.showNotification({
          type: 'info',
          title: '功能开发中',
          message: `${item.meta.title} 功能正在开发中，敬请期待！`,
          duration: 3000
        })
        return false
      }
      
      // 使用新的页面切换方式
      const pageName = getPageFromPath(item.path)
      pageStore.setCurrentPage(pageName)
      
      // 同时更新路由（保持URL同步，但不会重新渲染组件）
      router.push(item.path)
    }
    
    // 在新标签页打开当前页面
    const openCurrentPage = async () => {
      try {
        const currentUrl = window.location.href
        await chrome.tabs.create({ url: currentUrl })
        appStore.showNotification({
          type: 'success',
          title: '页面已打开',
          message: '已在新标签页中打开当前页面'
        })
      } catch (error) {
        console.error('打开页面失败:', error)
        appStore.showNotification({
          type: 'error',
          title: '操作失败',
          message: '无法打开新标签页'
        })
      }
    }
    
    // 刷新数据
    const refreshData = () => {
      // 触发当前页面的数据刷新
      window.location.reload()
    }
    
    // 初始化
    onMounted(() => {
      navigationItems.value = getNavigationItems()
    })
    
    return {
      navigationItems,
      themeIcon,
      getNextTheme,
      toggleTheme,
      isCurrentPage,
      handleNavClick,
      openCurrentPage,
      refreshData
    }
  }
}
</script>

<style scoped>
.navigation {
  width: 100%;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  min-height: 60px;
  gap: var(--spacing-lg);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.logo-icon {
  font-size: var(--font-xl);
}

.logo-text {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xs);
  flex: 1;
  justify-content: center;
  align-items: center;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  white-space: nowrap;
  font-size: var(--font-sm);
}

.nav-link:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.nav-link.coming-soon {
  opacity: 0.6;
}

.nav-icon {
  font-size: var(--font-md);
  min-width: 20px;
  text-align: center;
}

.nav-text {
  font-weight: var(--font-medium);
}

.coming-soon-badge {
  font-size: var(--font-xs);
  background-color: var(--warning-color);
  color: white;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  margin-left: var(--spacing-xs);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.shortcut-btn {
  padding: var(--spacing-xs);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-card);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.nav-btn {
  padding: var(--spacing-xs);
  min-width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.version-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.version {
  font-weight: var(--font-medium);
}

.build-info {
  background-color: var(--info-color);
  color: white;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-size: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-header {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .nav-menu {
    gap: 2px;
  }
  
  .nav-link {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
  
  .nav-text {
    display: none;
  }
  
  .coming-soon-badge {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
  
  .version-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-actions {
    gap: var(--spacing-xs);
  }
  
  .shortcut-btn,
  .nav-btn {
    min-width: 28px;
    height: 28px;
    font-size: var(--font-xs);
  }
}
</style>
