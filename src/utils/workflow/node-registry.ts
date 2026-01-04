/**
 * 工作流节点类型注册表
 * @author Mahone
 * @date 2026-01-04
 */

/** 节点类型配置 */
export interface NodeTypeConfig {
  type: Workflow.NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  category: 'basic' | 'logic' | 'ai' | 'action';
  isSystem?: boolean; // 是否为系统节点(不显示在组件库中)
}

/** 节点类型注册表 */
export const NODE_TYPE_REGISTRY: Record<Workflow.NodeType, NodeTypeConfig> = {
  APP_INFO: {
    type: 'APP_INFO',
    label: '基础信息',
    icon: 'mdi:information',
    color: '#10b981',
    description: '应用基础信息配置',
    category: 'basic',
    isSystem: true // 系统节点,不在组件库中显示
  },
  START: {
    type: 'START',
    label: '开始',
    icon: 'mdi:play-circle',
    color: '#10b981',
    description: '工作流开始节点',
    category: 'basic'
  },
  END: {
    type: 'END',
    label: '结束',
    icon: 'mdi:stop-circle',
    color: '#ef4444',
    description: '工作流结束节点',
    category: 'basic'
  },
  LLM_CHAT: {
    type: 'LLM_CHAT',
    label: 'LLM 对话',
    icon: 'mdi:robot',
    color: '#3b82f6',
    description: '调用大语言模型进行对话',
    category: 'ai'
  },
  INTENT_CLASSIFIER: {
    type: 'INTENT_CLASSIFIER',
    label: '意图判断',
    icon: 'mdi:brain',
    color: '#8b5cf6',
    description: '分类用户输入意图',
    category: 'ai'
  },
  CONDITION: {
    type: 'CONDITION',
    label: '条件判断',
    icon: 'mdi:call-split',
    color: '#f59e0b',
    description: '根据条件进行分支路由',
    category: 'logic'
  },
  FIXED_RESPONSE: {
    type: 'FIXED_RESPONSE',
    label: '固定回复',
    icon: 'mdi:message-text',
    color: '#6b7280',
    description: '返回预设的固定文本',
    category: 'action'
  }
};

/** 获取节点类型配置 */
export function getNodeTypeConfig(type: Workflow.NodeType): NodeTypeConfig {
  return NODE_TYPE_REGISTRY[type];
}

/** 获取所有节点类型 */
export function getAllNodeTypes(): NodeTypeConfig[] {
  return Object.values(NODE_TYPE_REGISTRY);
}

/** 按分类获取节点类型 */
export function getNodeTypesByCategory(category: NodeTypeConfig['category']): NodeTypeConfig[] {
  return getAllNodeTypes().filter(config => config.category === category);
}

/** 节点类型映射(前端 -> 后端) */
export const NODE_TYPE_MAPPING: Record<string, string> = {
  APP_INFO: 'APP_INFO',
  START: 'START',
  END: 'END',
  LLM_CHAT: 'LLM_CHAT',
  INTENT_CLASSIFIER: 'INTENT_CLASSIFIER',
  CONDITION: 'CONDITION',
  FIXED_RESPONSE: 'FIXED_RESPONSE'
};

/** 节点类型反向映射(后端 -> 前端) */
export const NODE_TYPE_REVERSE_MAPPING: Record<string, Workflow.NodeType> = {
  APP_INFO: 'APP_INFO',
  START: 'START',
  END: 'END',
  LLM_CHAT: 'LLM_CHAT',
  INTENT_CLASSIFIER: 'INTENT_CLASSIFIER',
  CONDITION: 'CONDITION',
  FIXED_RESPONSE: 'FIXED_RESPONSE'
};
