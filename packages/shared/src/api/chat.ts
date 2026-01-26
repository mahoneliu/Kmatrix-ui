/**
 * AI 聊天 API (Chat)
 * @author Mahone
 * @date 2026-01-04
 */

import { request } from './request';

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
export function fetchChatHistory(sessionId: CommonType.IdType, token?: string) {
  return request<Api.AI.Chat.Message[]>({
    url: `${CHAT_API_BASE}/history/${sessionId}`,
    method: 'get',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

/**
 * 清除会话历史
 */
export function clearChatHistory(sessionId: CommonType.IdType, token?: string) {
  return request<any>({
    url: `${CHAT_API_BASE}/clear/${sessionId}`,
    method: 'delete',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

/**
 * 清除应用下所有会话
 */
export function clearAppHistory(appId: CommonType.IdType, token?: string) {
  return request<any>({
    url: `${CHAT_API_BASE}/clear-app/${appId}`,
    method: 'delete',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

/**
 * 获取会话列表
 */
export function fetchSessionList(appId: CommonType.IdType, token?: string) {
  return request<Api.AI.Chat.Session[]>({
    url: `${CHAT_API_BASE}/sessions/${appId}`,
    method: 'get',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
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
export function updateSessionTitle(sessionId: CommonType.IdType, title: string, token?: string) {
  return request<any>({
    url: `${CHAT_API_BASE}/session/${sessionId}/title`,
    method: 'put',
    data: { title },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}
/**
 * 根据 Token 获取应用信息 (免登录)
 */
export function fetchAppInfoByToken(token: string) {
  return request<Api.AI.Admin.App>({
    url: `/chat/app-info/${token}`,
    method: 'get'
  });
}

/**
 * 匿名用户认证响应
 */
export interface AnonymousAuthResponse {
  sessionToken: string;
  userId: number;
  appId: number;
  expireTime: number;
}

/**
 * 匿名用户认证
 * 使用 appToken 获取 Session Token
 */
export function anonymousAuth(appToken: string) {
  return request<AnonymousAuthResponse>({
    url: '/chat/anonymous-auth',
    method: 'post',
    data: { appToken }
  });
}
