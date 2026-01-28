/**
 * 工作流节点连接规则配置
 * @author Mahone
 * @date 2026-01-06
 */

import { useNodeDefinitionStore } from '@/store/modules/node-definition';

/**
 * 定义每种节点类型允许连接的目标节点类型 (作为加载后端的兜底)
 */
const fallbackConnectionRules: Record<string, string[]> = {
  START: ['LLM_CHAT', 'INTENT_CLASSIFIER', 'CONDITION', 'FIXED_RESPONSE', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  LLM_CHAT: ['END', 'LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  INTENT_CLASSIFIER: ['LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE', 'END', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  CONDITION: ['LLM_CHAT', 'FIXED_RESPONSE', 'END', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  DB_QUERY: ['END', 'LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE'],
  KNOWLEDGE_RETRIEVAL: ['LLM_CHAT', 'CONDITION', 'END'],
  FIXED_RESPONSE: ['END'],
  END: [],
  APP_INFO: []
};

/**
 * 验证两个节点是否允许连接
 */
export function isValidConnection(sourceType: Workflow.NodeType, targetType: Workflow.NodeType): boolean {
  const nodeDefinitionStore = useNodeDefinitionStore();

  // 优先使用后端的动态规则
  if (nodeDefinitionStore.connectionRules && Object.keys(nodeDefinitionStore.connectionRules).length > 0) {
    const allowedTargets = nodeDefinitionStore.connectionRules[sourceType] || [];
    return (allowedTargets as string[]).includes(targetType);
  }

  // 兜底规则
  const allowedTargets = fallbackConnectionRules[sourceType] || [];
  return allowedTargets.includes(targetType);
}
