/**
 * AI 模型供应商管理 API (Admin)
 * @author Mahone
 * @date 2026-02-11
 */

import { request } from '@/service/request';

/**
 * 获取供应商列表
 */
export function fetchProviderList(params?: any) {
  return request<Api.AI.Admin.ModelProvider[]>({
    url: '/ai/provider/list',
    method: 'get',
    params
  });
}

/**
 * 获取供应商详情
 */
export function fetchProviderDetail(providerId: CommonType.IdType) {
  return request<Api.AI.Admin.ModelProvider>({
    url: `/ai/provider/${providerId}`,
    method: 'get'
  });
}

/**
 * 更新供应商
 */
export function updateProvider(data: Partial<Api.AI.Admin.ModelProvider>) {
  return request({
    url: '/ai/provider',
    method: 'put',
    data
  });
}
