import { createRouter, createWebHashHistory } from 'vue-router'

// 页面组件懒加载
const Reading = () => import('@pages/Reading/Reading.vue')
const Pomodoro = () => import('@pages/Pomodoro/Pomodoro.vue')
const Settings = () => import('@pages/Settings/Settings.vue')

// 预留的未来功能页面
const Fitness = () => import('@pages/Fitness/Fitness.vue')
const Accounting = () => import('@pages/Accounting/Accounting.vue')
const Notes = () => import('@pages/Notes/Notes.vue')

const routes = [
  {
    path: '/',
    redirect: '/reading'
  },
  {
    path: '/reading',
    name: 'Reading',
    component: Reading,
    meta: {
      title: '阅读',
      icon: '📖',
      description: '文档阅读和管理'
    }
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: Pomodoro,
    meta: {
      title: '番茄钟',
      icon: '🍅',
      description: '专注时间管理'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
      icon: '⚙️',
      description: '应用设置和配置',
      hideInNav: false // 在导航中显示
    }
  },
  // 未来功能页面（暂时隐藏）
  {
    path: '/fitness',
    name: 'Fitness',
    component: Fitness,
    meta: {
      title: '健身',
      icon: '💪',
      description: '运动记录和计划',
      hideInNav: true, // 暂时在导航中隐藏
      comingSoon: true
    }
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: Accounting,
    meta: {
      title: '记账',
      icon: '💰',
      description: '财务管理工具',
      hideInNav: true,
      comingSoon: true
    }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes,
    meta: {
      title: '笔记',
      icon: '📝',
      description: '知识管理系统',
      hideInNav: true,
      comingSoon: true
    }
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@components/Common/NotFound.vue'),
    meta: {
      title: '页面未找到',
      hideInNav: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查即将到来的功能
  if (to.meta?.comingSoon) {
    // 可以在这里添加提示逻辑
    console.log(`${to.meta.title} 功能即将推出`)
  }
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - Vue 工具箱`
  }
  
  next()
})

router.afterEach((to, from) => {
  // 路由切换后的逻辑
  console.log(`路由切换: ${from.path} -> ${to.path}`)
})

// 获取导航菜单项
export const getNavigationItems = () => {
  return routes.filter(route => 
    route.meta && 
    !route.meta.hideInNav && 
    route.path !== '/' &&
    !route.path.includes('*')
  )
}

// 获取所有可用的页面（包括隐藏的）
export const getAllPages = () => {
  return routes.filter(route => 
    route.meta && 
    route.path !== '/' &&
    !route.path.includes('*')
  )
}

export default router
