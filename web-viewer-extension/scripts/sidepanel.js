// 侧边栏脚本 - 处理网页加载和用户交互

document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const loadBtn = document.getElementById('loadBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const webFrame = document.getElementById('webFrame');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const openInNewTabFromError = document.getElementById('openInNewTabFromError');
    const tryAgain = document.getElementById('tryAgain');
    const backToInput = document.getElementById('backToInput');

    // 初始化界面
    initializeInterface();
    
    // 确保欢迎界面显示
    console.log('初始化插件界面');

    // 绑定事件监听器
    loadBtn.addEventListener('click', loadUrl);
    refreshBtn.addEventListener('click', refreshPage);
    openNewTabBtn.addEventListener('click', openInNewTab);
    openInNewTabFromError.addEventListener('click', openInNewTab);
    tryAgain.addEventListener('click', loadUrl);
    backToInput.addEventListener('click', backToInputMode);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadUrl();
        }
    });

    // iframe加载事件
    webFrame.addEventListener('load', function() {
        console.log('iframe加载完成');
        clearTimeout(loadTimeout);
        hideLoading();
    });

    webFrame.addEventListener('error', function(e) {
        console.log('iframe加载错误:', e);
        clearTimeout(loadTimeout);
        showErrorMessage();
    });

    // 设置加载超时
    let loadTimeout;

    // 初始化界面
    function initializeInterface() {
        console.log('开始初始化界面');
        // 确保所有元素都隐藏
        loading.style.display = 'none';
        webFrame.style.display = 'none';
        errorMessage.style.display = 'none';
        // 显示欢迎界面
        welcomeMessage.style.display = 'flex';
        console.log('欢迎界面应该已显示');
        // 加载保存的URL到输入框
        loadSavedUrlOnly();
    }

    // 只加载保存的URL到输入框，不自动加载页面
    function loadSavedUrlOnly() {
        chrome.storage.sync.get(['currentUrl'], function(result) {
            if (result.currentUrl) {
                urlInput.value = result.currentUrl;
            }
        });
    }

    // 加载保存的URL并显示页面
    function loadSavedUrl() {
        chrome.storage.sync.get(['currentUrl'], function(result) {
            if (result.currentUrl) {
                urlInput.value = result.currentUrl;
                loadUrlToFrame(result.currentUrl);
            }
        });
    }

    // 加载URL
    function loadUrl() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('请输入有效的网址');
            return;
        }

        // 确保URL包含协议
        const finalUrl = url.startsWith('http://') || url.startsWith('https://') 
            ? url 
            : 'https://' + url;

        loadUrlToFrame(finalUrl);
        
        // 保存URL到存储
        chrome.storage.sync.set({ 'currentUrl': finalUrl });
    }

    // 加载URL到iframe
    function loadUrlToFrame(url) {
        showLoading();
        hideErrorMessage();
        hideWelcomeMessage();
        webFrame.src = url;
        urlInput.value = url;
        
        // 设置超时检测
        loadTimeout = setTimeout(() => {
            showErrorMessage();
        }, 10000); // 10秒超时
    }

    // 刷新页面
    function refreshPage() {
        if (webFrame.src) {
            showLoading();
            webFrame.src = webFrame.src;
        }
    }

    // 在新标签页打开
    function openInNewTab() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('请输入有效的网址');
            return;
        }

        // 确保URL包含协议
        const finalUrl = url.startsWith('http://') || url.startsWith('https://') 
            ? url 
            : 'https://' + url;

        // 在新标签页打开
        chrome.tabs.create({ url: finalUrl });
    }


    // 返回输入模式
    function backToInputMode() {
        hideErrorMessage();
        showWelcomeMessage();
        webFrame.src = '';
        webFrame.style.display = 'none';
        loading.style.display = 'none';
        // 聚焦到输入框
        urlInput.focus();
        urlInput.select();
    }

    // 显示加载动画
    function showLoading() {
        loading.style.display = 'flex';
        webFrame.style.display = 'none';
        errorMessage.style.display = 'none';
        welcomeMessage.style.display = 'none';
    }

    // 隐藏加载动画
    function hideLoading() {
        loading.style.display = 'none';
        webFrame.style.display = 'block';
        errorMessage.style.display = 'none';
        welcomeMessage.style.display = 'none';
    }

    // 显示错误消息
    function showErrorMessage() {
        loading.style.display = 'none';
        webFrame.style.display = 'none';
        errorMessage.style.display = 'flex';
        welcomeMessage.style.display = 'none';
    }

    // 隐藏错误消息
    function hideErrorMessage() {
        errorMessage.style.display = 'none';
    }

    // 显示欢迎消息
    function showWelcomeMessage() {
        loading.style.display = 'none';
        webFrame.style.display = 'none';
        errorMessage.style.display = 'none';
        welcomeMessage.style.display = 'flex';
    }

    // 隐藏欢迎消息
    function hideWelcomeMessage() {
        welcomeMessage.style.display = 'none';
    }

    // 显示错误信息（保留兼容性）
    function showError(message) {
        showErrorMessage();
    }

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'loadUrlInSidePanel') {
            urlInput.value = request.url;
            loadUrlToFrame(request.url);
            sendResponse({ success: true });
        }
    });
});
