/**
 * 工作流节点连接规则配置
 * @author Mahone
 * @date 2026-01-06
 */

/**
 * 定义每种节点类型允许连接的目标节点类型
 */
export const connectionRules: Record<Workflow.NodeType, Workflow.NodeType[]> = {
  START: ['LLM_CHAT', 'INTENT_CLASSIFIER', 'CONDITION', 'FIXED_RESPONSE'],
  LLM_CHAT: ['END', 'LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE'],
  INTENT_CLASSIFIER: ['LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE', 'END'],
  CONDITION: ['LLM_CHAT', 'FIXED_RESPONSE', 'END'],
  FIXED_RESPONSE: ['END'],
  END: [],
  APP_INFO: []
};

/**
 * 验证两个节点是否允许连接
 */
export function isValidConnection(sourceType: Workflow.NodeType, targetType: Workflow.NodeType): boolean {
  const allowedTargets = connectionRules[sourceType] || [];
  return allowedTargets.includes(targetType);
}
