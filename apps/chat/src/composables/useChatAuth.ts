/**
 * Chat 应用认证 Composable
 * 管理匿名用户的 Session Token 存储和获取
 *
 * @author Mahone
 * @date 2026-01-27
 */
import { computed, ref } from 'vue';
import { anonymousAuth } from '@km/shared';

// localStorage key
const STORAGE_KEY = 'kmatrix_chat_auth';

// 认证状态
export interface ChatAuthState {
  sessionToken: string;
  userId: number;
  appId: number;
  appToken: string;
  expireTime: number;
}

// 全局认证状态（确保跨组件共享）
const authState = ref<ChatAuthState | null>(null);
const isInitializing = ref(false);
const initError = ref<string | null>(null);

/**
 * 从 localStorage 加载认证状态
 */
function loadFromStorage(appToken: string): ChatAuthState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: ChatAuthState = JSON.parse(stored);

    // 验证是否与当前 appToken 匹配
    if (state.appToken !== appToken) {
      return null;
    }

    // 验证是否过期（预留 5 分钟余量）
    const now = Date.now();
    if (state.expireTime && state.expireTime - now < 5 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return state;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * 保存认证状态到 localStorage
 */
function saveToStorage(state: ChatAuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn('[useChatAuth] 保存认证状态失败');
  }
}

/**
 * Chat 认证 Composable
 */
export function useChatAuth() {
  const isAuthenticated = computed(() => Boolean(authState.value?.sessionToken));
  const sessionToken = computed(() => authState.value?.sessionToken ?? '');
  const userId = computed(() => authState.value?.userId);

  /**
   * 初始化认证
   * 优先使用缓存的 Token，否则调用后端接口获取新 Token
   */
  async function initAuth(appToken: string): Promise<boolean> {
    if (!appToken) {
      initError.value = '缺少 appToken 参数';
      return false;
    }

    // 避免重复初始化
    if (isInitializing.value) {
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (!isInitializing.value) {
            clearInterval(check);
            resolve(Boolean(authState.value));
          }
        }, 100);
      });
    }

    // 尝试从缓存加载
    const cached = loadFromStorage(appToken);
    if (cached) {
      authState.value = cached;
      console.log('[useChatAuth] 使用缓存的 Session Token');
      return true;
    }

    // 调用后端获取新 Token
    isInitializing.value = true;
    initError.value = null;

    try {
      const { data, error } = await anonymousAuth(appToken);

      if (error || !data) {
        initError.value = error?.message || '认证失败';
        console.error('[useChatAuth] 匿名认证失败:', initError.value);
        return false;
      }

      // 保存认证状态
      const newState: ChatAuthState = {
        sessionToken: data.sessionToken,
        userId: data.userId,
        appId: data.appId,
        appToken,
        expireTime: data.expireTime
      };

      authState.value = newState;
      saveToStorage(newState);

      console.log('[useChatAuth] 匿名认证成功, userId:', data.userId);
      return true;
    } catch (e) {
      initError.value = e instanceof Error ? e.message : '网络错误';
      console.error('[useChatAuth] 认证异常:', e);
      return false;
    } finally {
      isInitializing.value = false;
    }
  }

  /**
   * 清除认证状态
   */
  function clearAuth(): void {
    authState.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    isAuthenticated,
    isInitializing,
    initError,
    sessionToken,
    userId,
    initAuth,
    clearAuth
  };
}
