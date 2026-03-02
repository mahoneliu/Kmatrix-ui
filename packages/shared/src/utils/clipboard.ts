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
 * Optional translation function or messages
 */
export interface CopyOptions {
  label?: string;
  msgSuccess?: string;
  msgError?: string;
  msgEmpty?: string;
  t?: (key: string, ...args: any[]) => string;
}

/**
 * 获取复制成功提示词
 */
function getSuccessMsg(opt: CopyOptions): string {
  const { label, t } = opt;
  if (opt.msgSuccess) return opt.msgSuccess;
  const suffix = t ? t('common.copied') : '已复制';
  return label ? `${label}${suffix}` : suffix;
}

/**
 * 获取复制失败提示词
 */
function getErrorMsg(opt: CopyOptions): string {
  const { label, t } = opt;
  if (opt.msgError) return opt.msgError;
  const suffix = t ? t('common.copy_fail') : '复制失败';
  return label ? `${label}${suffix}` : suffix;
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param options 选项，包含翻译函数或提示信息
 * @returns boolean 是否复制成功
 */
export async function copyToClipboard(text: string, options: string | CopyOptions = '内容'): Promise<boolean> {
  const msg = getMessage();
  const opt: CopyOptions = typeof options === 'string' ? { label: options } : options;
  const { t } = opt;

  if (!text) {
    msg.warning(opt.msgEmpty || (t ? t('common.copy_empty') : '复制内容为空'));
    return false;
  }

  try {
    // 优先使用 Clipboard API (仅在安全上下文可用)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      msg.success(getSuccessMsg(opt));
      return true;
    }

    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      msg.success(getSuccessMsg(opt));
      return true;
    }
    msg.error(getErrorMsg(opt));
    return false;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Copy failed:', err);
    msg.error(getErrorMsg(opt));
    return false;
  }
}
