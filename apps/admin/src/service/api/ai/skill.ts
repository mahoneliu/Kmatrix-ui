import { request } from '../../request';

const BASE_URL = '/ai/skill';

/**
 * 查询技能管理列表
 */
export function fetchGetSkillList(params?: Api.Ai.Skill.QueryParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Ai.Skill.Info>>({
    url: `${BASE_URL}/list`,
    method: 'get',
    params
  });
}

/**
 * 获取所有技能管理列表（不分页）
 */
export function fetchGetAllSkillList(params?: Pick<Api.Ai.Skill.Info, 'skillName' | 'status'>) {
  return request<Api.Ai.Skill.Info[]>({
    url: `${BASE_URL}/listAll`,
    method: 'get',
    params
  });
}

/**
 * 获取技能管理详细信息
 * @param skillId 技能ID
 */
export function fetchGetSkillInfo(skillId: string) {
  return request<Api.Ai.Skill.Info>({
    url: `${BASE_URL}/${skillId}`,
    method: 'get'
  });
}

/**
 * 新增技能管理
 * @param data 技能数据
 */
export function fetchAddSkill(data: Partial<Api.Ai.Skill.Info>) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  });
}

/**
 * 修改技能管理
 * @param data 技能数据
 */
export function fetchUpdateSkill(data: Partial<Api.Ai.Skill.Info>) {
  return request({
    url: BASE_URL,
    method: 'put',
    data
  });
}

/**
 * 删除技能管理
 * @param skillIds 技能ID列表 (逗号分隔)
 */
export function fetchDeleteSkill(skillIds: string) {
  return request({
    url: `${BASE_URL}/${skillIds}`,
    method: 'delete'
  });
}
