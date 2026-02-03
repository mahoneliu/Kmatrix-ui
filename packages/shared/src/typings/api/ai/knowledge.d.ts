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
    /** 处理类型: GENERIC_FILE, QA_PAIR, ONLINE_DOC, WEB_LINK */
    processType?: 'GENERIC_FILE' | 'QA_PAIR' | 'ONLINE_DOC' | 'WEB_LINK';
    /** 是否系统预设数据集 */
    isSystem?: boolean;
    /** 数据来源类型 */
    sourceType?: 'FILE_UPLOAD' | 'TEXT_INPUT' | 'WEB_CRAWL';
    /** 最小分块大小 (token) */
    minChunkSize?: number;
    /** 最大分块大小 (token) */
    maxChunkSize?: number;
    /** 分块重叠大小 (token) */
    chunkOverlap?: number;
    /** 支持的文件格式 (逗号分隔, *表示全部) */
    allowedFileTypes?: string;
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
    /** 启用状态 (0=禁用, 1=启用) */
    enabled?: number;
    /** 向量化状态 (0=未生成, 1=生成中, 2=已生成, 3=失败) */
    embeddingStatus?: number;
    /** 问题生成状态 (0=未生成, 1=生成中, 2=已生成, 3=失败) */
    questionStatus?: number;
    /** 状态追踪元数据 */
    statusMeta?: Record<string, any>;
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
    /** 是否启用关键词高亮 (仅 KEYWORD 模式生效) */
    enableHighlight?: boolean;
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
    /** 高亮后的内容片段 (HTML) */
    highlight?: string;
  }

  /** 知识库统计信息 */
  interface Statistics {
    totalKbs: number;
    totalDatasets: number;
    totalDocuments: number;
    totalChunks: number;
    processingDocs: number;
    errorDocs: number;
  }

  /** 文档查询参数 (分页) */
  interface DocumentQuery {
    /** 数据集ID */
    datasetId?: CommonType.IdType;
    /** 启用状态 (0=禁用, 1=启用) */
    enabled?: number;
    /** 向量化状态 (0=未生成, 1=生成中, 2=已生成, 3=生成失败) */
    embeddingStatus?: number;
    /** 问题生成状态 (0=未生成, 1=生成中, 2=已生成, 3=生成失败) */
    questionStatus?: number;
    /** 关键词搜索 */
    keyword?: string;
    /** 页码 */
    pageNum?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序字段 */
    orderByColumn?: string;
    /** 是否升序 */
    isAsc?: string;
  }
}
