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
import FileStorageNode from '@/components/ai/Nodes/file-storage-node.vue';
import ToolNode from '@/components/ai/Nodes/tool-node.vue';
import SkillNode from '@/components/ai/Nodes/skill-node.vue';
import LoopNode from '@/components/ai/Nodes/loop-node.vue';
import FileParseNode from '@/components/ai/Nodes/file-parse-node.vue';
import McpResourceNode from '@/components/ai/Nodes/mcp-resource-node.vue';
import ParameterExtractorNode from '@/components/ai/Nodes/parameter-extractor-node.vue';
import VariableAggregatorNode from '@/components/ai/Nodes/variable-aggregator-node.vue';

const LlmChatNode = defineAsyncComponent(() => import('@/components/ai/Nodes/llm-chat-node.vue'));
const SessionVariableAssignNode = defineAsyncComponent(
  () => import('@/components/ai/Nodes/session-variable-assign-node.vue')
);

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
    TOOL: markRaw(ToolNode),
    SKILL: markRaw(SkillNode),
    LOOP: markRaw(LoopNode),
    FILE_STORAGE: markRaw(FileStorageNode),
    AUDIO_ASR: markRaw(BaseNode),
    IMAGE_OCR: markRaw(BaseNode),
    FILE_PARSE: markRaw(FileParseNode),
    DATASET_STORAGE: markRaw(BaseNode),
    MCP_RESOURCE: markRaw(McpResourceNode),
    PARAMETER_EXTRACTOR: markRaw(ParameterExtractorNode),
    VARIABLE_AGGREGATOR: markRaw(VariableAggregatorNode),
    APP_INFO: markRaw(AppInfoComp),
    SESSION_VARIABLE_ASSIGN: markRaw(SessionVariableAssignNode)
  };

  function getNodeComponent(nodeType: Workflow.NodeType): Component {
    return componentMap[nodeType] || markRaw(BaseNode);
  }

  return { getNodeComponent };
}
