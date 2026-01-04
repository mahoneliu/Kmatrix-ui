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
    type: NodeType;
    label: string;
    config?: Record<string, any>;
    status?: NodeStatus;
    icon?: string;
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
    modelId: CommonType.IdType;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }

  /** 意图分类节点配置 */
  interface IntentClassifierConfig extends NodeConfigFormData {
    modelId: CommonType.IdType;
    intents: Array<{
      name: string;
      description: string;
      examples: string[];
    }>;
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
    content: string;
  }

  /** 应用基础信息节点配置 */
  interface AppInfoConfig extends NodeConfigFormData {
    appName: string;
    description: string;
    icon: string;
    prologue: string;
  }
}
