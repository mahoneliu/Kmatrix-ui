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
  }
}
