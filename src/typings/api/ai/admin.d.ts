declare namespace Api.AI.Admin {
  /** 模型供应商 */
  interface ModelProvider {
    providerId: CommonType.IdType;
    providerName: string;
    providerKey: string;
    providerType?: '1' | '2'; // 1: 公用模型, 2: 本地模型
    default_endpoint: string;
    siteUrl: string;
    iconUrl: string;
    configSchema: string;
    models: string; // 支持的模型标识 (JSON 字符串)
    status: '0' | '1';
    sort: number;
    remark: string;
  }

  /** AI 模型配置 */
  interface Model {
    modelId: CommonType.IdType;
    providerId: CommonType.IdType;
    modelName: string;
    modelType: '1' | '2'; // 1: 语言模型, 2: 向量模型
    modelKey: string;
    apiKey: string;
    apiBase: string;
    config: string;
    status: '0' | '1';
    isBuiltin: 'Y' | 'N';
    modelSource: '1' | '2'; // 1: 公有模型, 2: 本地模型
    providerIcon?: string;
    remark: string;
  }

  /** 模型配置 */
  interface AppModelConfig {
    prompt: string;
    temperature: number;
    top_p: number;
    max_tokens: number;
    opening_statement: string;
  }

  /** 知识库配置 */
  interface AppKnowledgeConfig {
    topK: number;
    similarityThreshold: number;
    searchMode: 'embedding' | 'fulltext' | 'hybrid';
    maxParagraphChar: number;
    returnDirectlyWhenNoRef: boolean;
    showCitation: boolean;
  }

  /** 工作流配置 */
  interface AppWorkflowConfig {
    showProcess: boolean;
  }

  /** AI 应用 */
  interface App {
    appId?: CommonType.IdType;
    appName: string;
    description: string;
    icon: string;
    appType: '1' | '2'; // 1: 基础对话, 2: 工作流
    status: '0' | '1'; // 0: 草稿, 1: 发布
    prologue: string;
    modelSetting: AppModelConfig;
    knowledgeSetting: AppKnowledgeConfig;
    workflowConfig: AppWorkflowConfig;
    graphData?: string; // 工作流画布数据 (JSON)
    dslData?: string; // 工作流 DSL 数据 (JSON)
    modelId: CommonType.IdType;
    knowledgeIds?: string; // 用于前端传参
    remark: string;
    createBy: string;
    createByName: string;
    createTime: string;
    updateBy: string;
    updateByName: string;
    updateTime: string;
  }

  /** 搜索参数 */
  interface AppSearchParams {
    appName?: string;
    appType?: string;
    status?: string;
    pageNo?: number;
    pageSize?: number;
  }

  /** 工作流 */
  interface Workflow {
    flowId: CommonType.IdType;
    appId: CommonType.IdType;
    graphData: string;
    dslData: string;
    version: number;
    isActive: 'Y' | 'N';
    remark: string;
    createTime: string;
  }
}
