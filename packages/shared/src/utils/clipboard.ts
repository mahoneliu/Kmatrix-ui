import { createDiscreteApi } from 'naive-ui';

let messageApi: any = null;

function getMessage() {
  if (!messageApi) {
    const { message } = createDiscreteApi(['message']);
    messageApi = message;
  }
  return messageApi;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param label 提示标签，如"链接"、"代码"等
 * @returns boolean 是否复制成功
 */
export async function copyToClipboard(text: string, label: string = '内容'): Promise<boolean> {
  const msg = getMessage();

  if (!text) {
    msg.warning('复制内容为空');
    return false;
  }

  try {
    // 优先使用 Clipboard API (仅在安全上下文可用)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      const successMsg = label ? `${label}已复制` : '已复制';
      msg.success(successMsg);
      return true;
    }

    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 避免页面滚动和闪烁
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999); // 兼容移动端

    // 尝试执行复制命令
    const successful = document.execCommand('copy');

    document.body.removeChild(textArea);

    if (successful) {
      const successMsg = label ? `${label}已复制` : '已复制';
      msg.success(successMsg);
      return true;
    }
    const errorMsg = label ? `${label}复制失败` : '复制失败';
    msg.error(errorMsg);
    return false;
  } catch (err) {
    console.error('Copy failed:', err);
    const errorMsg = label ? `${label}复制失败` : '复制失败';
    msg.error(errorMsg);
    return false;
  }
}
