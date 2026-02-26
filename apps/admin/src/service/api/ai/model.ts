/**
 * AI 模型管理 API (Admin)
 * @author Mahone
 * @date 2026-01-04
 */

import { request } from '@/service/request';

/** 模型列表查询参数 */
export interface ModelListParams {
  modelName?: string;
  modelType?: '1' | '2'; // 1: 语言模型, 2: 向量模型
  status?: '0' | '1';
  pageNo?: number;
  pageSize?: number;
}

/**
 * 获取模型列表
 */
export function fetchModelList(params?: ModelListParams) {
  return request<Api.AI.Admin.Model[]>({
    url: '/ai/model/list',
    method: 'get',
    params
  });
}

/**
 * 获取模型详情
 */
export function fetchModelDetail(modelId: CommonType.IdType) {
  return request<Api.AI.Admin.Model>({
    url: `/ai/model/${modelId}`,
    method: 'get'
  });
}

/**
 * 创建模型
 */
export function createModel(data: Partial<Api.AI.Admin.Model>) {
  return request({
    url: '/ai/model',
    method: 'post',
    data
  });
}

/**
 * 更新模型
 */
export function updateModel(data: Partial<Api.AI.Admin.Model>) {
  return request({
    url: '/ai/model',
    method: 'put',
    data
  });
}

/**
 * 删除模型
 */
export function deleteModel(modelId: CommonType.IdType) {
  return request({
    url: `/ai/model/${modelId}`,
    method: 'delete'
  });
}

/**
 * 获取模型供应商列表
 */
export function fetchModelProviders(params?: any) {
  return request<Api.AI.Admin.ModelProvider[]>({
    url: '/ai/provider/list',
    method: 'get',
    params
  });
}

/**
 * 测试模型连接
 */
export function testModelConnection(data: any) {
  return request<string>({
    url: '/ai/model/test-connection',
    method: 'post',
    data
  });
}

/**
 * 复制模型
 */
export function copyModel(modelId: CommonType.IdType) {
  return request<CommonType.IdType>({
    url: `/ai/model/copy/${modelId}`,
    method: 'post'
  });
}

/** 测试模型对话 API URL */
export const TestModelChatUrl = '/ai/model/chat/test/stream';
