/**
 * 管理端 AI 聊天 API
 * @author Mahone
 */

import { request } from '@/service/request';

/** 管理端聊天接口基础路径 */
const ADMIN_CHAT_BASE = '/ai/admin/chat';

/**
 * 普通对话(非流式)
 */
export function sendAdminMessage(data: Api.AI.Chat.SendRequest) {
  return request<string>({
    url: `${ADMIN_CHAT_BASE}/send`,
    method: 'post',
    data
  });
}

/**
 * 获取会话历史消息
 */
export function fetchAdminChatHistory(sessionId: CommonType.IdType, includeExecutions?: boolean) {
  return request<Api.AI.Chat.Message[]>({
    url: `${ADMIN_CHAT_BASE}/history/${sessionId}`,
    method: 'get',
    params: { includeExecutions }
  });
}

/**
 * 清除会话历史
 */
export function clearAdminChatHistory(sessionId: CommonType.IdType) {
  return request<any>({
    url: `${ADMIN_CHAT_BASE}/clear/${sessionId}`,
    method: 'delete'
  });
}

/**
 * 清除应用下所有会话
 */
export function clearAdminAppHistory(appId: CommonType.IdType) {
  return request<any>({
    url: `${ADMIN_CHAT_BASE}/clear-app/${appId}`,
    method: 'delete'
  });
}

/**
 * 获取会话列表
 */
export function fetchAdminSessionList(appId: CommonType.IdType) {
  return request<Api.AI.Chat.Session[]>({
    url: `${ADMIN_CHAT_BASE}/sessions/${appId}`,
    method: 'get'
  });
}

/**
 * 获取可用技能列表
 */
export function fetchAdminAvailableSkills() {
  return request<any[]>({
    url: `${ADMIN_CHAT_BASE}/skills`,
    method: 'get'
  });
}

/**
 * 更新会话标题
 */
export function updateAdminSessionTitle(sessionId: CommonType.IdType, title: string) {
  return request<any>({
    url: `${ADMIN_CHAT_BASE}/session/${sessionId}/title`,
    method: 'put',
    data: { title }
  });
}

/**
 * 查询执行详情
 */
export function fetchAdminExecutionDetails(sessionId: CommonType.IdType) {
  return request<any[]>({
    url: `${ADMIN_CHAT_BASE}/execution/session/${sessionId}`,
    method: 'get'
  });
}

/**
 * 提交聊天消息评价反馈
 */
export function submitAdminChatFeedback(messageId: string, status: number) {
  return request<boolean>({
    url: `${ADMIN_CHAT_BASE}/feedback`,
    method: 'post',
    data: { messageId, feedbackStatus: status }
  });
}

/**
 * 中止请求
 */
export function abortRequest(requestId: string) {
  return request<{
    requestId: string;
    status: string;
    partialContent: string;
    abortedAt: string;
  }>({
    url: `${ADMIN_CHAT_BASE}/abort`,
    method: 'post',
    data: { requestId }
  });
}

/**
 * 获取可恢复的会话列表
 */
export function getResumableSessions(appId?: CommonType.IdType) {
  return request<any[]>({
    url: `${ADMIN_CHAT_BASE}/sessions/resumable`,
    method: 'get',
    params: appId ? { appId } : undefined
  });
}

/**
 * 恢复会话
 */
export function resumeSessionApi(sessionId: CommonType.IdType, resumeToken?: string) {
  return request<{
    sessionId: string;
    messages: Api.AI.Chat.Message[];
    resumedAt: string;
  }>({
    url: `${ADMIN_CHAT_BASE}/sessions/resume`,
    method: 'post',
    data: { sessionId, resumeToken }
  });
}

/**
 * 清除中断状态
 */
export function clearAbortStatusApi(sessionId: CommonType.IdType) {
  return request<any>({
    url: `${ADMIN_CHAT_BASE}/sessions/clear-abort`,
    method: 'post',
    data: { sessionId }
  });
}

/**
 * 发送消息（支持流式响应）请求参数
 */
export interface StreamRequestOptions {
  sessionId: CommonType.IdType;
  content: string;
  requestId: string;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
}

/**
 * 解析并处理单条 SSE 数据
 */
function handleSSELine(line: string, onChunk?: (chunk: string) => void) {
  if (!line.startsWith('data: ')) return;

  const data = line.slice(6);
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    if (parsed.type === 'chunk' && parsed.content) {
      onChunk?.(parsed.content);
    }
  } catch (e) {
    console.error('Failed to parse SSE data:', e);
  }
}

/**
 * 发送消息（支持流式响应）
 */
export async function sendMessageWithStream(options: StreamRequestOptions) {
  const { sessionId, content, requestId, signal, onChunk } = options;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}${ADMIN_CHAT_BASE}/send`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, content, requestId }),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      lines.forEach(line => handleSSELine(line, onChunk));
    }

    if (buffer) {
      handleSSELine(buffer, onChunk);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Request was aborted');
      return { success: false, aborted: true };
    }
    throw error;
  }
}
