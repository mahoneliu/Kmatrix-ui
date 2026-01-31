/**
 * 工作流节点注册表
 * 从后端加载节点定义
 * @author Mahone
 * @date 2026-01-04
 */

import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

/**
 * 节点类型映射(前端 -> 后端)
 */
export const NODE_TYPE_MAPPING: Record<Workflow.NodeType, string> = {
  APP_INFO: 'APP_INFO',
  START: 'START',
  END: 'END',
  LLM_CHAT: 'LLM_CHAT',
  INTENT_CLASSIFIER: 'INTENT_CLASSIFIER',
  CONDITION: 'CONDITION',
  FIXED_RESPONSE: 'FIXED_RESPONSE',
  DB_QUERY: 'DB_QUERY',
  SQL_GENERATE: 'SQL_GENERATE',
  SQL_EXECUTE: 'SQL_EXECUTE',
  KNOWLEDGE_RETRIEVAL: 'KNOWLEDGE_RETRIEVAL'
};

/**
 * 节点类型反向映射(后端 -> 前端)
 */
export const NODE_TYPE_REVERSE_MAPPING: Record<string, Workflow.NodeType> = {
  APP_INFO: 'APP_INFO',
  START: 'START',
  END: 'END',
  LLM_CHAT: 'LLM_CHAT',
  INTENT_CLASSIFIER: 'INTENT_CLASSIFIER',
  CONDITION: 'CONDITION',
  FIXED_RESPONSE: 'FIXED_RESPONSE',
  DB_QUERY: 'DB_QUERY',
  SQL_GENERATE: 'SQL_GENERATE',
  SQL_EXECUTE: 'SQL_EXECUTE',
  KNOWLEDGE_RETRIEVAL: 'KNOWLEDGE_RETRIEVAL'
};

/**
 * 获取所有节点类型
 * 从 store 中读取,如果未加载则返回空数组
 */
export function getAllNodeTypes() {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getAllNodeTypes();
}

/**
 * 根据类型获取节点定义
 */
export function getNodeTypeInfo(type: Workflow.NodeType) {
  const nodeDefinitionStore = useNodeDefinitionStore();
  return nodeDefinitionStore.getNodeDefinition(type);
}
