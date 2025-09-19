// Chrome Extension Background Script (Service Worker)

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Vue 模块化插件已安装', details);
  
  // 设置默认的侧边栏
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  
  // 初始化存储数据
  chrome.storage.local.set({
    'vue-extension-settings': {
      theme: 'light',
      defaultPage: 'reading',
      initialized: true,
      installDate: new Date().toISOString()
    }
  });
});

// 处理插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // 打开侧边栏
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('打开侧边栏失败:', error);
  }
});

// 处理来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  
  switch (message.type) {
    case 'GET_TAB_INFO':
      // 获取当前标签页信息
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendResponse({
            success: true,
            data: {
              url: tabs[0].url,
              title: tabs[0].title,
              id: tabs[0].id
            }
          });
        } else {
          sendResponse({ success: false, error: '无法获取标签页信息' });
        }
      });
      return true; // 保持消息通道开放
      
    case 'SAVE_SETTINGS':
      // 保存设置
      chrome.storage.local.set({
        'vue-extension-settings': message.data
      }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'GET_SETTINGS':
      // 获取设置
      chrome.storage.local.get(['vue-extension-settings'], (result) => {
        sendResponse({
          success: true,
          data: result['vue-extension-settings'] || {}
        });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: '未知消息类型' });
  }
});

// 处理存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('存储发生变化:', changes, namespace);
  
  // 通知所有打开的插件页面设置已更新
  chrome.runtime.sendMessage({
    type: 'SETTINGS_UPDATED',
    data: changes
  }).catch(() => {
    // 忽略没有接收者的错误
  });
});

// 处理标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 可以在这里添加页面加载完成后的逻辑
    console.log('页面加载完成:', tab.url);
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
});
