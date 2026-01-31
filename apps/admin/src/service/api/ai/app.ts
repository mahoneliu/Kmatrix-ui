/**
 * AI 应用管理 API (Admin)
 * @author Mahone
 * @date 2026-01-04
 */

import { request } from '@/service/request';

/**
 * 获取应用列表
 */
export function fetchAppList(params?: Api.AI.Admin.AppSearchParams) {
  return request<App.Service.Response<Api.AI.Admin.App>>({
    url: '/ai/app/list',
    method: 'get',
    params
  });
}

/**
 * 获取应用详情
 */
export function fetchAppDetail(appId: CommonType.IdType) {
  return request<Api.AI.Admin.App>({
    url: `/ai/app/${appId}`,
    method: 'get'
  });
}

/**
 * 新增应用
 */
export function addApp(data: Partial<Api.AI.Admin.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'post',
    data
  });
}

/**
 * 更新应用
 */
export function updateApp(data: Partial<Api.AI.Admin.App>) {
  return request<any>({
    url: '/ai/app',
    method: 'put',
    data
  });
}

/**
 * 删除应用
 */
export function deleteApp(appIds: CommonType.IdType[]) {
  return request<any>({
    url: `/ai/app/${appIds.join(',')}`,
    method: 'delete'
  });
}

/**
 * 发布应用
 */
export function publishApp(appId: CommonType.IdType, remark?: string) {
  return request<any>({
    url: `/ai/app/publish/${appId}`,
    method: 'post',
    data: { remark }
  });
}

/**
 * 更新公开访问开关
 */
export function updatePublicAccess(appId: CommonType.IdType, publicAccess: '0' | '1') {
  return request<any>({
    url: `/ai/app/${appId}/public-access`,
    method: 'patch',
    data: { publicAccess }
  });
}

/**
 * 获取应用统计数据
 */
export function fetchAppStatistics(appId: CommonType.IdType, period: string = '7d') {
  return request<Api.AI.Admin.AppStatistics>({
    url: `/ai/app/${appId}/statistics`,
    method: 'get',
    params: { period }
  });
}
