import { request } from '@/service/request';

const BASE_URL = '/workflow/connection-rule';

/** 分页查询规则列表 */
export function fetchConnectionRuleList(params?: Api.AI.ConnectionRule.QueryParams) {
  return request<Api.AI.ConnectionRule.RuleList>({
    url: `${BASE_URL}/list`,
    method: 'get',
    params
  });
}

/** 查询单条规则 */
export function fetchConnectionRuleById(ruleId: CommonType.IdType) {
  return request<Api.AI.ConnectionRule.Rule>({
    url: `${BASE_URL}/${ruleId}`,
    method: 'get'
  });
}

/** 新增规则 */
export function addConnectionRule(data: Api.AI.ConnectionRule.SaveBo) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  });
}

/** 编辑规则 */
export function editConnectionRule(data: Api.AI.ConnectionRule.SaveBo) {
  return request({
    url: BASE_URL,
    method: 'put',
    data
  });
}

/** 删除规则（支持批量） */
export function deleteConnectionRules(ruleIds: CommonType.IdType[]) {
  return request({
    url: `${BASE_URL}/${ruleIds.join(',')}`,
    method: 'delete'
  });
}

/** 启用/停用规则 */
export function changeConnectionRuleStatus(data: { ruleId: CommonType.IdType; isEnabled: string }) {
  return request({
    url: `${BASE_URL}/changeStatus`,
    method: 'put',
    data
  });
}

/** 矩阵视图批量保存 */
export function saveConnectionRuleMatrix(data: Api.AI.ConnectionRule.MatrixSaveBo) {
  return request({
    url: `${BASE_URL}/matrix/save`,
    method: 'post',
    data
  });
}

/** 矩阵视图入边保存 */
export function saveConnectionRuleInbound(data: Api.AI.ConnectionRule.InboundSaveBo) {
  return request({
    url: `${BASE_URL}/matrix/inbound-save`,
    method: 'post',
    data
  });
}

/** 查询当前连接模式 */
export function fetchConnectionMode() {
  return request<Api.AI.ConnectionRule.ConnectionMode>({
    url: `${BASE_URL}/mode`,
    method: 'get'
  });
}

/** 切换连接模式 */
export function switchConnectionMode(mode: 'whitelist' | 'blacklist') {
  return request({
    url: `${BASE_URL}/mode`,
    method: 'put',
    params: { mode }
  });
}

/** 获取所有启用的节点类型（供下拉） */
export function fetchEnabledNodeTypes() {
  return request<Api.AI.ConnectionRule.NodeType[]>({
    url: `${BASE_URL}/node-types`,
    method: 'get'
  });
}
