import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  messageId: string;
  requestId: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'completed' | 'aborted' | 'error';
  abortedAt?: Date;
  partialContent?: string;
}

/**
 * 可恢复会话接口
 */
export interface ResumableSession {
  sessionId: string;
  sessionName: string;
  abortReason: 'exception' | 'user_abort' | 'network_error';
  abortReasonDisplay: string;
  abortTimestamp: Date;
  lastMessageId: number;
  messageCount: number;
  exceptionType?: string;
  exceptionMessage?: string;
}

/**
 * Chat Store - 管理聊天相关的状态
 * 用于管理请求状态、中断控制、消息历史等
 */
export const useChatStore = defineStore('chat', () => {
  // ==================== 请求状态管理 ====================

  /** 请求状态: idle/processing/completed/aborted */
  const requestState = ref<'idle' | 'processing' | 'completed' | 'aborted'>('idle');

  /** 当前请求ID */
  const currentRequestId = ref<string | null>(null);

  /** AbortController 实例 */
  const abortController = ref<AbortController | null>(null);

  /** 已接收的流式内容 */
  const partialContent = ref<string>('');

  /** 消息列表 */
  const messages = ref<ChatMessage[]>([]);

  /** 输入框是否禁用 */
  const isInputDisabled = ref(false);

  // ==================== Session Resume 相关 ====================

  /** 可恢复的会话列表 */
  const resumableSessions = ref<ResumableSession[]>([]);

  /** 当前会话的中断原因 */
  const currentSessionAbortReason = ref<string | undefined>();

  /** 当前会话的中断时间 */
  const currentSessionAbortTimestamp = ref<Date | undefined>();

  /** 是否正在恢复会话 */
  const isResuming = ref(false);

  // ==================== 状态管理方法 ====================

  /**
   * 设置请求状态
   */
  function setRequestState(state: 'idle' | 'processing' | 'completed' | 'aborted') {
    requestState.value = state;
  }

  /**
   * 设置 AbortController
   */
  function setAbortController(controller: AbortController | null) {
    abortController.value = controller;
  }

  /**
   * 追加流式内容
   */
  function appendPartialContent(chunk: string) {
    partialContent.value += chunk;
  }

  /**
   * 中止当前请求
   */
  function abortCurrentRequest() {
    if (abortController.value) {
      abortController.value.abort();
    }
    requestState.value = 'aborted';
    isInputDisabled.value = false;
  }

  /**
   * 重置中断后的状态
   */
  function resetAfterAbort() {
    requestState.value = 'idle';
    currentRequestId.value = null;
    abortController.value = null;
    partialContent.value = '';
    isInputDisabled.value = false;
  }

  /**
   * 设置输入框禁用状态
   */
  function setInputDisabled(disabled: boolean) {
    isInputDisabled.value = disabled;
  }

  // ==================== 消息管理方法 ====================

  /**
   * 添加消息
   */
  function addMessage(message: ChatMessage) {
    messages.value.push(message);
  }

  /**
   * 更新消息状态
   */
  function updateMessageStatus(messageId: string, status: 'completed' | 'aborted' | 'error') {
    const message = messages.value.find(m => m.messageId === messageId);
    if (message) {
      message.status = status;
      if (status === 'aborted') {
        message.abortedAt = new Date();
      }
    }
  }

  /**
   * 获取所有消息
   */
  function getMessages() {
    return messages.value;
  }

  /**
   * 清空消息列表
   */
  function clearMessages() {
    messages.value = [];
  }

  // ==================== Session Resume 方法 ====================

  /**
   * 获取可恢复的会话列表
   */
  async function fetchResumableSessions() {
    try {
      // 这里会由 API 服务调用
      // const response = await getResumableSessions();
      // resumableSessions.value = response.data;
    } catch {
      // Failed to fetch resumable sessions
    }
  }

  /**
   * 恢复指定的会话
   */
  async function resumeSession(_sessionId: string) {
    try {
      isResuming.value = true;
      // 这里会由 API 服务调用
      // const response = await resumeSessionApi(sessionId);
      // 恢复消息历史等
    } catch {
      // Failed to resume session
    } finally {
      isResuming.value = false;
    }
  }

  /**
   * 清除中断状态
   */
  async function clearAbortStatus(sessionId: string) {
    try {
      // 这里会由 API 服务调用
      // await clearAbortStatusApi(sessionId);
      resumableSessions.value = resumableSessions.value.filter(s => s.sessionId !== sessionId);
    } catch {
      // Failed to clear abort status
    }
  }

  /**
   * 设置可恢复的会话列表
   */
  function setResumableSessions(sessions: ResumableSession[]) {
    resumableSessions.value = sessions;
  }

  /**
   * 设置是否正在恢复
   */
  function setIsResuming(resuming: boolean) {
    isResuming.value = resuming;
  }

  /**
   * 设置当前会话的中断信息
   */
  function setSessionAbortInfo(reason?: string, timestamp?: Date) {
    currentSessionAbortReason.value = reason;
    currentSessionAbortTimestamp.value = timestamp;
  }

  /**
   * 清除当前会话的中断信息
   */
  function clearSessionAbortInfo() {
    currentSessionAbortReason.value = undefined;
    currentSessionAbortTimestamp.value = undefined;
  }

  // ==================== 计算属性 ====================

  /**
   * 是否有可恢复的会话
   */
  const hasResumableSessions = computed(() => resumableSessions.value.length > 0);

  /**
   * 是否正在处理请求
   */
  const isProcessing = computed(() => requestState.value === 'processing');

  return {
    // 状态
    requestState,
    currentRequestId,
    abortController,
    partialContent,
    messages,
    isInputDisabled,
    resumableSessions,
    currentSessionAbortReason,
    currentSessionAbortTimestamp,
    isResuming,

    // 方法
    setRequestState,
    setAbortController,
    appendPartialContent,
    abortCurrentRequest,
    resetAfterAbort,
    setInputDisabled,
    addMessage,
    updateMessageStatus,
    getMessages,
    clearMessages,
    fetchResumableSessions,
    resumeSession,
    clearAbortStatus,
    setResumableSessions,
    setIsResuming,
    setSessionAbortInfo,
    clearSessionAbortInfo,

    // 计算属性
    hasResumableSessions,
    isProcessing
  };
});
