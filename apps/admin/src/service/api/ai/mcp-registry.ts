/**
 * MCP 注册源集成 API
 * @author Mahone
 */

import { request } from '@/service/request';

// ============ 注册源管理 ============

/** 列出所有注册源配置 */
export function fetchRegistrySources() {
  return request<Api.Ai.McpRegistrySourceVo[]>({
    url: '/km/mcp/registry/sources',
    method: 'get'
  });
}

/** 更新注册源配置（启用/禁用、同步间隔等） */
export function updateRegistrySource(id: CommonType.IdType, data: Api.Ai.McpRegistrySourceUpdateParams) {
  return request({
    url: `/km/mcp/registry/sources/${id}`,
    method: 'put',
    data
  });
}

/** 删除注册源及其缓存条目 */
export function deleteRegistrySource(id: CommonType.IdType) {
  return request({
    url: `/km/mcp/registry/sources/${id}`,
    method: 'delete'
  });
}

/** 手动触发指定注册源的全量同步 */
export function syncRegistrySource(id: CommonType.IdType) {
  return request<Api.Ai.SyncResultVo>({
    url: `/km/mcp/registry/sources/${id}/sync`,
    method: 'post'
  });
}

// ============ 注册源条目搜索 ============

/** 搜索注册源条目（分页） */
export function searchRegistryEntries(params: Api.Ai.McpRegistrySearchParams) {
  return request<{ rows: Api.Ai.McpRegistryEntryVo[]; total: number }>({
    url: '/km/mcp/registry/entries',
    method: 'get',
    params
  });
}

/** 获取注册源条目详情 */
export function fetchRegistryEntryDetail(id: CommonType.IdType) {
  return request<Api.Ai.McpRegistryEntryVo>({
    url: `/km/mcp/registry/entries/${id}`,
    method: 'get'
  });
}

/** 从注册源条目导入为 MCP Server 配置 */
export function importRegistryEntry(id: CommonType.IdType, data: Api.Ai.McpImportParams) {
  return request<{ serverId: CommonType.IdType; serverName: string; action: string }>({
    url: `/km/mcp/registry/entries/${id}/import`,
    method: 'post',
    data
  });
}

// ============ 手工添加 ============

/** 手工添加 MCP Server */
export function addMcpServerManual(data: Api.Ai.McpServerManualParams) {
  return request<{ serverId: CommonType.IdType; serverName: string; action: string }>({
    url: '/km/mcp/server/manual',
    method: 'post',
    data
  });
}
