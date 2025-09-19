# Vue 模块化 Chrome 插件

一个基于 Vue 3 的高扩展性、模块化 Chrome 插件框架。

## 项目特点

- 🎯 **模块化设计**: 每个功能页面作为独立组件维护
- 🔧 **高扩展性**: 轻松添加新功能页面（健身、记账等）
- 🎨 **通用框架**: 共享的样式和 HTML 基础骨架
- ⚡ **Vue 3**: 使用最新的 Vue 3 Composition API
- 📦 **Chrome Extension V3**: 支持最新的 Manifest V3 规范
- 🔄 **低耦合**: 各模块间独立，便于维护和扩展

## 项目结构

```
vue-modular-extension/
├── manifest.json                 # Chrome 插件配置文件
├── package.json                  # 项目依赖配置
├── vite.config.js               # Vite 构建配置
├── public/                      # 静态资源
│   └── icons/                   # 插件图标
├── src/                         # 源代码
│   ├── main.js                  # Vue 应用入口
│   ├── App.vue                  # 根组件
│   ├── router/                  # 路由配置
│   │   └── index.js
│   ├── components/              # 通用组件
│   │   ├── Layout/              # 布局组件
│   │   ├── Navigation/          # 导航组件
│   │   └── Common/              # 公共组件
│   ├── pages/                   # 功能页面组件
│   │   ├── Reading/             # 阅读功能
│   │   ├── Pomodoro/            # 番茄钟功能
│   │   ├── Fitness/             # 健身功能（预留）
│   │   └── Accounting/          # 记账功能（预留）
│   ├── styles/                  # 样式文件
│   │   ├── global.css           # 全局样式
│   │   ├── variables.css        # CSS 变量
│   │   └── components/          # 组件样式
│   ├── utils/                   # 工具函数
│   └── store/                   # 状态管理
└── dist/                        # 构建输出目录
```

## 初期功能

- 📖 **阅读页面**: 文档阅读和管理
- 🍅 **番茄钟**: 时间管理工具

## 未来扩展

- 💪 **健身模块**: 运动记录和计划
- 💰 **记账模块**: 财务管理工具
- 📝 **笔记模块**: 知识管理系统
- 📊 **数据分析**: 使用统计和分析

## 开发指南

### 添加新功能页面

1. 在 `src/pages/` 下创建新的功能文件夹
2. 创建主组件文件（如 `NewFeature.vue`）
3. 在 `src/router/index.js` 中添加路由配置
4. 在导航组件中添加菜单项

### 技术栈

- Vue 3 + Composition API
- Vue Router 4
- Vite (构建工具)
- Chrome Extension Manifest V3
- CSS3 + CSS Variables

## 安装和使用

1. 安装依赖: `npm install`
2. 开发模式: `npm run dev`
3. 构建插件: `npm run build`
4. 在 Chrome 中加载 `dist` 目录作为插件
