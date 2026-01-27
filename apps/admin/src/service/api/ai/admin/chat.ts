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
export function fetchAdminChatHistory(sessionId: CommonType.IdType) {
  return request<Api.AI.Chat.Message[]>({
    url: `${ADMIN_CHAT_BASE}/history/${sessionId}`,
    method: 'get'
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
