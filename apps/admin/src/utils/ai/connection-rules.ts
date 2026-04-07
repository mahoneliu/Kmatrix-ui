/**
 * 工作流节点连接规则配置
 * @author Mahone
 * @date 2026-01-06
 */

import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

/**
 * 定义每种节点类型允许连接的目标节点类型 (作为加载后端的兜底)
 */
const fallbackConnectionRules: Record<string, string[]> = {
  START: [
    'LLM_CHAT',
    'INTENT_CLASSIFIER',
    'CONDITION',
    'FIXED_RESPONSE',
    'DB_QUERY',
    'KNOWLEDGE_RETRIEVAL',
    'FILE_STORAGE',
    'AUDIO_ASR',
    'IMAGE_OCR',
    'FILE_PARSE',
    'DATASET_STORAGE'
  ],
  LLM_CHAT: ['END', 'LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  INTENT_CLASSIFIER: ['LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE', 'END', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  CONDITION: ['LLM_CHAT', 'FIXED_RESPONSE', 'END', 'DB_QUERY', 'KNOWLEDGE_RETRIEVAL'],
  DB_QUERY: ['END', 'LLM_CHAT', 'CONDITION', 'FIXED_RESPONSE'],
  KNOWLEDGE_RETRIEVAL: ['LLM_CHAT', 'CONDITION', 'END'],
  FIXED_RESPONSE: ['END', 'LOOP'],
  FILE_STORAGE: ['LLM_CHAT', 'AUDIO_ASR', 'IMAGE_OCR', 'CONDITION', 'END'],
  AUDIO_ASR: ['LLM_CHAT', 'CONDITION', 'END'],
  IMAGE_OCR: ['LLM_CHAT', 'CONDITION', 'END'],
  END: [],
  FILE_PARSE: ['DATASET_STORAGE', 'END'],
  DATASET_STORAGE: ['END'],
  APP_INFO: []
};

/**
 * 验证两个节点是否允许连接
 */
export function isValidConnection(sourceType: Workflow.NodeType, targetType: Workflow.NodeType): boolean {
  const nodeDefinitionStore = useNodeDefinitionStore();

  const mode = nodeDefinitionStore.connectionRuleMode;
  const rules = nodeDefinitionStore.connectionRules;

  // 黑名单模式：默认全部允许，只有在禁止列表里才拒绝
  // 即使没有任何禁止规则（空 map），也应该全部放行
  if (mode === 'blacklist') {
    const deniedTargets = rules[sourceType] || [];
    return !(deniedTargets as string[]).includes(targetType);
  }

  // 白名单模式：必须在允许列表里才放行
  if (rules && Object.keys(rules).length > 0) {
    const allowedTargets = rules[sourceType] || [];
    return (allowedTargets as string[]).includes(targetType);
  }

  // 白名单兜底规则
  const allowedTargets = fallbackConnectionRules[sourceType] || [];
  return allowedTargets.includes(targetType);
}

/**
 * 根据源节点类型和 sourceHandle 生成条件表达式
 * @param sourceNode 源节点
 * @param sourceHandle 源 Handle ID
 * @returns 条件表达式字符串,如果不需要条件则返回 undefined
 */
export function generateEdgeCondition(sourceNode: any, sourceHandle: string | null | undefined): string | undefined {
  if (!sourceHandle) return undefined;

  const nodeType = sourceNode.data.nodeType as Workflow.NodeType;

  // 意图分类器节点: 根据 sourceHandle 生成条件
  if (nodeType === 'INTENT_CLASSIFIER') {
    if (sourceHandle === 'else') {
      return "intent == 'else'";
    }
    // sourceHandle 格式: intent-0, intent-1, ...
    const match = sourceHandle.match(/^intent-(\d+)$/);
    if (match) {
      const intentIndex = Number.parseInt(match[1], 10);
      const config = sourceNode.data.config as Workflow.IntentClassifierConfig;
      if (config?.intents && config.intents[intentIndex]) {
        const intentName = config.intents[intentIndex];
        return `intent == '${intentName}'`;
      }
    }
  }
  return undefined;
}
