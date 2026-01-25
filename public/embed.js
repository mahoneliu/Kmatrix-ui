/**
 * KMatrix Embed SDK
 * 供第三方网站引入，用于嵌入 KMatrix 对话窗口
 *
 * 使用方式:
 * <script src="https://your-domain/embed.js"
 *         data-app-token="xxx"
 *         data-app-id="123"
 *         data-primary-color="#18a058"
 *         data-theme="light">
 * </script>
 */

(function kmatrixEmbed() {
  // 获取当前 script 标签
  const currentScript = document.currentScript;
  if (!currentScript) {
    console.error('[KMatrix Embed] 无法获取当前 script 标签');
    return;
  }

  // 解析配置
  const config = {
    appToken: currentScript.getAttribute('data-app-token') || '',
    appId: currentScript.getAttribute('data-app-id') || '',
    primaryColor: currentScript.getAttribute('data-primary-color') || '#18a058',
    theme: currentScript.getAttribute('data-theme') || 'light',
    position: currentScript.getAttribute('data-position') || 'bottom-right',
    width: currentScript.getAttribute('data-width') || '400px',
    height: currentScript.getAttribute('data-height') || '600px'
  };

  // 获取 embed 页面的基础 URL
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
  const embedUrl = `${baseUrl}/embed.html?appToken=${encodeURIComponent(config.appToken)}&appId=${encodeURIComponent(config.appId)}&primaryColor=${encodeURIComponent(config.primaryColor)}&theme=${encodeURIComponent(config.theme)}`;

  // 创建浮动按钮
  const floatButton = document.createElement('div');
  floatButton.id = 'kmatrix-embed-button';
  floatButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  floatButton.style.cssText = `
    position: fixed;
    ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${config.primaryColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  floatButton.onmouseenter = () => {
    floatButton.style.transform = 'scale(1.1)';
    floatButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
  };
  floatButton.onmouseleave = () => {
    floatButton.style.transform = 'scale(1)';
    floatButton.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
  };

  // 创建 iframe 容器
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'kmatrix-embed-container';
  iframeContainer.style.cssText = `
    position: fixed;
    ${config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
    ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    width: ${config.width};
    height: ${config.height};
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 120px);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    z-index: 9998;
    display: none;
    transition: opacity 0.3s, transform 0.3s;
    opacity: 0;
    transform: translateY(20px);
  `;

  // 创建 iframe
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;
  iframe.allow = 'clipboard-read; clipboard-write';

  iframeContainer.appendChild(iframe);

  // 添加到页面
  document.body.appendChild(floatButton);
  document.body.appendChild(iframeContainer);

  // 切换显示状态
  let isOpen = false;
  floatButton.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      requestAnimationFrame(() => {
        iframeContainer.style.opacity = '1';
        iframeContainer.style.transform = 'translateY(0)';
      });
      floatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      iframeContainer.style.opacity = '0';
      iframeContainer.style.transform = 'translateY(20px)';
      setTimeout(() => {
        iframeContainer.style.display = 'none';
      }, 300);
      floatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }
  };

  // 暴露全局 API
  window.KMatrixEmbed = {
    open: () => {
      if (!isOpen) floatButton.click();
    },
    close: () => {
      if (isOpen) floatButton.click();
    },
    toggle: () => {
      floatButton.click();
    }
  };
})();
