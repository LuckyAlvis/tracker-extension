# 页面状态保留功能使用指南

## 概述

本项目已成功实现基于组件显示/隐藏的页面切换方案，彻底解决了页面切换时状态丢失的问题。所有功能页面组件现在始终保持存在（不被销毁），仅通过显示/隐藏控制可见性，从而自然保留组件内部所有状态。

## 核心特性

### ✅ 已实现功能

1. **组件实例保留**：页面切换时组件不会被销毁和重建
2. **状态自然保持**：所有组件内部状态（包括第三方组件状态）完全保留
3. **复杂组件支持**：PDF 阅读器、表单、滚动位置等复杂状态完美保留
4. **统一切换逻辑**：通过页面容器组件统一管理页面显示/隐藏
5. **持久化存储**：重要状态可保存到本地存储，插件重启后恢复
6. **性能优化**：避免组件频繁销毁重建，提升性能

### 🎯 解决的问题

- ❌ **之前**：页面切换时组件被销毁，状态丢失
- ✅ **现在**：页面切换时组件保持存在，状态完全保留

- ❌ **之前**：PDF 阅读器页码、滚动位置丢失
- ✅ **现在**：PDF 状态完全保留，切换回来时在原位置

- ❌ **之前**：表单数据、计时器状态丢失
- ✅ **现在**：所有状态自然保持，无需手动存储恢复

## 技术实现

### 1. 页面容器组件 (`PageContainer.vue`)

```vue
<template>
  <div class="page-container">
    <keep-alive>
      <div class="page-wrapper">
        <!-- 所有页面组件都会被渲染，但只显示当前激活的页面 -->
        <div v-show="currentPage === 'reading'" class="page-content">
          <Reading />
        </div>
        <div v-show="currentPage === 'pomodoro'" class="page-content">
          <Pomodoro />
        </div>
        <!-- 其他页面... -->
      </div>
    </keep-alive>
  </div>
</template>
```

**关键点**：
- 使用 `v-show` 而非 `v-if`，确保组件始终存在
- `<keep-alive>` 提供额外的缓存保护
- 绝对定位确保页面完全覆盖

### 2. 页面状态管理 (`page.js`)

```javascript
export const usePageStore = defineStore('page', () => {
  const currentPage = ref('reading')
  const pageStates = reactive({
    reading: { /* 页面特定状态 */ },
    pomodoro: { /* 页面特定状态 */ }
  })
  
  const setCurrentPage = (pageName) => {
    currentPage.value = pageName
    // 更新路由但不重新渲染组件
    router.push(getPathFromPage(pageName))
  }
})
```

**关键点**：
- 集中管理当前激活页面
- 提供页面特定状态存储
- 支持页面历史记录和前进后退

### 3. 状态管理 Hook (`usePageState.js`)

```javascript
export function usePageState(pageName, defaultState = {}) {
  const pageStore = usePageStore()
  const isActive = computed(() => pageStore.currentPage === pageName)
  
  const updateState = (newState) => {
    pageStore.updatePageState(pageName, newState)
  }
  
  return { isActive, state, updateState, ... }
}
```

**关键点**：
- 为各页面提供统一的状态管理接口
- 支持状态持久化到本地存储
- 提供页面激活/失活生命周期钩子

### 4. 复杂组件状态管理 (`useComplexComponentState`)

```javascript
export function useComplexComponentState(pageName, options = {}) {
  const pageState = usePageState(pageName)
  
  // 自动保存滚动位置
  const saveScrollPosition = () => { /* ... */ }
  
  // 自动保存表单数据
  const saveFormData = () => { /* ... */ }
  
  // 定时自动保存
  const startAutoSave = () => { /* ... */ }
}
```

**关键点**：
- 专门处理复杂组件状态保留
- 自动保存滚动位置和表单数据
- 支持定时自动保存

## 使用方法

### 1. 在页面组件中使用状态管理

```vue
<script>
import { usePageState } from '@utils/usePageState'

export default {
  setup() {
    // 基础状态管理
    const pageState = usePageState('reading', {
      scrollPosition: 0,
      currentUrl: ''
    })
    
    // 复杂组件状态管理
    const complexState = useComplexComponentState('reading', {
      autoSave: true,
      saveInterval: 5000,
      preserveScrollPosition: true,
      preserveFormData: true
    })
    
    return { pageState, complexState }
  }
}
</script>
```

### 2. 标记需要保留状态的元素

```vue
<template>
  <!-- 保留滚动位置 -->
  <div data-preserve-scroll data-scroll-key="main-content">
    <!-- 内容 -->
  </div>
  
  <!-- 保留表单数据 -->
  <form data-preserve-form data-form-key="user-form">
    <input name="username" />
    <input name="email" />
  </form>
</template>
```

### 3. 页面切换

```javascript
// 在导航组件中
const handleNavClick = (item) => {
  const pageName = getPageFromPath(item.path)
  pageStore.setCurrentPage(pageName)  // 切换页面
  router.push(item.path)              // 同步路由
}
```

## 状态保留演示

项目中已集成 `StatePreservationDemo` 组件，展示以下状态保留效果：

### 1. 表单状态保留
- 文本输入框内容
- 数字输入框值
- 下拉选择框选项
- 复选框状态

### 2. 滚动位置保留
- 长列表滚动位置
- 多个滚动容器独立保存

### 3. 组件内部状态保留
- 计数器值
- 时间戳
- 运行状态

### 4. 时间状态验证
- 组件创建时间不变（证明组件未被销毁）
- 最后更新时间保留

## 测试方法

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **或构建并加载扩展**：
   ```bash
   npm run build
   # 在 Chrome 中加载 dist 目录
   ```

3. **测试步骤**：
   - 在阅读页面填写表单、滚动内容、增加计数器
   - 切换到番茄钟页面
   - 再切换回阅读页面
   - 验证所有状态是否完全保留

## 性能优化

### 内存管理
- 所有页面组件同时存在内存中，但只有当前页面参与渲染
- 使用 `pointer-events: none` 确保隐藏页面不响应交互
- 定期清理过期的状态数据

### 渲染优化
- 隐藏页面的 DOM 仍存在但不参与布局计算
- 页面切换无需重新渲染，响应速度极快
- 使用 CSS `transition` 提供平滑的切换效果

## 扩展指南

### 添加新页面

1. **创建页面组件**：
   ```vue
   <!-- src/pages/NewPage/NewPage.vue -->
   <template>
     <div class="new-page">
       <StatePreservationDemo page-name="newpage" />
       <!-- 页面内容 -->
     </div>
   </template>
   
   <script>
   import { useComplexComponentState } from '@utils/usePageState'
   
   export default {
     setup() {
       const pageState = useComplexComponentState('newpage')
       return { pageState }
     }
   }
   </script>
   ```

2. **在 PageContainer 中注册**：
   ```vue
   <div v-show="currentPage === 'newpage'" class="page-content">
     <NewPage />
   </div>
   ```

3. **添加路由配置**：
   ```javascript
   {
     path: '/newpage',
     name: 'NewPage',
     component: NewPage,
     meta: { title: '新页面', icon: '🆕' }
   }
   ```

### 自定义状态管理

```javascript
// 创建专用的状态管理 Hook
export function useCustomPageState(pageName) {
  const baseState = usePageState(pageName, {
    customData: {},
    settings: {}
  })
  
  const saveCustomData = (data) => {
    baseState.updateState({ customData: data })
  }
  
  return { ...baseState, saveCustomData }
}
```

## 注意事项

1. **内存使用**：所有页面组件同时存在内存中，注意监控内存使用情况
2. **初始化时机**：页面组件在应用启动时就会被创建，注意初始化逻辑
3. **事件监听**：确保隐藏页面的事件监听器不会影响当前页面
4. **异步操作**：页面切换时注意处理正在进行的异步操作

## 总结

通过实现基于组件显示/隐藏的页面切换方案，我们成功解决了复杂组件状态保留的难题：

- ✅ **零状态丢失**：所有状态自然保留，无需手动处理
- ✅ **开发简单**：开发者无需关心状态存储恢复逻辑
- ✅ **性能优异**：避免组件重建，切换响应迅速
- ✅ **扩展性强**：新页面可轻松集成状态保留功能
- ✅ **用户体验**：页面切换流畅，状态连续性完美

这种方案特别适合需要保持复杂状态的应用场景，如 PDF 阅读器、表单填写、媒体播放器等。
