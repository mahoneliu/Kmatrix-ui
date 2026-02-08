/**
 * 工作流相关类型定义
 * @author Mahone
 * @date 2026-01-04
 */

declare namespace Workflow {
  /** 节点类型枚举 */
  type NodeType =
    | 'APP_INFO'
    | 'START'
    | 'END'
    | 'LLM_CHAT'
    | 'INTENT_CLASSIFIER'
    | 'CONDITION'
    | 'FIXED_RESPONSE'
    | 'DB_QUERY'
    | 'SQL_GENERATE'
    | 'SQL_EXECUTE'
    | 'KNOWLEDGE_RETRIEVAL';

  /** 节点执行状态 */
  type NodeStatus = 'idle' | 'running' | 'success' | 'error';

  /** 节点位置 */
  interface Position {
    x: number;
    y: number;
  }

  /** 节点数据结构 */
  interface NodeData {
    id: string;
    nodeType: NodeType;
    nodeLabel: string;
    config?: Record<string, any>;
    status?: NodeStatus;
    nodeIcon?: string;
    description?: string;
    nodeColor?: string;
    category?: string;
    isSystem?: string;
    isEnabled?: string;
    /** 参数绑定配置 */
    paramBindings?: ParamBinding[];
    /** 自定义输入参数 */
    customInputParams?: ParamDefinition[];
    /** 自定义输出参数 */
    customOutputParams?: ParamDefinition[];
  }

  /** 边数据结构 */
  interface EdgeData {
    id: string;
    source: string;
    target: string;
    label?: string;
    condition?: string;
  }

  /** 工作流 DSL 节点配置 */
  interface DslNodeConfig {
    id: string;
    type: string;
    name: string;
    config?: Record<string, any>;
    inputs?: Record<string, any>;
    condition?: string;
  }

  /** 工作流 DSL 边配置 */
  interface DslEdgeConfig {
    from: string;
    to: string;
    condition?: string;
  }

  /** 工作流 DSL 结构(与后端对齐) */
  interface WorkflowDSL {
    workflowId?: string;
    name: string;
    entryPoint: string;
    nodes: DslNodeConfig[];
    edges: DslEdgeConfig[];
  }

  /** Vue Flow Graph 数据 */
  interface GraphData {
    nodes: Array<{
      id: string;
      type: string;
      position: Position;
      data: NodeData;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      data?: EdgeData;
    }>;
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
  }

  /** 节点配置表单数据 */
  interface NodeConfigFormData {
    [key: string]: any;
  }

  /** Start 节点配置 */
  interface StartNodeConfig extends NodeConfigFormData {
    /** 全局参数 */
    globalParams?: ParamDefinition[];
  }

  /** LLM 节点配置 */
  interface LlmNodeConfig extends NodeConfigFormData {
    /** 推理模型ID (必填) */
    modelId: CommonType.IdType;
    /** 系统提示词 */
    systemPrompt?: string;
    /** 用户提示词 */
    userPrompt?: string;
    /** 温度参数 */
    temperature?: number;
    /** 最大令牌数 */
    maxTokens?: number;
    /** 是否启用历史对话 */
    historyEnabled?: boolean;
    /** 历史对话条数限制 */
    historyLimit?: number;
  }

  /** 意图分类节点配置 */
  interface IntentClassifierConfig extends NodeConfigFormData {
    /** 推理模型ID (必填) */
    modelId: CommonType.IdType;
    /** 意图列表 */
    intents: string[];
  }

  // ========== 条件节点相关类型 ==========

  /** 比较运算符 */
  type ComparisonOperator =
    | 'eq' // == 等于
    | 'ne' // != 不等于
    | 'gt' // > 大于
    | 'lt' // < 小于
    | 'gte' // >= 大于等于
    | 'lte' // <= 小于等于
    | 'contains' // 包含
    | 'notContains' // 不包含
    | 'startsWith' // 以...开始
    | 'endsWith' // 以...结束
    | 'isEmpty' // 为空
    | 'isNotEmpty'; // 不为空

  /** 逻辑运算符 */
  type LogicalOperator = 'AND' | 'OR';

  /** 变量引用 */
  interface VariableRef {
    /** 来源类型: global / node */
    sourceType: 'global' | 'node';
    /** 来源键 (app/interface/session 或 节点ID) */
    sourceKey: string;
    /** 参数键 */
    sourceParam: string;
  }

  /** 条件规则 */
  interface ConditionRule {
    /** 规则类型标识 */
    type?: 'rule';
    /** 变量引用（左值） */
    variable: VariableRef;
    /** 比较运算符 */
    operator: ComparisonOperator;
    /** 比较值（右值） */
    compareValue?: string | number | boolean;
    /** 比较值类型: static / variable */
    compareValueType?: 'static' | 'variable';
    /** 比较值变量引用 */
    compareVariable?: VariableRef;
  }

  /** 条件组（支持嵌套） */
  interface ConditionGroup {
    /** 规则类型标识 */
    type?: 'group';
    /** 逻辑运算符 */
    logicalOperator: LogicalOperator;
    /** 条件列表（可以是规则或嵌套组） */
    conditions: Array<ConditionRule | ConditionGroup>;
  }

  /** 条件分支 */
  interface ConditionBranch {
    /** 分支名称 */
    name: string;
    /** 条件配置 */
    condition: ConditionGroup;
    /** Handle ID (自动生成) */
    handleId?: string;
    /** 目标节点ID (从边配置中提取) */
    targetNodeId?: string;
  }

  /** 条件节点配置 (新版结构化) */
  interface ConditionConfig extends NodeConfigFormData {
    /** 条件分支列表 (IF / ELSE IF) */
    branches: ConditionBranch[];
    /** 是否启用默认分支 (ELSE) */
    hasDefaultBranch?: boolean;
  }

  /** 旧版条件节点配置 (兼容) @deprecated */
  interface LegacyConditionConfig extends NodeConfigFormData {
    conditions: Array<{
      expression: string;
      targetNodeId: string;
    }>;
    defaultTargetNodeId?: string;
  }

  /** 固定回复节点配置 */
  interface FixedResponseConfig extends NodeConfigFormData {
    /** 回复内容 (必填) */
    content: string;
  }
  /** 结束节点配置 */
  interface EndConfig extends NodeConfigFormData {
    /** 是否指定回复内容 */
    isCustomResponse: boolean;
    /** 指定回复内容 (finalResponse参数与customResponse参数必填其中之一) */
    customResponse: string;
  }

  /** 应用基础信息节点配置 */
  interface AppInfoConfig extends NodeConfigFormData {
    /** 应用名称 (必填) */
    appName: string;
    /** 应用描述 */
    description: string;
    /** 应用图标 */
    icon: string;
    /** 推理模型ID (必填) */
    modelId: CommonType.IdType;
    /** 开场白 */
    prologue: string;
    /** 全局参数定义 */
    // globalParams?: ParamDefinition[];
    /** 应用参数定义 */
    appParams?: ParamDefinition[];
    /** 接口参数定义 */
    interfaceParams?: ParamDefinition[];
    /** 会话参数定义 */
    sessionParams?: ParamDefinition[];
  }

  /** 数据库查询节点配置 */
  interface DbQueryNodeConfig extends NodeConfigFormData {
    /** 数据源ID (必填) */
    dataSourceId: CommonType.IdType;
    /** LLM模型ID (必填) */
    modelId: CommonType.IdType;
    /** 最大返回行数 (默认100) */
    maxRows?: number;
    /** 允许查询的表 (逗号分隔) */
    tableWhitelist?: string;
    /** 禁止查询的表 (逗号分隔) */
    tableBlacklist?: string;
  }

  /** SQL 生成节点配置 */
  interface SqlGenerateNodeConfig extends NodeConfigFormData {
    /** 数据源ID (必填) */
    dataSourceId: CommonType.IdType;
    /** LLM模型ID (必填) */
    modelId: CommonType.IdType;
    /** 允许查询的表 (逗号分隔) */
    tableWhitelist?: string;
    /** 禁止查询的表 (逗号分隔) */
    tableBlacklist?: string;
  }

  /** SQL 执行节点配置 */
  interface SqlExecuteNodeConfig extends NodeConfigFormData {
    /** 数据源ID (必填) */
    dataSourceId: CommonType.IdType;
    /** 最大返回行数 (默认100) */
    maxRows?: number;
  }

  /** 知识检索节点配置 */
  interface KnowledgeRetrievalConfig extends NodeConfigFormData {
    /** 知识库ID列表 */
    kbIds?: number[];
    /** 数据集ID列表 */
    datasetIds?: number[];
    /** 返回结果数量 (默认5) */
    topK?: number;
    /** 相似度阈值 (默认0.5) */
    threshold?: number;
    /** 检索模式: VECTOR/KEYWORD/HYBRID */
    mode?: 'VECTOR' | 'KEYWORD' | 'HYBRID';
    /** 是否启用重排序 */
    enableRerank?: boolean;
    /** 空结果时的预设回复 */
    emptyResponse?: string;
  }

  /** AI配置通用接口 */
  interface AiConfig {
    /** 模型ID */
    modelId?: string | null;
    /** 温度 */
    temperature?: number;
    /** 最大Token数 */
    maxTokens?: number | null;
    /** 系统提示词 */
    systemPrompt?: string;
    /** 流式输出 */
    streamOutput?: boolean;
  }

  // ========== 参数配置相关类型 ==========

  /** 参数数据类型 */
  type ParamDataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'datetime';

  /** 参数定义 */
  interface ParamDefinition {
    /** 参数键名 */
    key: string;
    /** 参数显示名称 */
    label: string;
    /** 参数数据类型 */
    type: ParamDataType;
    /** 是否必填 */
    required: boolean;
    /** 默认值 */
    defaultValue?: any;
    /** 参数描述 */
    description?: string;
  }

  /** 参数绑定来源类型 */
  type ParamSourceType = 'global' | 'node';

  /** 参数绑定配置 */
  interface ParamBinding {
    /** 当前节点的参数键 */
    paramKey: string;
    /** 来源类型 'global' | 'node' */
    sourceType: ParamSourceType;
    /** 来源键（全局参数键，对应global参数提供者 或 节点ID），global下面有app/interface/session */
    sourceKey: string;
    /** 如果是节点来源，指定节点的输出参数键 */
    sourceParam?: string;
  }

  /** 参数来源（用于参数选择器） */
  interface ParamSource {
    /** 来源类型 */
    type: ParamSourceType;
    /** 来源键（'global'参数提供者 或 节点ID） */
    sourceKey: string;
    /** 来源显示名称 */
    sourceName: string;
    /** 可用参数列表 */
    params: ParamDefinition[];
  }

  // ========== 节点执行相关类型 ==========

  /** Token 使用统计 */
  interface TokenUsage {
    /** 输入 token 数量 */
    inputTokenCount?: number;
    /** 输出 token 数量 */
    outputTokenCount?: number;
    /** 总 token 数量 */
    totalTokenCount?: number;
  }

  /** 节点执行详情 */
  interface NodeExecutionDetail {
    /** 节点名称 */
    nodeName: string;
    /** 节点类型 */
    nodeType: string;
    /** 输入参数 */
    inputs: Record<string, any>;
    /** 输出参数 */
    outputs: Record<string, any>;
    /** 执行耗时(毫秒) */
    durationMs: number;
    /** Token 使用统计(可选) */
    tokenUsage?: TokenUsage;
  }

  /** 节点类型参数定义 */
  // interface NodeTypeParams {
  //   /** 节点类型 */
  //   type: NodeType;
  //   /** 输入参数定义 */
  //   inputParams: ParamDefinition[];
  //   /** 输出参数定义 */
  //   outputParams: ParamDefinition[];
  // }
}
