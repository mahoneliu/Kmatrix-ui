/**
 * AI Knowledge Base Types (Extensions)
 *
 * Existing types (KnowledgeBase, Dataset, Document, etc.) are defined elsewhere.
 * We extend the namespace here to add new types.
 */
declare namespace Api.AI.KB {
  /**
   * Document Chunk Entity
   */
  interface DocumentChunk {
    id: CommonType.IdType;
    documentId: CommonType.IdType;
    kbId?: CommonType.IdType;
    content: string;
    title?: string;
    wordCount?: number;
    tokenCount?: number;
    metadata?: Record<string, any>;
    createTime?: string;
    /** 启用状态 (0=禁用, 1=启用) */
    enabled?: number;
  }

  /** 分块分页查询参数 */
  interface ChunkPageQuery {
    documentId: CommonType.IdType;
    pageNum?: number;
    pageSize?: number;
    enabled?: number;
    keyword?: string;
    title?: string;
    content?: string;
  }

  /**
   * Question Entity
   */
  interface Question {
    id: CommonType.IdType;
    kbId?: CommonType.IdType;
    content: string;
    hitNum?: number;
    sourceType?: string; // MANUAL, LLM
    createTime?: string;
    updateTime?: string;
    chunkCount?: number; // 关联分段数量
  }
  /**
   * Question Query Params
   */
  interface QuestionQuery {
    kbId?: CommonType.IdType;
    content?: string;
    pageNum?: number;
    pageSize?: number;
  }

  /**
   * Knowledge Base Statistics
   */
  interface Statistics {
    /** 知识库总数 */
    totalKbs?: number;
    /** 数据集总数 */
    totalDatasets?: number;
    /** 文档总数 */
    totalDocuments?: number;
    /** 切片总数 */
    totalChunks?: number;
    /** 问题总数 */
    questionCount?: number;
    /** 处理中文档数 */
    processingDocs?: number;
    /** 失败文档数 */
    errorDocs?: number;
  }

  /**
   * 临时文件信息
   */
  interface TempFile {
    id: CommonType.IdType;
    datasetId: CommonType.IdType;
    originalFilename: string;
    fileExtension: string;
    fileSize: number;
    tempPath: string;
  }

  /**
   * 分块预览请求
   */
  interface ChunkPreviewRequest {
    /** 临时文件ID */
    tempFileId: CommonType.IdType;
    /** 分块策略 (AUTO=自动, CUSTOM=自定义) */
    chunkStrategy: 'AUTO' | 'CUSTOM';
    /** 自定义分隔符列表 */
    separators?: string[];
    /** 最大分块大小 */
    chunkSize?: number;
    /** 重叠大小 */
    overlap?: number;
  }

  /**
   * 分块预览结果
   */
  interface ChunkPreview {
    /** 临时分块ID */
    chunkId: string;
    /** 标题 */
    title?: string;
    /** 内容 */
    content: string;
    /** 序号 */
    index: number;
  }

  /**
   * 分块提交请求
   */
  interface ChunkSubmitRequest {
    /** 临时文件ID */
    tempFileId: CommonType.IdType;
    /** 数据集ID */
    datasetId: CommonType.IdType;
    /** 分块列表 */
    chunks: ChunkSubmitItem[];
  }

  /**
   * 分块提交项
   */
  interface ChunkSubmitItem {
    /** 标题 */
    title?: string;
    /** 内容 */
    content: string;
  }

  /**
   * 检索结果
   */
  interface RetrievalResult {
    chunkId: CommonType.IdType;
    documentId: CommonType.IdType;
    documentName?: string;
    content: string;
    title?: string;
    score: number;
    rerankScore?: number;
    metadata?: any;
    highlight?: string;
    /** 匹配的问题列表 */
    matchedQuestions?: string[];
    /** 匹配来源类型列表 (CONTENT, TITLE, QUESTION) */
    sourceTypes?: string[];
  }
}
