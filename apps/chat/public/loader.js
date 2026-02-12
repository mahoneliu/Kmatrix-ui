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
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999998;
            transition: transform 0.2s, box-shadow 0.2s;
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
  document.head.appendChild(style);

  // 创建按钮
  const btn = document.createElement('button');
  btn.id = 'km-embed-btn';
  btn.title = 'AI 助手';
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8z"/></svg>';
  document.body.appendChild(btn);

  // 创建容器
  const container = document.createElement('div');
  container.id = 'km-embed-container';
  const iframe = document.createElement('iframe');

  // 构造最终的聊天 URL
  const finalChatUrl = `${chatUrl}?appToken=${appToken}&appId=${appId}&primaryColor=${encodeURIComponent(
    primaryColor
  )}&theme=${theme}&mode=float`;

  iframe.src = finalChatUrl;
  iframe.allow = 'microphone;clipboard-write';
  container.appendChild(iframe);
  document.body.appendChild(container);

  // 切换显示
  let isOpen = false;
  btn.addEventListener('click', function handleBtnClick() {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
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
      }
    } catch {}
  });

  // console.log('[KMatrix] Embed loader initialized');
})();
