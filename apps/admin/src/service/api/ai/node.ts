import { request } from '@/service/request';

/**
 * 获取所有节点类型定义
 */
export function fetchNodeDefinitions() {
  return request<Api.AI.Workflow.KmNodeDefinitionBo[]>({
    url: '/ai/workflow/node/definitions',
    method: 'get'
  });
}

/**
 * 获取所有节点连接规则
 */
export function fetchConnectionRules() {
  return request<Record<string, string[]>>({
    url: '/ai/workflow/node/connection/rules',
    method: 'get'
  });
}

/**
 * 更新所有节点定义
 */
export function updateNodeDefinitions(data: Api.AI.Workflow.KmNodeDefinitionBo[]) {
  return request({
    url: '/ai/workflow/node/definitions',
    method: 'put',
    data
  });
}

/**
 * 验证节点定义
 */
export function validateNodeDefinitions(data: Api.AI.Workflow.KmNodeDefinitionBo[]) {
  return request({
    url: '/ai/workflow/node/definitions/validate',
    method: 'post',
    data
  });
}

/**
 * 导出节点定义
 */
export function exportNodeDefinitions() {
  return request<string>({
    url: '/ai/workflow/node/definitions/export',
    method: 'get'
  });
}

/**
 * 导入节点定义
 */
export function importNodeDefinitions(json: string) {
  return request({
    url: '/ai/workflow/node/definitions/import',
    method: 'post',
    data: json,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// ========== 节点定义管理 CRUD API ==========

/**
 * 分页查询节点定义列表
 */
export function fetchNodeDefinitionList(params?: Api.AI.Workflow.NodeDefinitionSearchParams) {
  return request<Api.AI.Workflow.NodeDefinitionList>({
    url: '/ai/workflow/node/definition/list',
    method: 'get',
    params
  });
}

/**
 * 获取节点定义详情
 */
export function fetchNodeDefinitionDetail(nodeDefId: CommonType.IdType) {
  return request<Api.AI.Workflow.KmNodeDefinitionBo>({
    url: `/ai/workflow/node/definition/${nodeDefId}`,
    method: 'get'
  });
}

/**
 * 新增节点定义
 */
export function addNodeDefinition(data: Api.AI.Workflow.KmNodeDefinitionBo) {
  return request<CommonType.IdType>({
    url: '/ai/workflow/node/definition',
    method: 'post',
    data
  });
}

/**
 * 复制节点定义
 */
export function copyNodeDefinition(nodeDefId: CommonType.IdType, newNodeType: string) {
  return request<CommonType.IdType>({
    url: `/ai/workflow/node/definition/copy/${nodeDefId}`,
    method: 'post',
    params: { newNodeType }
  });
}

/**
 * 更新节点定义
 */
export function updateNodeDefinition(data: Api.AI.Workflow.KmNodeDefinitionBo) {
  return request({
    url: '/ai/workflow/node/definition',
    method: 'put',
    data
  });
}

/**
 * 删除节点定义（支持批量）
 */
export function deleteNodeDefinitions(nodeDefIds: CommonType.IdType[]) {
  return request({
    url: `/ai/workflow/node/definition/${nodeDefIds.join(',')}`,
    method: 'delete'
  });
}
