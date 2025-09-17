// Popup脚本 - 处理弹出窗口的交互

document.addEventListener('DOMContentLoaded', function() {
    const openSidePanelBtn = document.getElementById('openSidePanel');
    const quickLinks = document.querySelectorAll('.quick-link');

    // 打开侧边栏按钮
    openSidePanelBtn.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'openSidePanel' }, function(response) {
            if (response && response.success) {
                window.close(); // 关闭popup
            }
        });
    });

    // 快速链接按钮
    quickLinks.forEach(link => {
        link.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            
            // 保存URL并打开侧边栏
            chrome.storage.sync.set({ 'currentUrl': url }, function() {
                chrome.runtime.sendMessage({ action: 'openSidePanel' }, function(response) {
                    if (response && response.success) {
                        // 向侧边栏发送加载URL的消息
                        setTimeout(() => {
                            chrome.runtime.sendMessage({ 
                                action: 'loadUrlInSidePanel', 
                                url: url 
                            });
                        }, 500);
                        window.close();
                    }
                });
            });
        });
    });
});
