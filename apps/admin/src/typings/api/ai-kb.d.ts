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
}
