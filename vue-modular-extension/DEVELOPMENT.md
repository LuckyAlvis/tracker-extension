# 开发指南

## 项目概述

这是一个基于 Vue 3 的高扩展性、模块化 Chrome 插件框架，采用现代化的开发技术栈和最佳实践。

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式方案**: CSS3 + CSS Variables
- **插件规范**: Chrome Extension Manifest V3

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

### 3. 构建插件

```bash
npm run build
```

### 4. 在 Chrome 中加载插件

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 项目结构详解

```
src/
├── main.js                 # Vue 应用入口
├── App.vue                 # 根组件
├── components/             # 通用组件
│   ├── Navigation/         # 导航组件
│   └── Common/             # 公共组件
├── pages/                  # 功能页面
│   ├── Reading/            # 阅读功能
│   ├── Pomodoro/           # 番茄钟功能
│   ├── Settings/           # 设置页面
│   └── [Future]/           # 未来功能页面
├── router/                 # 路由配置
├── store/                  # 状态管理
├── styles/                 # 样式文件
│   ├── global.css          # 全局样式
│   ├── variables.css       # CSS 变量
│   └── components/         # 组件样式
└── utils/                  # 工具函数
    ├── chrome.js           # Chrome API 封装
    └── helpers.js          # 通用工具函数
```

## 添加新功能页面

### 1. 创建页面组件

在 `src/pages/` 下创建新的功能文件夹：

```bash
mkdir src/pages/NewFeature
```

创建主组件文件：

```vue
<!-- src/pages/NewFeature/NewFeature.vue -->
<template>
  <div class="new-feature-page">
    <div class="page-header">
      <h1>新功能</h1>
    </div>
    <!-- 功能内容 -->
  </div>
</template>

<script>
export default {
  name: 'NewFeature',
  setup() {
    // 组件逻辑
    return {}
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 2. 添加路由配置

在 `src/router/index.js` 中添加新路由：

```javascript
const NewFeature = () => import('@pages/NewFeature/NewFeature.vue')

const routes = [
  // 现有路由...
  {
    path: '/new-feature',
    name: 'NewFeature',
    component: NewFeature,
    meta: {
      title: '新功能',
      icon: '🆕',
      description: '新功能描述',
      hideInNav: false // 是否在导航中隐藏
    }
  }
]
```

### 3. 更新导航

导航会自动根据路由配置生成，确保路由的 `meta.hideInNav` 设置正确。

## 组件开发规范

### 1. 组件命名

- 使用 PascalCase 命名组件
- 文件名与组件名保持一致
- 组件应该有明确的职责

### 2. 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@store/app'

export default {
  name: 'ComponentName',
  
  props: {
    // 属性定义
  },
  
  emits: ['event-name'],
  
  setup(props, { emit }) {
    // 组合式 API 逻辑
    
    return {
      // 返回响应式数据和方法
    }
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 3. 样式规范

- 优先使用 CSS 变量
- 使用 scoped 样式避免污染
- 遵循 BEM 命名规范
- 响应式设计优先

## 状态管理

### 使用 Pinia Store

```javascript
// src/store/feature.js
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useFeatureStore = defineStore('feature', () => {
  // 状态
  const data = ref([])
  const loading = ref(false)
  
  // 方法
  const fetchData = async () => {
    loading.value = true
    try {
      // 获取数据逻辑
    } finally {
      loading.value = false
    }
  }
  
  return {
    data,
    loading,
    fetchData
  }
})
```

## Chrome API 使用

### 使用封装的工具函数

```javascript
import { getCurrentTab, setStorage, getStorage } from '@utils/chrome'

// 获取当前标签页
const tab = await getCurrentTab()

// 存储数据
await setStorage({ key: 'value' })

// 获取数据
const data = await getStorage(['key'])
```

### 权限配置

在 `manifest.json` 中添加所需权限：

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "sidePanel"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

## 样式系统

### CSS 变量使用

```css
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}
```

### 主题切换

主题通过 CSS 变量实现，在 `src/styles/variables.css` 中定义不同主题的变量值。

## 调试技巧

### 1. 开发者工具

- 在插件页面右键选择"检查"
- 使用 Vue DevTools 调试组件状态

### 2. 日志输出

```javascript
// 开发环境下的调试日志
if (import.meta.env.DEV) {
  console.log('调试信息:', data)
}
```

### 3. 错误处理

```javascript
try {
  // 可能出错的代码
} catch (error) {
  console.error('操作失败:', error)
  appStore.showNotification({
    type: 'error',
    title: '操作失败',
    message: error.message
  })
}
```

## 性能优化

### 1. 组件懒加载

```javascript
const LazyComponent = () => import('./LazyComponent.vue')
```

### 2. 图片优化

- 使用适当的图片格式
- 压缩图片大小
- 使用 WebP 格式

### 3. 代码分割

Vite 会自动进行代码分割，但可以手动优化：

```javascript
// 动态导入
const module = await import('./module.js')
```

## 测试

### 单元测试

```javascript
// 使用 Vitest 进行单元测试
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

describe('Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(Component)
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

## 部署发布

### 1. 构建生产版本

```bash
npm run build:extension
```

### 2. 打包插件

将 `dist` 目录压缩为 zip 文件，用于上传到 Chrome 网上应用店。

### 3. 版本管理

更新 `manifest.json` 和 `package.json` 中的版本号。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 常见问题

### Q: 如何添加新的 Chrome 权限？

A: 在 `manifest.json` 的 `permissions` 或 `host_permissions` 数组中添加所需权限。

### Q: 如何处理跨域问题？

A: 在 `manifest.json` 的 `host_permissions` 中添加目标域名。

### Q: 如何调试 background script？

A: 在 `chrome://extensions/` 页面点击插件的"检查视图"链接。

## 更多资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [Vite 官方文档](https://vitejs.dev/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
