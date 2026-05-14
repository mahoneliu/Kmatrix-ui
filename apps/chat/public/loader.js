/**
 * KMatrix Embed Loader Script (Standalone)
 * 用于在第三方页面加载 KMatrix 聊天浮窗
 *
 * 使用方式:
 * <script src="http://localhost:9528/loader.js?appToken=YOUR_TOKEN&appId=YOUR_APP_ID"></script>
 */

/* eslint-disable no-underscore-dangle */
(function kmatrixLoader() {
  // 防止重复加载
  if (window.__KMATRIX_EMBED_LOADED__) return;
  window.__KMATRIX_EMBED_LOADED__ = true;

  // 获取当前脚本的参数
  let script = document.currentScript;
  if (!script) {
    // 兼容一些旧浏览器
    const scripts = document.getElementsByTagName('script');
    script = scripts[scripts.length - 1];
  }

  const scriptUrl = new URL(script.src);
  const appToken = scriptUrl.searchParams.get('appToken');
  const appId = scriptUrl.searchParams.get('appId');
  const primaryColor = scriptUrl.searchParams.get('primaryColor') || '#394befff';
  const theme = scriptUrl.searchParams.get('theme') || 'light';

  // 解析自定义参数 (customParams 为 JSON 字符串)
  const customParamsJson = scriptUrl.searchParams.get('customParams');

  if (!appToken || !appId) {
    // eslint-disable-next-line no-console
    console.error('[KMatrix Embed] Missing appToken or appId in script URL');
    return;
  }

  const baseUrl = scriptUrl.origin;
  // Derive chatUrl from script location (e.g. .../chat/loader.js -> .../chat/)
  const chatUrl = scriptUrl.href.split('?')[0].replace(/loader\.js$/, '');

  // 创建样式
  const style = document.createElement('style');
  style.textContent = `
        #km-embed-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: ${primaryColor};
            border: none;
            cursor: grab;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999998;
            transition: transform 0.2s, box-shadow 0.2s, left 0.3s, right 0.3s, top 0.3s, bottom 0.3s, opacity 0.3s;
            user-select: none;
            touch-action: none;
        }
        #km-embed-btn.dragging {
            cursor: grabbing;
            opacity: 0.8;
            transition: none;
        }
        #km-embed-btn.minimized {
            width: 20px;
            height: 20px;
            opacity: 0.8;
        }
        #km-embed-btn.minimized svg {
            width: 10px;
            height: 10px;
        }
        #km-embed-btn.disabled {
            cursor: default;
            pointer-events: none;
        }
        #km-embed-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        #km-embed-btn svg {
            width: 28px;
            height: 28px;
            fill: white;
        }
        #km-embed-container {
            position: fixed;
            bottom: 96px;
            right: 24px;
            width: 400px;
            height: 800px;
            max-height: calc(100vh - 120px);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            z-index: 999999;
            display: none;
            background: white;
        }
        #km-embed-container.active {
            display: block;
            animation: km-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #km-embed-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        @keyframes km-slide-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @media (max-width: 480px) {
            #km-embed-container {
                width: calc(100vw - 32px);
                right: 16px;
                bottom: 88px;
                height: calc(100vh - 120px);
            }
            #km-embed-btn {
                right: 16px;
                bottom: 16px;
            }
        }
    `;
  // 创建按钮
  const btn = document.createElement('button');
  btn.id = 'km-embed-btn';
  btn.title = 'AI 助手';
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8z"/></svg>';

  // 创建容器
  const container = document.createElement('div');
  container.id = 'km-embed-container';
  const iframe = document.createElement('iframe');

  // 构造最终的聊天 URL
  const finalChatUrl = `${chatUrl}?appToken=${appToken}&appId=${appId}&primaryColor=${encodeURIComponent(
    primaryColor
  )}&theme=${theme}&mode=float&customParams=${encodeURIComponent(customParamsJson || '')}`;

  iframe.src = finalChatUrl;
  iframe.allow = 'microphone;clipboard-write';
  container.appendChild(iframe);

  // 将样式、按钮、容器挂载到 DOM，兼容 SSR/Nuxt 等 body 可能尚未就绪的场景
  function mountElements() {
    (document.head || document.documentElement).appendChild(style);
    document.body.appendChild(btn);
    document.body.appendChild(container);
  }

  if (document.body) {
    mountElements();
  } else {
    document.addEventListener('DOMContentLoaded', mountElements);
  }

  // 状态变量
  let isOpen = false;
  let isDragging = false;
  let hasMoved = false; // 标记是否发生了拖拽移动
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let _currentPosition = { right: 24, bottom: 24 };
  let isMinimized = false; // 是否缩小状态
  let savedPosition = null; // 打开聊天前保存的位置
  let savedIsMinimized = false; // 打开聊天前保存的缩小状态
  const THRESHOLD = 50; // 缩小阈值，距离边缘小于50像素自动缩小
  const CLICK_THRESHOLD = 3; // 点击判定阈值，移动不超过3像素才算点击

  // 重置按钮到默认位置
  function resetBtnPosition() {
    btn.style.left = '';
    btn.style.top = '';
    btn.style.right = '24px';
    btn.style.bottom = '24px';
    currentPosition = { right: 24, bottom: 24 };
    isMinimized = false;
    btn.classList.remove('dragging', 'minimized');
  }

  // 保存当前状态
  function saveCurrentState() {
    savedPosition = {
      left: btn.style.left,
      top: btn.style.top,
      right: btn.style.right,
      bottom: btn.style.bottom
    };
    savedIsMinimized = isMinimized;
  }

  // 恢复到保存的状态
  function restoreSavedState() {
    if (!savedPosition) return;

    btn.style.left = savedPosition.left;
    btn.style.top = savedPosition.top;
    btn.style.right = savedPosition.right;
    btn.style.bottom = savedPosition.bottom;
    isMinimized = savedIsMinimized;

    if (isMinimized) {
      btn.classList.add('minimized');
    } else {
      btn.classList.remove('minimized');
    }
  }

  // 处理拖拽开始
  function handleDragStart(e) {
    if (isOpen) return; // 聊天窗打开时禁止拖拽

    isDragging = true;
    hasMoved = false;
    btn.classList.add('dragging');

    // 拖拽时恢复正常大小
    btn.classList.remove('minimized');
    isMinimized = false;

    // 获取点击位置相对于按钮的偏移
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    startX = clientX;
    startY = clientY;
    const rect = btn.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    // 清除原有定位，使用left和top定位
    btn.style.right = '';
    btn.style.bottom = '';
    btn.style.left = `${rect.left}px`;
    btn.style.top = `${rect.top}px`;

    // 阻止默认行为和事件冒泡
    e.preventDefault();
    e.stopPropagation();
  }

  // 处理拖拽中
  function handleDragMove(e) {
    if (!isDragging || isOpen) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    // 判断是否发生了移动
    const moveDistance = Math.sqrt((clientX - startX) ** 2 + (clientY - startY) ** 2);
    if (moveDistance > CLICK_THRESHOLD) {
      hasMoved = true;
    }

    // 计算新位置
    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;

    // 边界检测，确保按钮不会被拖出可视区域
    const maxLeft = window.innerWidth - btn.offsetWidth;
    const maxTop = window.innerHeight - btn.offsetHeight;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    // 更新位置
    btn.style.left = `${newLeft}px`;
    btn.style.top = `${newTop}px`;

    e.preventDefault();
    e.stopPropagation();
  }

  // 处理拖拽结束
  function handleDragEnd(e) {
    if (!isDragging || isOpen) return;

    isDragging = false;
    btn.classList.remove('dragging');

    const rect = btn.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 计算距离各边缘的距离
    const distanceToLeft = rect.left;
    const distanceToRight = windowWidth - rect.right;
    const distanceToTop = rect.top;
    const distanceToBottom = windowHeight - rect.bottom;

    // 找到最近的边缘
    const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

    // 如果距离边缘小于阈值，则缩小并贴边
    if (minDistance < THRESHOLD) {
      btn.classList.add('minimized');
      isMinimized = true;

      // 计算贴边位置，缩小后按钮大小是20px
      if (minDistance === distanceToLeft) {
        // 贴左边
        btn.style.left = '0px';
        btn.style.right = 'auto';
      } else if (minDistance === distanceToRight) {
        // 贴右边，直接用right定位更准确，不会受滚动条影响
        btn.style.right = '0px';
        btn.style.left = 'auto';
      } else if (minDistance === distanceToTop) {
        // 贴顶部
        btn.style.top = '0px';
        btn.style.bottom = 'auto';
      } else if (minDistance === distanceToBottom) {
        // 贴底部，直接用bottom定位更准确
        btn.style.bottom = '0px';
        btn.style.top = 'auto';
      }
    } else {
      btn.classList.remove('minimized');
      isMinimized = false;
    }

    // 保存当前位置
    _currentPosition = {
      left: Number.parseInt(btn.style.left, 10),
      top: Number.parseInt(btn.style.top, 10)
    };

    e.preventDefault();
    e.stopPropagation();
  }

  // 添加拖拽事件监听
  btn.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  // 移动端触摸事件
  btn.addEventListener('touchstart', handleDragStart, { passive: false });
  document.addEventListener('touchmove', handleDragMove, { passive: false });
  document.addEventListener('touchend', handleDragEnd, { passive: false });

  // 切换显示
  btn.addEventListener('click', function handleBtnClick(e) {
    if (isDragging || hasMoved) {
      // 如果是拖拽过程中或者已经发生了移动，不执行切换
      e.preventDefault();
      e.stopPropagation();
      // 重置移动标记
      hasMoved = false;
      return;
    }

    isOpen = !isOpen;
    if (isOpen) {
      // 打开聊天窗时，先保存当前状态，再重置按钮到默认位置并禁用拖拽
      saveCurrentState();
      resetBtnPosition();
      btn.classList.add('disabled');
      container.classList.add('active');
    } else {
      container.classList.remove('active');
      btn.classList.remove('disabled');
      // 关闭聊天窗时，恢复到之前的位置和状态
      restoreSavedState();
    }
  });

  // 监听来自 iframe 的消息
  window.addEventListener('message', function handleMessage(event) {
    if (event.origin !== baseUrl) return;

    try {
      const action = event.data.type || event.data.action;
      if (action === 'maximize-chat') {
        const maximized = event.data.data?.maximized || event.data.maximized;
        container.style.width = maximized ? '50vw' : '400px';
        container.style.height = maximized ? '100vh' : '800px';
        container.style.right = maximized ? '0' : '24px';
        container.style.bottom = maximized ? '0' : '96px';
        container.style.borderRadius = maximized ? '8px' : '8px';
        container.style.maxHeight = maximized ? 'none' : '';
      } else if (action === 'close-chat') {
        isOpen = false;
        container.classList.remove('active');
        btn.classList.remove('disabled');
      }
    } catch {}
  });

  // 窗口大小改变时，重新调整按钮位置，防止超出可视区域
  let resizeTimer = null;
  window.addEventListener('resize', function handleResize() {
    if (isOpen) return;

    // 防抖处理
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const rect = btn.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // 如果按钮超出可视区域，调整位置
      if (rect.right > windowWidth) {
        btn.style.left = `${windowWidth - btn.offsetWidth}px`;
      }
      if (rect.bottom > windowHeight) {
        btn.style.top = `${windowHeight - btn.offsetHeight}px`;
      }
      if (rect.left < 0) {
        btn.style.left = '0px';
      }
      if (rect.top < 0) {
        btn.style.top = '0px';
      }
    }, 100);
  });

  // console.log('[KMatrix] Embed loader initialized');
})();
