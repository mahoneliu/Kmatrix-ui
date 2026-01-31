import { type Component, defineAsyncComponent, markRaw } from 'vue';
import BaseNode from '@/components/ai/Nodes/base-node.vue';
import StartNode from '@/components/ai/Nodes/start-node.vue';
import EndNode from '@/components/ai/Nodes/end-node.vue';
import IntentClassifierNode from '@/components/ai/Nodes/intent-classifier-node.vue';
import ConditionNode from '@/components/ai/Nodes/condition-node.vue';
import FixedResponseNode from '@/components/ai/Nodes/fixed-response-node.vue';
import DbQueryNode from '@/components/ai/Nodes/db-query-node.vue';
import SqlGenerateNode from '@/components/ai/Nodes/sql-generate-node.vue';
import SqlExecuteNode from '@/components/ai/Nodes/sql-execute-node.vue';
import KnowledgeRetrievalNode from '@/components/ai/Nodes/knowledge-retrieval-node.vue';

const LlmChatNode = defineAsyncComponent(() => import('@/components/ai/Nodes/llm-chat-node.vue'));

/**
 * 节点组件映射 composable
 * @param options.appInfoComponent 可选，APP_INFO 节点使用的组件，默认为 BaseNode
 */
export function useNodeComponents(options?: { appInfoComponent?: Component }) {
  const AppInfoComp = options?.appInfoComponent || BaseNode;

  const componentMap: Record<Workflow.NodeType, Component> = {
    START: markRaw(StartNode),
    END: markRaw(EndNode),
    LLM_CHAT: markRaw(LlmChatNode),
    INTENT_CLASSIFIER: markRaw(IntentClassifierNode),
    CONDITION: markRaw(ConditionNode),
    FIXED_RESPONSE: markRaw(FixedResponseNode),
    DB_QUERY: markRaw(DbQueryNode),
    SQL_GENERATE: markRaw(SqlGenerateNode),
    SQL_EXECUTE: markRaw(SqlExecuteNode),
    KNOWLEDGE_RETRIEVAL: markRaw(KnowledgeRetrievalNode),
    APP_INFO: markRaw(AppInfoComp)
  };

  function getNodeComponent(nodeType: Workflow.NodeType): Component {
    return componentMap[nodeType] || markRaw(BaseNode);
  }

  return { getNodeComponent };
}
