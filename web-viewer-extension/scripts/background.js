// 后台脚本 - 处理插件的后台逻辑

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Viewer Extension 已安装');
    
    // 设置默认存储值
    chrome.storage.sync.set({
        'currentUrl': 'https://weread.qq.com/web/reader/cda321b0813ab8f57g017ac9k16732dc0161679091c5aeb1',
        'autoLoad': true
    });
});

// 监听来自popup和sidepanel的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openSidePanel') {
        // 打开侧边栏
        chrome.sidePanel.open({ windowId: sender.tab?.windowId });
        sendResponse({ success: true });
    } else if (request.action === 'loadUrl') {
        // 保存当前URL到存储
        chrome.storage.sync.set({ 'currentUrl': request.url });
        sendResponse({ success: true });
    } else if (request.action === 'getCurrentUrl') {
        // 获取当前保存的URL
        chrome.storage.sync.get(['currentUrl'], (result) => {
            sendResponse({ url: result.currentUrl || '' });
        });
        return true; // 保持消息通道开放
    }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('标签页更新:', tab.url);
    }
});

// 处理侧边栏相关的逻辑
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
