/**
 * MCP 市场 API
 * @author Mahone
 * @date 2026-03-15
 */

import { request } from '@/service/request';

/** 查询 MCP 市场列表 */
export function fetchMcpMarketList(params?: { keyword?: string; category?: string }) {
  return request<Api.Ai.McpMarketItemVo[]>({
    url: '/ai/mcp-market/list',
    method: 'get',
    params
  });
}
