# 滴答清单 - 最小可用 Chrome 扩展 (MV3)

这是一个只包含“代办清单”功能的最小可用 Chrome 扩展，用于快速验证 UI 与本地数据存储。数据存储在 `chrome.storage.local` 中。

## 使用方法

1. 打开 Chrome，访问 `chrome://extensions/`。
2. 右上角开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目目录：`todo-extension/`。
5. 加载成功后，点击工具栏中的扩展图标，固定该扩展到工具栏，点击图标即可打开代办清单。

## 主要文件

- `manifest.json`：MV3 清单，声明 `popup.html` 和 `storage` 权限。
- `popup.html`：弹出页结构。
- `popup.css`：基础样式。
- `popup.js`：代办清单逻辑（新增、删除、勾选完成、双击编辑、统计），使用 `chrome.storage.local` 持久化。

## 说明

- 待办数据结构：`{ id, text, completed, createdAt, completedAt? }`
- 你可以直接删除 `chrome.storage` 中的 `todos` 键来清空数据：在 Popup 打开状态下按 `F12`，在 Console 执行：
  ```js
  chrome.storage.local.remove('todos')
  ```

如需我继续完善图中其余模块（记录、统计、日期分组、优先级/排序等），告诉我你的具体需求即可。
