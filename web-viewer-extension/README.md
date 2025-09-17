# Web Viewer Extension

一个可以在浏览器侧边栏中打开指定网址的Chrome扩展插件。

## 功能特性

- 🌐 在侧边栏中加载任意网址
- 📱 响应式设计，适配不同屏幕尺寸
- 🔄 支持页面刷新功能
- 💾 自动保存上次访问的网址
- ⚡ 快速链接功能
- 🎨 现代化的用户界面

## 安装方法

1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本插件的文件夹

## 使用方法

### 方法一：通过插件图标
1. 点击浏览器工具栏中的插件图标
2. 在弹出窗口中点击"打开侧边栏"
3. 或者点击快速链接直接访问预设网站

### 方法二：直接打开侧边栏
1. 点击插件图标会自动打开侧边栏
2. 在侧边栏的输入框中输入网址
3. 点击"加载"按钮或按回车键

## 文件结构

```
web-viewer-extension/
├── manifest.json          # 插件配置文件
├── popup.html             # 弹出窗口页面
├── sidepanel.html         # 侧边栏页面
├── scripts/
│   ├── background.js      # 后台脚本
│   ├── popup.js          # 弹出窗口脚本
│   └── sidepanel.js      # 侧边栏脚本
├── styles/
│   ├── popup.css         # 弹出窗口样式
│   └── sidepanel.css     # 侧边栏样式
├── images/
│   └── (图标文件)
└── README.md
```

## 默认网址

插件默认加载微信读书的网址：
`https://weread.qq.com/web/reader/cda321b0813ab8f57g017ac9k16732dc0161679091c5aeb1`

你可以在侧边栏中输入任何其他网址来访问不同的网站。

## 技术特性

- 使用Chrome Extension Manifest V3
- 支持侧边栏API (Side Panel API)
- 本地存储用户偏好设置
- 安全的iframe沙箱环境
- 现代化的CSS样式和动画效果

## 注意事项

- 某些网站可能不允许在iframe中加载（X-Frame-Options限制）
- 插件需要网络权限来加载外部网站
- 建议使用HTTPS网址以确保安全性

## 开发者信息

这个插件是基于Chrome Extension API开发的，参考了现有插件的架构设计。
