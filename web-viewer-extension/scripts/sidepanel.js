// 侧边栏脚本 - 处理网页加载和用户交互

document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const saveProgressBtn = document.getElementById('saveProgressBtn');
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
    openNewTabBtn.addEventListener('click', openInNewTab);
    openInNewTabFromError.addEventListener('click', openInNewTab);
    tryAgain.addEventListener('click', loadUrl);
    backToInput.addEventListener('click', backToInputMode);
    selectFileBtn.addEventListener('click', selectFile);
    saveProgressBtn.addEventListener('click', saveCurrentProgress);
    fileInput.addEventListener('change', handleFileSelect);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadUrl();
        }
    });
    
    // 监听输入框变化，实时加载
    urlInput.addEventListener('input', function() {
        const url = urlInput.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                loadUrl();
            }, 1000); // 1秒后自动加载
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
    let inputTimeout;
    
    // 当前页码跟踪
    let currentPage = 1;
    let currentFileName = '';

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
        // 加载保存的状态
        loadSavedState();
    }

    // 加载保存的状态（URL或文件）
    function loadSavedState() {
        chrome.storage.local.get(['currentUrl', 'currentFile', 'fileType', 'fileData'], function(result) {
            console.log('加载保存的状态:', result);
            
            if (result.currentFile && result.fileType && result.fileData) {
                // 恢复文件状态
                console.log('恢复文件状态:', result.currentFile);
                urlInput.value = result.currentFile;
                currentFileName = result.currentFile;
                
                // 检查是否有该文件的保存进度
                loadFileProgress(result.currentFile, function(savedPage) {
                    if (savedPage) {
                        currentPage = parseInt(savedPage);
                        console.log('恢复文件进度:', savedPage);
                    }
                    
                    // 重新创建文件对象并加载
                    try {
                        const byteCharacters = atob(result.fileData);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const file = new File([byteArray], result.currentFile, { type: result.fileType });
                        
                        if (result.fileType === 'application/pdf' || result.currentFile.toLowerCase().endsWith('.pdf')) {
                            loadPDFFile(file);
                        } else {
                            const fileUrl = URL.createObjectURL(file);
                            loadUrlToFrame(fileUrl);
                        }
                    } catch (error) {
                        console.log('恢复文件失败:', error);
                        showWelcomeMessage();
                    }
                });
            } else if (result.currentUrl) {
                // 恢复URL状态
                urlInput.value = result.currentUrl;
                if (result.currentUrl.startsWith('http')) {
                    loadUrlToFrame(result.currentUrl);
                } else {
                    showWelcomeMessage();
                }
            } else {
                showWelcomeMessage();
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

        const finalUrl = processUrl(url);
        
        // 直接加载URL到iframe（不再特殊处理PDF路径）
        loadUrlToFrame(finalUrl);
        
        // 保存URL到存储，清空文件状态
        chrome.storage.local.set({ 
            'currentUrl': finalUrl,
            'currentFile': '',
            'fileType': '',
            'fileData': ''
        });
        
        // 重置文件相关变量
        currentFileName = '';
        currentPage = 1;
    }


    // 处理URL，支持网址
    function processUrl(url) {
        // 如果已经包含协议，直接返回
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
            return url;
        }
        
        // 默认添加https://协议
        return 'https://' + url;
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


    // 保存当前文件的阅读进度
    function saveCurrentProgress() {
        if (!currentFileName) {
            showError('没有当前文件');
            return;
        }
        
        // 尝试从PDF获取当前页码
        getCurrentPageFromPDF();
        
        // 总是提示用户输入当前页码（显示当前检测到的页码作为默认值）
        const defaultPage = currentPage && currentPage > 0 ? currentPage.toString() : '1';
        const userPage = prompt('请输入当前阅读的页码:', defaultPage);
        
        if (userPage && parseInt(userPage) > 0) {
            currentPage = parseInt(userPage);
        } else {
            showError('请输入有效的页码');
            return;
        }
        
        // 保存文件进度到专门的存储结构
        chrome.storage.local.get(['fileProgress'], function(result) {
            const fileProgress = result.fileProgress || {};
            fileProgress[currentFileName] = {
                page: currentPage,
                timestamp: Date.now()
            };
            
            chrome.storage.local.set({ 'fileProgress': fileProgress }, function() {
                console.log('保存进度成功:', currentFileName, '页码:', currentPage);
                // 显示保存成功提示
                showProgressSavedMessage();
            });
        });
    }
    
    // 从PDF获取当前页码
    function getCurrentPageFromPDF() {
        const pdfContainer = document.getElementById('pdfContainer');
        if (pdfContainer && pdfContainer.style.display !== 'none') {
            const embed = pdfContainer.querySelector('embed');
            if (embed && embed.src) {
                // 尝试从URL中提取页码
                const urlMatch = embed.src.match(/#page=(\d+)/);
                if (urlMatch) {
                    currentPage = parseInt(urlMatch[1]);
                    console.log('从PDF URL获取页码:', currentPage);
                    return;
                }
            }
            
            // 尝试通过其他方式获取页码（如果PDF查看器支持）
            try {
                // 检查是否可以从PDF查看器获取当前页码
                const pdfViewer = embed.contentDocument || embed.contentWindow;
                if (pdfViewer) {
                    console.log('尝试从PDF查看器获取页码');
                    // 这里可以添加更多的页码检测逻辑
                }
            } catch (e) {
                console.log('无法访问PDF内容:', e);
            }
        }
        
        // 如果无法从PDF获取，保持当前值或使用默认值
        if (!currentPage || currentPage < 1) {
            currentPage = 1;
        }
        console.log('最终使用的页码:', currentPage);
    }
    
    // 加载指定文件的保存进度
    function loadFileProgress(fileName, callback) {
        chrome.storage.local.get(['fileProgress'], function(result) {
            const fileProgress = result.fileProgress || {};
            const progress = fileProgress[fileName];
            
            if (progress && progress.page) {
                callback(progress.page);
            } else {
                callback(null);
            }
        });
    }
    
    // 显示进度保存成功消息
    function showProgressSavedMessage() {
        // 创建临时提示消息
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        message.textContent = '✅ 进度已保存';
        document.body.appendChild(message);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }


    // 在新标签页打开
    function openInNewTab() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('请输入有效的网址');
            return;
        }

        const finalUrl = processUrl(url);
        
        // 如果是PDF文件且有当前页码，添加到URL中
        let urlWithPage = finalUrl;
        if (currentPage > 1 && (finalUrl.includes('pdf') || currentFileName.toLowerCase().endsWith('.pdf'))) {
            urlWithPage = `${finalUrl}#page=${currentPage}`;
        }
        
        chrome.tabs.create({ url: urlWithPage });
    }

    // 选择文件
    function selectFile() {
        fileInput.click();
    }

    // 处理文件选择
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            urlInput.value = file.name; // 显示文件名
            currentFileName = file.name;
            
            // 检查是否有该文件的保存进度
            loadFileProgress(file.name, function(savedPage) {
                if (savedPage) {
                    currentPage = parseInt(savedPage);
                    console.log('找到保存的进度:', file.name, '页码:', savedPage);
                } else {
                    currentPage = 1; // 默认第一页
                    console.log('没有保存的进度，使用默认页码1');
                }
                
                // 读取文件数据并保存
                const reader = new FileReader();
                reader.onload = function(e) {
                    const arrayBuffer = e.target.result;
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    const base64Data = btoa(binary);
                    
                    // 保存文件信息和数据到本地存储
                    chrome.storage.local.set({ 
                        'currentFile': file.name,
                        'fileType': file.type,
                        'fileData': base64Data,
                        'currentUrl': '' // 清空URL
                    }, function() {
                        console.log('文件数据已保存到本地存储');
                    });
                };
                reader.readAsArrayBuffer(file);
                
                // 检查文件类型并加载
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    console.log('开始加载PDF文件，当前页码:', currentPage);
                    loadPDFFile(file);
                } else {
                    // 其他文件类型使用原有方法
                    const fileUrl = URL.createObjectURL(file);
                    loadUrlToFrame(fileUrl);
                }
            });
        }
    }

    // 加载PDF文件
    function loadPDFFile(file) {
        showLoading();
        hideErrorMessage();
        hideWelcomeMessage();
        
        // 隐藏iframe，显示PDF内容区域
        webFrame.style.display = 'none';
        
        // 创建PDF查看器容器
        let pdfContainer = document.getElementById('pdfContainer');
        if (!pdfContainer) {
            pdfContainer = document.createElement('div');
            pdfContainer.id = 'pdfContainer';
            pdfContainer.className = 'pdf-container';
            document.querySelector('.iframe-container').appendChild(pdfContainer);
        }
        
        pdfContainer.style.display = 'block';
        
        // 尝试不同的PDF显示方法
        tryDisplayPDF(file, pdfContainer);
    }

    // 尝试显示PDF
    function tryDisplayPDF(file, container) {
        const fileUrl = URL.createObjectURL(file);
        
        // 如果有保存的页码，添加到URL中
        let pdfUrlWithPage = fileUrl;
        if (currentPage && currentPage > 0) {
            pdfUrlWithPage = `${fileUrl}#page=${currentPage}`;
            console.log('加载PDF到页码:', currentPage, '完整URL:', pdfUrlWithPage);
        } else {
            console.log('没有保存的页码，从第1页开始');
        }
        
        // 方法1: 使用embed标签
        container.innerHTML = `
            <div class="pdf-viewer-container">
                <embed 
                    src="${pdfUrlWithPage}" 
                    type="application/pdf" 
                    width="100%" 
                    height="100%"
                    style="border: none; background: white;"
                />
            </div>
        `;
        
        hideLoading();
        
        // 添加embed加载完成的监听
        setTimeout(() => {
            const embed = container.querySelector('embed');
            if (embed) {
                console.log('PDF embed元素已创建，src:', embed.src);
            }
        }, 100);
        
        // 如果embed失败，显示替代方案
        setTimeout(() => {
            const embed = container.querySelector('embed');
            if (!embed || embed.offsetHeight === 0) {
                showPDFAlternative(file, container);
            }
        }, 2000);
    }

    // 显示PDF替代方案
    function showPDFAlternative(file, container) {
        const fileUrl = URL.createObjectURL(file);
        container.innerHTML = `
            <div class="pdf-alternative">
                <div class="pdf-icon">📄</div>
                <h3>PDF文件: ${file.name}</h3>
                <p>由于浏览器安全限制，无法在侧边栏中直接显示PDF文件。</p>
                <div class="pdf-actions">
                    <button onclick="openPDFInNewTab('${fileUrl}')" class="pdf-btn primary">在新标签页打开</button>
                    <button onclick="downloadPDF('${fileUrl}', '${file.name}')" class="pdf-btn secondary">下载文件</button>
                </div>
                <div class="pdf-info">
                    <p><strong>文件大小:</strong> ${formatFileSize(file.size)}</p>
                    <p><strong>文件类型:</strong> ${file.type || 'application/pdf'}</p>
                </div>
            </div>
        `;
    }


    // 返回输入模式
    function backToInputMode() {
        hideErrorMessage();
        hideLoading();
        showWelcomeMessage();
        webFrame.src = '';
        webFrame.style.display = 'none';
        
        // 隐藏PDF容器
        const pdfContainer = document.getElementById('pdfContainer');
        if (pdfContainer) {
            pdfContainer.style.display = 'none';
        }
        
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
        console.error('错误:', message);
        alert(message); // 临时使用alert显示错误信息
    }
    
    // 测试函数：查看当前存储的进度数据
    function debugProgress() {
        chrome.storage.local.get(['fileProgress'], function(result) {
            console.log('当前存储的进度数据:', result.fileProgress);
            console.log('当前文件名:', currentFileName);
            console.log('当前页码:', currentPage);
        });
    }
    
    // 将调试函数暴露到全局，方便在控制台调用
    window.debugProgress = debugProgress;

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'loadUrlInSidePanel') {
            urlInput.value = request.url;
            loadUrlToFrame(request.url);
            sendResponse({ success: true });
        }
    });
});

// 全局辅助函数
function openPDFInNewTab(url) {
    chrome.tabs.create({ url: url });
}

function downloadPDF(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 全局返回输入模式函数
function backToInputMode() {
    const errorMessage = document.getElementById('errorMessage');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const webFrame = document.getElementById('webFrame');
    const loading = document.getElementById('loading');
    const urlInput = document.getElementById('urlInput');
    
    // 重置所有状态
    errorMessage.style.display = 'none';
    loading.style.display = 'none';
    webFrame.src = '';
    webFrame.style.display = 'none';
    
    // 隐藏PDF容器
    const pdfContainer = document.getElementById('pdfContainer');
    if (pdfContainer) {
        pdfContainer.style.display = 'none';
        pdfContainer.innerHTML = ''; // 清空内容
    }
    
    // 显示欢迎界面
    welcomeMessage.style.display = 'flex';
    
    // 聚焦到输入框
    urlInput.focus();
    urlInput.select();
}
