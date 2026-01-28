/**
 * 知识库模块类型定义
 * @author Mahone
 * @date 2026-01-28
 */
declare namespace Api.AI.KB {
  /** 知识库 */
  interface KnowledgeBase {
    id?: CommonType.IdType;
    name: string;
    description?: string;
    ownerId?: CommonType.IdType;
    permissionLevel?: 'PRIVATE' | 'TEAM' | 'PUBLIC';
    status?: 'ACTIVE' | 'ARCHIVED';
    createTime?: string;
    updateTime?: string;
    /** 数据集数量 */
    datasetCount?: number;
    /** 文档数量 */
    documentCount?: number;
  }

  /** 知识库搜索参数 */
  interface KnowledgeBaseSearchParams {
    name?: string;
    status?: string;
    permissionLevel?: string;
    pageNo?: number;
    pageSize?: number;
  }

  /** 数据集 */
  interface Dataset {
    id?: CommonType.IdType;
    kbId: CommonType.IdType;
    name: string;
    type: 'FILE' | 'WEB' | 'MANUAL';
    config?: Record<string, any>;
    createTime?: string;
    updateTime?: string;
    /** 文档数量 */
    documentCount?: number;
  }

  /** 数据集搜索参数 */
  interface DatasetSearchParams {
    kbId?: CommonType.IdType;
    name?: string;
    type?: string;
    pageNo?: number;
    pageSize?: number;
  }

  /** 文档 */
  interface Document {
    id?: CommonType.IdType;
    datasetId: CommonType.IdType;
    originalFilename: string;
    fileType?: string;
    fileSize?: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
    errorMsg?: string;
    tokenCount?: number;
    chunkCount?: number;
    createTime?: string;
    updateTime?: string;
  }

  /** 检索请求 */
  interface RetrievalRequest {
    query: string;
    kbIds?: CommonType.IdType[];
    datasetIds?: CommonType.IdType[];
    topK?: number;
    threshold?: number;
    mode?: 'VECTOR' | 'KEYWORD' | 'HYBRID';
    enableRerank?: boolean;
  }

  /** 检索结果 */
  interface RetrievalResult {
    chunkId: CommonType.IdType;
    documentId: CommonType.IdType;
    documentName?: string;
    content: string;
    score: number;
    rerankScore?: number;
    metadata?: Record<string, any>;
  }
}
