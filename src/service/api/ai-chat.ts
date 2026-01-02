import { request } from '../request';

/** 聊天API基础路径 */
const CHAT_API_BASE = '/ai/chat';

/**
 * 普通对话(非流式)
 */
export function sendMessage(data: Api.AI.Chat.SendRequest) {
  return request<string>({
    url: `${CHAT_API_BASE}/send`,
    method: 'post',
    data
  });
}

/**
 * 获取会话历史消息
 */
export function fetchChatHistory(sessionId: CommonType.IdType) {
  return request<Api.AI.Chat.Message[]>({
    url: `${CHAT_API_BASE}/history/${sessionId}`,
    method: 'get'
  });
}

/**
 * 清除会话历史
 */
export function clearChatHistory(sessionId: CommonType.IdType) {
  return request<any>({
    url: `${CHAT_API_BASE}/clear/${sessionId}`,
    method: 'delete'
  });
}

/**
 * 清除应用下所有会话
 */
export function clearAppHistory(appId: CommonType.IdType) {
  return request<any>({
    url: `${CHAT_API_BASE}/clear-app/${appId}`,
    method: 'delete'
  });
}

/**
 * 获取会话列表
 */
export function fetchSessionList(appId: CommonType.IdType) {
  return request<Api.AI.Chat.Session[]>({
    url: `${CHAT_API_BASE}/sessions/${appId}`,
    method: 'get'
  });
}

/**
 * 构建SSE流式对话URL
 */
export function getStreamChatUrl(baseUrl: string, token: string, clientId: string) {
  return `${baseUrl}${CHAT_API_BASE}/stream?Authorization=Bearer ${token}&clientid=${clientId}`;
}

/**
 * 更新会话标题
 */
export function updateSessionTitle(sessionId: CommonType.IdType, title: string) {
  return request<any>({
    url: `${CHAT_API_BASE}/session/${sessionId}/title`,
    method: 'put',
    data: { title }
  });
}
