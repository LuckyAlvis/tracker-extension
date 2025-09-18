// PDF查看器 - 处理本地PDF文件显示
class PDFViewer {
    constructor(container) {
        this.container = container;
        this.currentFile = null;
    }

    // 加载PDF文件
    async loadPDF(file) {
        this.currentFile = file;
        
        try {
            // 创建PDF查看器界面
            this.createPDFViewer();
            
            // 读取文件内容
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // 使用PDF.js加载PDF（如果可用）
            if (window.pdfjsLib) {
                await this.loadWithPDFJS(arrayBuffer);
            }
        } catch (error) {
            console.error('PDF加载失败:', error);
            this.showError('PDF文件加载失败，请尝试在新标签页中打开');
        }
    }

    // 创建PDF查看器界面
    createPDFViewer() {
        this.container.innerHTML = `
            <div class="pdf-viewer">
                <div class="pdf-toolbar">
                    <button id="pdfPrevPage">上一页</button>
                    <span id="pdfPageInfo">页码: 1 / 1</span>
                    <button id="pdfNextPage">下一页</button>
                    <button id="pdfZoomOut">缩小</button>
                    <span id="pdfZoomLevel">100%</span>
                    <button id="pdfZoomIn">放大</button>
                </div>
                <div class="pdf-content" id="pdfContent">
                    <div class="pdf-loading">正在加载PDF...</div>
                </div>
            </div>
        `;
    }

    // 读取文件为ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 使用PDF.js加载
    async loadWithPDFJS(arrayBuffer) {
        try {
            const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
            this.renderPDFPage(pdf, 1);
        } catch (error) {
            console.error('PDF.js加载失败:', error);
            this.loadWithEmbed(this.currentFile);
        }
    }

    // 使用embed标签加载（降级方案）
    loadWithEmbed(file) {
        const url = URL.createObjectURL(file);
        this.container.innerHTML = `
            <div class="pdf-embed-container">
                <embed 
                    src="${url}" 
                    type="application/pdf" 
                    width="100%" 
                    height="100%"
                    style="border: none;"
                />
            </div>
        `;
    }

    // 渲染PDF页面
    async renderPDFPage(pdf, pageNum) {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({scale});

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        
        const pdfContent = document.getElementById('pdfContent');
        pdfContent.innerHTML = '';
        pdfContent.appendChild(canvas);

        // 更新页码信息
        document.getElementById('pdfPageInfo').textContent = `页码: ${pageNum} / ${pdf.numPages}`;
    }

    // 显示错误信息
    showError(message) {
        this.container.innerHTML = `
            <div class="pdf-error">
                <div class="error-icon">📄</div>
                <h3>PDF加载失败</h3>
                <p>${message}</p>
                <button onclick="window.pdfViewer.retry()">重试</button>
            </div>
        `;
    }

    // 重试加载
    retry() {
        if (this.currentFile) {
            this.loadPDF(this.currentFile);
        }
    }
}

// 导出PDF查看器
window.PDFViewer = PDFViewer;
