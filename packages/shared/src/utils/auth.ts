/** Token 存储键名 */
const getStoragePrefix = () => (import.meta.env.VITE_STORAGE_PREFIX as string) || '';
const TOKEN_STORAGE_KEY = `${getStoragePrefix()}token`;
const AUTH_COOKIE_NAME = 'Authorization';

/**
 * 获取原始 Token（已清理引号，不含 Bearer 前缀）
 * @param externalToken 外部传入的 Token（优先级最高）
 * @returns 清理后的原始 Token，若不存在则返回空字符串
 */
export function getAuthToken(externalToken?: string): string {
  // 优先使用外部传入的 token
  let token = externalToken || '';

  // 其次从 localStorage 获取
  if (!token) {
    token = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  }

  // 最后从 Cookie 获取
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === AUTH_COOKIE_NAME) {
        token = decodeURIComponent(value);
        break;
      }
    }
  }

  // 清理引号和空格
  if (token) {
    token = token.trim().replace(/^["']|["']$/g, '');
    // 移除可能存在的 Bearer 前缀，返回纯 token
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
  }

  return token;
}

/**
 * 获取 Authorization 请求头（带 Bearer 前缀）
 * @param externalToken 外部传入的 Token（优先级最高）
 * @returns 包含 Authorization 的 headers 对象，若无 token 则返回空对象
 */
export function getAuthHeaders(externalToken?: string): Record<string, string> {
  const token = getAuthToken(externalToken);
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
