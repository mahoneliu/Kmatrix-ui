/**
 * MCP Server 管理 API
 * @author Mahone
 * @date 2026-03-15
 */

import { request } from '@/service/request';

/**
 * 查询 MCP Server 列表
 */
export function fetchMcpServerList(params?: Api.Ai.McpServerQuery) {
  return request<Api.Ai.McpServerVo[]>({
    url: '/ai/mcp-server/list',
    method: 'get',
    params
  });
}

/**
 * 获取 MCP Server 详情
 */
export function fetchMcpServerDetail(serverId: CommonType.IdType) {
  return request<Api.Ai.McpServerVo>({
    url: `/ai/mcp-server/${serverId}`,
    method: 'get'
  });
}

/**
 * 新增 MCP Server
 */
export function addMcpServer(data: Api.Ai.McpServerBo) {
  return request({
    url: '/ai/mcp-server',
    method: 'post',
    data
  });
}

/**
 * 更新 MCP Server
 */
export function updateMcpServer(data: Api.Ai.McpServerBo) {
  return request({
    url: '/ai/mcp-server',
    method: 'put',
    data
  });
}

/**
 * 删除 MCP Server
 */
export function deleteMcpServer(serverIds: CommonType.IdType[]) {
  return request({
    url: `/ai/mcp-server/${serverIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 查询 MCP Server 提供的资源列表
 */
export function fetchMcpServerResources(serverId: CommonType.IdType) {
  return request<any[]>({
    url: `/ai/mcp-server/${serverId}/resources`,
    method: 'get'
  });
}
