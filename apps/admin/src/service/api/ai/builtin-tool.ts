/**
 * 内置 Python 工具管理 API
 * @author Mahone
 * @date 2026-03-15
 */

import { request } from '@/service/request';

/**
 * 查询内置工具列表
 */
export function fetchBuiltinToolList(params?: Api.Ai.BuiltinToolQuery) {
  return request<Api.Ai.BuiltinToolVo[]>({
    url: '/ai/builtin-tool/list',
    method: 'get',
    params
  });
}

/**
 * 获取内置工具详情
 */
export function fetchBuiltinToolDetail(toolId: CommonType.IdType) {
  return request<Api.Ai.BuiltinToolVo>({
    url: `/ai/builtin-tool/${toolId}`,
    method: 'get'
  });
}

/**
 * 新增内置工具
 */
export function addBuiltinTool(data: Api.Ai.BuiltinToolBo) {
  return request({
    url: '/ai/builtin-tool',
    method: 'post',
    data
  });
}

/**
 * 更新内置工具
 */
export function updateBuiltinTool(data: Api.Ai.BuiltinToolBo) {
  return request({
    url: '/ai/builtin-tool',
    method: 'put',
    data
  });
}

/**
 * 删除内置工具
 */
export function deleteBuiltinTool(toolIds: CommonType.IdType[]) {
  return request({
    url: `/ai/builtin-tool/${toolIds.join(',')}`,
    method: 'delete'
  });
}
