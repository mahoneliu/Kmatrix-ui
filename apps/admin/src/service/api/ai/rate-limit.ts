import { request } from '../../request';

const BASE_URL = '/ai/admin/rate-limit';

/**
 * 获取系统默认限流配置
 * @returns JSON 字符串配置
 */
export function fetchGetSystemDefaultConfig() {
  return request<string>({
    url: `${BASE_URL}/system-default`,
    method: 'get'
  });
}

/**
 * 更新系统默认限流配置
 * @param data 限流配置结构对象
 */
export function fetchUpdateSystemDefaultConfig(data: Api.Ai.RateLimit.Config) {
  return request({
    url: `${BASE_URL}/system-default`,
    method: 'put',
    data
  });
}

/**
 * 分页查询用户列表与其限流配置
 * @param params 查询参数
 */
export function fetchGetUserLimitList(params?: Api.Ai.RateLimit.UserQueryParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Ai.RateLimit.UserInfo>>({
    url: `${BASE_URL}/users`,
    method: 'get',
    params
  });
}

/**
 * 更新用户的限流配置
 * @param userId 用户 ID
 * @param data 限流配置结构对象
 */
export function fetchUpdateUserConfig(userId: number, data: Api.Ai.RateLimit.Config) {
  return request({
    url: `${BASE_URL}/user/${userId}`,
    method: 'put',
    data
  });
}

/**
 * 清理用户的限流配置（恢复为系统默认）
 * @param userId 用户 ID
 */
export function fetchClearUserConfig(userId: number) {
  return request({
    url: `${BASE_URL}/user/${userId}`,
    method: 'delete'
  });
}
