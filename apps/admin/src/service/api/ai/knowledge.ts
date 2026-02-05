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
 * 获取知识库统计信息
 */
export function fetchKnowledgeBaseStatistics() {
  return request<Api.AI.KB.Statistics>({
    url: '/ai/kb/statistics',
    method: 'get'
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
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
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
      'Content-Type': 'multipart/form-data',
      repeatSubmit: false
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

/**
 * 创建在线文档
 */
export function createOnlineDocument(datasetId: CommonType.IdType, title: string, content: string) {
  const formData = new FormData();
  formData.append('datasetId', datasetId.toString());
  formData.append('title', title);
  formData.append('content', content);

  return request<Api.AI.KB.Document>({
    url: '/ai/document/createOnlineDoc',
    method: 'post',
    data: formData
  });
}

/**
 * 创建网页链接文档
 */
export function createWebLinkDocument(datasetId: CommonType.IdType, url: string) {
  const formData = new FormData();
  formData.append('datasetId', datasetId.toString());
  formData.append('url', url);

  return request<Api.AI.KB.Document>({
    url: '/ai/document/createWebLink',
    method: 'post',
    data: formData
  });
}

/**
 * 分页查询文档列表
 */
export function fetchDocumentPage(params: Api.AI.KB.DocumentQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.AI.KB.Document>>({
    url: '/ai/document/list',
    method: 'get',
    params
  });
}

/**
 * 启用文档
 */
export function enableDocument(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/document/enable/${id}`,
    method: 'put'
  });
}

/**
 * 禁用文档
 */
export function disableDocument(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/document/disable/${id}`,
    method: 'put'
  });
}

/**
 * 批量启用文档
 */
export function batchEnableDocuments(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/document/batchEnable',
    method: 'put',
    data: ids
  });
}

/**
 * 批量禁用文档
 */
export function batchDisableDocuments(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/document/batchDisable',
    method: 'put',
    data: ids
  });
}

/**
 * 批量删除文档
 */
export function batchDeleteDocuments(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/document/batchDelete',
    method: 'delete',
    data: ids
  });
}

/**
 * 更新文档信息
 */
export function updateDocument(id: CommonType.IdType, data: Partial<Api.AI.KB.Document>) {
  return request<any>({
    url: `/ai/document/${id}`,
    method: 'put',
    params: {
      originalFilename: data.originalFilename
    }
  });
}

/**
 * 批量向量化生成
 */
export function batchEmbedding(
  documentIds: CommonType.IdType[],
  option: 'UNEMBEDDED_ONLY' | 'ALL' = 'UNEMBEDDED_ONLY'
) {
  return request<any>({
    url: '/ai/document/batchEmbedding',
    method: 'post',
    data: { documentIds, option }
  });
}

/**
 * 批量问题生成
 */
export function batchGenerateQuestionsByDocuments(
  documentIds: CommonType.IdType[],
  params?: {
    modelId?: CommonType.IdType;
    prompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  return request<any>({
    url: '/ai/document/batchGenerateQuestions',
    method: 'post',
    data: { documentIds, ...params }
  });
}

/**
 * 单个文档向量化
 */
export function embeddingDocument(id: CommonType.IdType, option: 'UNEMBEDDED_ONLY' | 'ALL' = 'UNEMBEDDED_ONLY') {
  return request<any>({
    url: `/ai/document/embedding/${id}`,
    method: 'post',
    params: { option }
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

// ========== 切片 API ==========

/**
 * 获取文档切片列表
 */
export function fetchChunksByDocumentId(documentId: CommonType.IdType) {
  return request<Api.AI.KB.DocumentChunk[]>({
    url: `/ai/chunk/listByDocument/${documentId}`,
    method: 'get'
  });
}

/**
 * 分页获取文档切片列表
 */
export function fetchChunksByPage(params: Api.AI.KB.ChunkPageQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.AI.KB.DocumentChunk>>({
    url: '/ai/chunk/list',
    method: 'get',
    params
  });
}

/**
 * 获取切片详情
 */
export function fetchChunkDetail(id: CommonType.IdType) {
  return request<Api.AI.KB.DocumentChunk>({
    url: `/ai/chunk/${id}`,
    method: 'get'
  });
}

/**
 * 更新切片内容
 */
export function updateChunk(data: Partial<Api.AI.KB.DocumentChunk>) {
  return request<any>({
    url: '/ai/chunk',
    method: 'put',
    data
  });
}

/**
 * 删除切片
 */
export function deleteChunk(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/chunk/${id}`,
    method: 'delete'
  });
}

/**
 * 添加切片
 */
export function addChunk(data: { documentId: CommonType.IdType; title?: string; content: string }) {
  return request<Api.AI.KB.DocumentChunk>({
    url: '/ai/chunk',
    method: 'post',
    data
  });
}

/**
 * 启用切片
 */
export function enableChunk(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/chunk/enable/${id}`,
    method: 'put'
  });
}

/**
 * 禁用切片
 */
export function disableChunk(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/chunk/disable/${id}`,
    method: 'put'
  });
}

/**
 * 批量启用切片
 */
export function batchEnableChunks(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/chunk/batchEnable',
    method: 'put',
    data: ids
  });
}

/**
 * 批量禁用切片
 */
export function batchDisableChunks(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/chunk/batchDisable',
    method: 'put',
    data: ids
  });
}

/**
 * 批量删除切片
 */
export function batchDeleteChunks(ids: CommonType.IdType[]) {
  return request<any>({
    url: '/ai/chunk/batchDelete',
    method: 'delete',
    data: ids
  });
}

/**
 * 批量为切片生成问题
 */
export function batchGenerateQuestionsByChunks(
  chunkIds: CommonType.IdType[],
  params?: {
    modelId?: CommonType.IdType;
    prompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  return request<any>({
    url: '/ai/question/batchGenerate',
    method: 'post',
    data: { chunkIds, ...params }
  });
}

// ========== 问题 API ==========

/**
 * 获取切片关联的问题列表
 */
export function fetchQuestionsByChunkId(chunkId: CommonType.IdType) {
  return request<Api.AI.KB.Question[]>({
    url: `/ai/question/listByChunk/${chunkId}`,
    method: 'get'
  });
}

/**
 * 手动添加问题
 */
export function addQuestion(chunkId: CommonType.IdType, content: string) {
  return request<any>({
    url: '/ai/question',
    method: 'post',
    data: { chunkId, content }
  });
}

/**
 * 关联现有问题
 */
export function linkQuestion(chunkId: CommonType.IdType, questionId: CommonType.IdType) {
  return request<any>({
    url: '/ai/question/link',
    method: 'post',
    data: { chunkId, questionId }
  });
}

/**
 * 取消关联问题
 */
export function unlinkQuestion(chunkId: CommonType.IdType, questionId: CommonType.IdType) {
  return request<any>({
    url: '/ai/question/unlink',
    method: 'post',
    data: { chunkId, questionId }
  });
}

/**
 * 删除问题
 */
export function deleteQuestion(id: CommonType.IdType) {
  return request<any>({
    url: `/ai/question/${id}`,
    method: 'delete'
  });
}

/**
 * AI自动生成问题
 */
export function generateQuestions(
  chunkId: CommonType.IdType,
  params?: {
    modelId?: CommonType.IdType;
    prompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  return request<Api.AI.KB.Question[]>({
    url: '/ai/question/generate',
    method: 'post',
    data: { chunkId, ...params }
  });
}

/**
 * 获取文档下的所有问题
 */
export function fetchQuestionsByDocumentId(documentId: CommonType.IdType) {
  return request<Api.AI.KB.Question[]>({
    url: `/ai/question/listByDocument/${documentId}`,
    method: 'get'
  });
}
