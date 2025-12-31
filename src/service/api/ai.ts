import { request } from '../request';

/**
 * AI 模型供应商 API
 */
export function fetchModelProviders(params?: any) {
  return request<Api.AI.ModelProvider[]>({
    url: '/ai/provider/list',
    method: 'get',
    params
  });
}

/**
 * AI 模型配置 API
 */
export function fetchModels(params?: any) {
  return request<Api.AI.Model[]>({
    url: '/ai/model/list',
    method: 'get',
    params
  });
}

export function fetchModelDetail(modelId: number) {
  return request<Api.AI.Model>({
    url: `/ai/model/${modelId}`,
    method: 'get'
  });
}

export function addModel(data: any) {
  return request({
    url: '/ai/model',
    method: 'post',
    data
  });
}

export function updateModel(data: any) {
  return request({
    url: '/ai/model',
    method: 'put',
    data
  });
}

export function deleteModels(modelIds: number[]) {
  return request({
    url: `/ai/model/${modelIds.join(',')}`,
    method: 'delete'
  });
}

export function testModelConnection(data: any) {
  return request<string>({
    url: '/ai/model/test-connection',
    method: 'post',
    data
  });
}
