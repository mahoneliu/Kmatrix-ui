/**
 * App Token API
 * @author Mahone
 * @date 2026-01-26
 */

import { request } from '@/service/request';

const TOKEN_API_BASE = '/ai/app-token';

/**
 * 获取应用的Token列表
 */
export function fetchAppTokenList(appId: CommonType.IdType) {
  return request<any[]>({
    url: `${TOKEN_API_BASE}/list/${appId}`,
    method: 'get'
  });
}

/**
 * 生成新Token
 */
export function generateAppToken(data: { appId: CommonType.IdType; tokenName: string; allowedOrigins?: string }) {
  return request<any>({
    url: TOKEN_API_BASE,
    method: 'post',
    data
  });
}

/**
 * 更新Token
 */
export function updateAppToken(data: {
  tokenId: CommonType.IdType;
  tokenName?: string;
  allowedOrigins?: string;
  status?: string;
}) {
  return request<any>({
    url: TOKEN_API_BASE,
    method: 'put',
    data
  });
}

/**
 * 删除Token
 */
export function deleteAppToken(tokenId: CommonType.IdType) {
  return request<any>({
    url: `${TOKEN_API_BASE}/${tokenId}`,
    method: 'delete'
  });
}

/**
 * 刷新Token（重新生成token值）
 */
export function refreshAppToken(tokenId: CommonType.IdType) {
  return request<any>({
    url: `${TOKEN_API_BASE}/refresh/${tokenId}`,
    method: 'put'
  });
}
