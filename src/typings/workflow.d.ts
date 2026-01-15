/**
 * 工作流相关类型定义
 * @author Mahone
 * @date 2026-01-04
 */

declare namespace Workflow {
  /** 节点类型枚举 */
  type NodeType = 'APP_INFO' | 'START' | 'END' | 'LLM_CHAT' | 'INTENT_CLASSIFIER' | 'CONDITION' | 'FIXED_RESPONSE';

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

  /** LLM 节点配置 */
  interface LlmNodeConfig extends NodeConfigFormData {
    /** 推理模型ID (必填) */
    modelId: CommonType.IdType;
    /** 系统提示词 */
    systemPrompt?: string;
    /** 温度参数 */
    temperature?: number;
    /** 最大令牌数 */
    maxTokens?: number;
  }

  /** 意图分类节点配置 */
  interface IntentClassifierConfig extends NodeConfigFormData {
    /** 推理模型ID (必填) */
    modelId: CommonType.IdType;
    /** 意图列表 */
    intents: string[];
  }

  /** 条件节点配置 */
  interface ConditionConfig extends NodeConfigFormData {
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
    globalParams?: ParamDefinition[];
    /** 接口参数定义 */
    interfaceParams?: ParamDefinition[];
    /** 会话参数定义 */
    sessionParams?: ParamDefinition[];
  }

  // ========== 参数配置相关类型 ==========

  /** 参数数据类型 */
  type ParamDataType = 'string' | 'number' | 'boolean' | 'object' | 'array';

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
  type ParamSourceType = 'global' | 'node' | 'interface' | 'session';

  /** 参数绑定配置 */
  interface ParamBinding {
    /** 当前节点的参数键 */
    paramKey: string;
    /** 来源类型 */
    sourceType: ParamSourceType;
    /** 来源键（全局参数键 或 节点ID） */
    sourceKey: string;
    /** 如果是节点来源，指定节点的输出参数键 */
    sourceParam?: string;
  }

  /** 参数来源（用于参数选择器） */
  interface ParamSource {
    /** 来源类型 */
    type: ParamSourceType;
    /** 来源键（'global' 或 节点ID） */
    sourceKey: string;
    /** 来源显示名称 */
    sourceName: string;
    /** 可用参数列表 */
    params: ParamDefinition[];
  }

  /** 节点类型参数定义 */
  interface NodeTypeParams {
    /** 节点类型 */
    type: NodeType;
    /** 输入参数定义 */
    inputParams: ParamDefinition[];
    /** 输出参数定义 */
    outputParams: ParamDefinition[];
  }
}
