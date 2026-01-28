/**
 * 知识库管理 API
 * @author Mahone
 * @date 2026-01-28
 */

import { request } from '@/service/request';

/**
 * 获取知识库列表
 */
export function fetchKnowledgeBaseList(params?: Api.AI.KB.KnowledgeBaseSearchParams) {
  return request<App.Service.Response<Api.AI.KB.KnowledgeBase>>({
    url: '/ai/kb/list',
    method: 'get',
    params
  });
}

/**
 * 获取所有知识库 (下拉选择用)
 */
export function fetchAllKnowledgeBases() {
  return request<Api.AI.KB.KnowledgeBase[]>({
    url: '/ai/kb/listAll',
    method: 'get'
  });
}

/**
 * 获取知识库详情
 */
export function fetchKnowledgeBaseDetail(id: CommonType.IdType) {
  return request<Api.AI.KB.KnowledgeBase>({
    url: `/ai/kb/${id}`,
    method: 'get'
  });
}

/**
 * 新增知识库
 */
export function addKnowledgeBase(data: Partial<Api.AI.KB.KnowledgeBase>) {
  return request<CommonType.IdType>({
    url: '/ai/kb',
    method: 'post',
    data
  });
}

/**
 * 更新知识库
 */
export function updateKnowledgeBase(data: Partial<Api.AI.KB.KnowledgeBase>) {
  return request<any>({
    url: '/ai/kb',
    method: 'put',
    data
  });
}

/**
 * 删除知识库
 */
export function deleteKnowledgeBase(ids: CommonType.IdType[]) {
  return request<any>({
    url: `/ai/kb/${ids.join(',')}`,
    method: 'delete'
  });
}

// ========== 数据集 API ==========

/**
 * 获取数据集列表
 */
export function fetchDatasetList(params?: Api.AI.KB.DatasetSearchParams) {
  return request<App.Service.Response<Api.AI.KB.Dataset>>({
    url: '/ai/dataset/list',
    method: 'get',
    params
  });
}

/**
 * 获取知识库下的数据集
 */
export function fetchDatasetsByKbId(kbId: CommonType.IdType) {
  return request<Api.AI.KB.Dataset[]>({
    url: `/ai/dataset/listByKb/${kbId}`,
    method: 'get'
  });
}

/**
 * 获取数据集详情
 */
export function fetchDatasetDetail(id: CommonType.IdType) {
  return request<Api.AI.KB.Dataset>({
    url: `/ai/dataset/${id}`,
    method: 'get'
  });
}

/**
 * 新增数据集
 */
export function addDataset(data: Partial<Api.AI.KB.Dataset>) {
  return request<CommonType.IdType>({
    url: '/ai/dataset',
    method: 'post',
    data
  });
}

/**
 * 更新数据集
 */
export function updateDataset(data: Partial<Api.AI.KB.Dataset>) {
  return request<any>({
    url: '/ai/dataset',
    method: 'put',
    data
  });
}

/**
 * 删除数据集
 */
export function deleteDataset(ids: CommonType.IdType[]) {
  return request<any>({
    url: `/ai/dataset/${ids.join(',')}`,
    method: 'delete'
  });
}

// ========== 文档 API ==========

/**
 * 上传文档
 */
export function uploadDocument(datasetId: CommonType.IdType, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('datasetId', datasetId.toString());

  return request<Api.AI.KB.Document>({
    url: '/ai/document/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 批量上传文档
 */
export function uploadDocuments(datasetId: CommonType.IdType, files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('datasetId', datasetId.toString());

  return request<Api.AI.KB.Document[]>({
    url: '/ai/document/uploadBatch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取数据集下的文档列表
 */
export function fetchDocumentsByDataset(datasetId: CommonType.IdType) {
  return request<Api.AI.KB.Document[]>({
    url: `/ai/document/listByDataset/${datasetId}`,
    method: 'get'
  });
}

/**
 * 获取文档详情
 */
export function fetchDocumentDetail(id: CommonType.IdType) {
  return request<Api.AI.KB.Document>({
    url: `/ai/document/${id}`,
    method: 'get'
  });
}

/**
 * 删除文档
 */
export function deleteDocument(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/document/${id}`,
    method: 'delete'
  });
}

/**
 * 重新处理文档
 */
export function reprocessDocument(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/document/reprocess/${id}`,
    method: 'post'
  });
}

// ========== 检索 API ==========

/**
 * 知识库检索
 */
export function searchKnowledge(data: Api.AI.KB.RetrievalRequest) {
  return request<Api.AI.KB.RetrievalResult[]>({
    url: '/ai/retrieval/search',
    method: 'post',
    data
  });
}

/**
 * 简单查询
 */
export function queryKnowledge(query: string, kbId?: CommonType.IdType, topK?: number) {
  return request<Api.AI.KB.RetrievalResult[]>({
    url: '/ai/retrieval/query',
    method: 'get',
    params: { query, kbId, topK }
  });
}
