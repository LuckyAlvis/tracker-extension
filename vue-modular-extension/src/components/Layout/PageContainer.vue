<template>
  <div class="page-container">
    <!-- 所有页面组件都会被渲染，但只显示当前激活的页面 -->
    <keep-alive>
      <div class="page-wrapper">
        <!-- 阅读页面 -->
        <div 
          v-show="currentPage === 'reading'"
          class="page-content"
          data-page="reading"
        >
          <Reading />
        </div>
        
        <!-- 番茄钟页面 -->
        <div 
          v-show="currentPage === 'pomodoro'"
          class="page-content"
          data-page="pomodoro"
        >
          <Pomodoro />
        </div>
        
        <!-- 设置页面 -->
        <div 
          v-show="currentPage === 'settings'"
          class="page-content"
          data-page="settings"
        >
          <Settings />
        </div>
        
        <!-- 健身页面（预留） -->
        <div 
          v-show="currentPage === 'fitness'"
          class="page-content"
          data-page="fitness"
        >
          <Fitness />
        </div>
        
        <!-- 记账页面（预留） -->
        <div 
          v-show="currentPage === 'accounting'"
          class="page-content"
          data-page="accounting"
        >
          <Accounting />
        </div>
        
        <!-- 笔记页面（预留） -->
        <div 
          v-show="currentPage === 'notes'"
          class="page-content"
          data-page="notes"
        >
          <Notes />
        </div>
        
        <!-- 404页面 -->
        <div 
          v-show="currentPage === 'not-found'"
          class="page-content"
          data-page="not-found"
        >
          <NotFound />
        </div>
      </div>
    </keep-alive>
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageStore } from '@store/page'

// 页面组件导入
import Reading from '@pages/Reading/Reading.vue'
import Pomodoro from '@pages/Pomodoro/Pomodoro.vue'
import Settings from '@pages/Settings/Settings.vue'
import Fitness from '@pages/Fitness/Fitness.vue'
import Accounting from '@pages/Accounting/Accounting.vue'
import Notes from '@pages/Notes/Notes.vue'
import NotFound from '@components/Common/NotFound.vue'

export default {
  name: 'PageContainer',
  components: {
    Reading,
    Pomodoro,
    Settings,
    Fitness,
    Accounting,
    Notes,
    NotFound
  },
  
  setup() {
    const route = useRoute()
    const pageStore = usePageStore()
    
    // 当前激活的页面
    const currentPage = computed(() => pageStore.currentPage)
    
    // 路由到页面名称的映射
    const getPageFromRoute = (routePath) => {
      const pathMap = {
        '/reading': 'reading',
        '/pomodoro': 'pomodoro',
        '/settings': 'settings',
        '/fitness': 'fitness',
        '/accounting': 'accounting',
        '/notes': 'notes'
      }
      return pathMap[routePath] || 'not-found'
    }
    
    // 监听路由变化，更新当前页面
    watch(
      () => route.path,
      (newPath) => {
        const pageName = getPageFromRoute(newPath)
        pageStore.setCurrentPage(pageName)
      },
      { immediate: true }
    )
    
    // 组件挂载时初始化当前页面
    onMounted(() => {
      const pageName = getPageFromRoute(route.path)
      pageStore.setCurrentPage(pageName)
    })
    
    return {
      currentPage
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.page-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}

.page-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--bg-primary);
}

/* 确保隐藏的页面不会影响布局和交互 */
.page-content[style*="display: none"] {
  pointer-events: none;
}

/* 页面切换时的平滑过渡效果（可选） */
.page-content {
  transition: opacity 0.2s ease-in-out;
}

/* 为不同页面提供独立的滚动上下文 */
.page-content[data-page="reading"] {
  /* 阅读页面可能需要特殊的滚动处理 */
  overflow-y: auto;
  overflow-x: hidden;
}

.page-content[data-page="pomodoro"] {
  /* 番茄钟页面通常不需要滚动 */
  overflow: hidden;
}

.page-content[data-page="settings"] {
  /* 设置页面需要垂直滚动 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 确保每个页面都有完整的尺寸 */
.page-content > * {
  min-height: 100%;
}
</style>
