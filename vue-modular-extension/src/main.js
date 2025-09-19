import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import '@styles/global.css'
import '@styles/variables.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 使用 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue 应用错误:', err, info)
}

// 全局属性
app.config.globalProperties.$chrome = chrome

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('Vue 模块化插件启动完成 - 开发模式')
  window.__VUE_APP__ = app
}
