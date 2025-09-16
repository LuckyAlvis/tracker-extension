// Inject a right-side sidebar with an iframe that loads our panel.html
(function () {
  if (window.__todo_sidebar_injected__) return;
  window.__todo_sidebar_injected__ = true;

  const SIDEBAR_WIDTH = 380; // 抽屉内容宽度
  const HANDLE_WIDTH = 36; // 抽屉把手宽度（收起时显示）

  const root = document.createElement('div');
  root.style.position = 'fixed';
  root.style.top = '0';
  root.style.right = '0';
  root.style.height = '100vh';
  root.style.width = '0'; // 由内部元素控制点击区域
  root.style.zIndex = '2147483646';
  // 主机元素需要可接收事件，否则内部把手与遮罩无法点击
  root.style.pointerEvents = 'auto';

  // Shadow DOM 避免样式冲突
  const shadow = root.attachShadow({ mode: 'open' });

  // 样式定义：真正的抽屉，从右侧滑出，高度与窗口一致
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    /* 不使用遮罩，避免遮挡页面交互 */
    .overlay { display: none; }
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      background: #ffffff;
      color: #111827;
      border-left: 1px solid rgba(0,0,0,.08);
      border-radius: 12px 0 0 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.12), 0 2px 10px rgba(0,0,0,.08);
      transform: translateX(100%);
      transition: transform .22s ease;
      display: flex;
      overflow: hidden;
    }
    .drawer.open { transform: translateX(0); }
    .closeBtn {
      position: absolute; top: 8px; right: 8px; width: 28px; height: 28px;
      border-radius: 6px; border: 1px solid rgba(0,0,0,.08); background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.08); cursor: pointer; color: #374151;
      display: flex; align-items: center; justify-content: center; font-size: 16px;
    }
    .closeBtn:hover { filter: brightness(0.98); }
    .handle {
      position: fixed;
      top: 120px;
      right: 0;
      width: ${HANDLE_WIDTH}px;
      height: 96px;
      border-radius: 8px 0 0 8px;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,.08);
      border-right: none;
      box-shadow: 0 4px 12px rgba(0,0,0,.12);
      display: flex; align-items: center; justify-content: center;
      color: #111827;
      cursor: pointer; user-select: none;
      writing-mode: vertical-rl; text-orientation: mixed;
      font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
      pointer-events: auto;
      background-clip: padding-box;
    }
    .handle:hover { filter: brightness(0.98); }
    .frame { width: 100%; height: 100%; border: 0; }
  `;

  // 遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  // 抽屉
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.style.pointerEvents = 'auto';

  const iframe = document.createElement('iframe');
  iframe.className = 'frame';
  iframe.src = chrome.runtime.getURL('panel.html');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'closeBtn';
  closeBtn.textContent = '×';
  closeBtn.title = '关闭';
  closeBtn.addEventListener('click', () => close());

  drawer.appendChild(closeBtn);
  drawer.appendChild(iframe);

  // 把手（始终显示在右侧边缘）
  const handle = document.createElement('div');
  handle.className = 'handle';
  handle.textContent = '滴答清单';
  handle.title = '展开/收起';
  handle.addEventListener('click', () => toggle());

  shadow.appendChild(style);
  shadow.appendChild(overlay);
  shadow.appendChild(drawer);
  shadow.appendChild(handle);

  document.documentElement.appendChild(root);

  // ===== 全局同步开关状态 =====
  let isOpen = false;

  function apply(opened) {
    isOpen = opened;
    if (opened) {
      drawer.classList.add('open');
      overlay.classList.add('show');
      reservePageSpace(true);
      // 把手移到抽屉左侧，便于点击关闭
      handle.style.right = `${SIDEBAR_WIDTH}px`;
    } else {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
      reservePageSpace(false);
      handle.style.right = '0';
    }
  }

  function open() { chrome.storage.local.set({ drawerOpen: true }); }
  function close() { chrome.storage.local.set({ drawerOpen: false }); }
  function toggle() { chrome.storage.local.set({ drawerOpen: !isOpen }); }

  // 初始化：读取存储状态并应用
  chrome.storage.local.get(['drawerOpen'], (res) => {
    apply(Boolean(res.drawerOpen));
  });

  // 监听跨标签变化以同步 UI
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (Object.prototype.hasOwnProperty.call(changes, 'drawerOpen')) {
      apply(Boolean(changes.drawerOpen.newValue));
    }
  });

  // 为页面让出右侧空间（将内容整体向左收缩）
  function reservePageSpace(enable) {
    const html = document.documentElement;
    const body = document.body;
    if (!html) return;
    const width = `${SIDEBAR_WIDTH}px`;
    try {
      // 添加过渡；尽量不破坏原有 transition（若已有则不覆盖）
      if (!html.style.transition) html.style.transition = 'margin-right .22s ease';
      if (body && !body.style.transition) body.style.transition = 'margin-right .22s ease';
    } catch {}
    html.style.marginRight = enable ? width : '';
    if (body) body.style.marginRight = enable ? width : '';
    // 避免因为滚动条引发的水平滚动
    html.style.overflowX = enable ? 'hidden' : '';
    if (body) body.style.overflowX = enable ? 'hidden' : '';
  }
})();
