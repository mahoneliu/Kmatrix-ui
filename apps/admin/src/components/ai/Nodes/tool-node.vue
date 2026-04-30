<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();

// 计算摘要信息
// tool 节点的 nodeLabel 本身就是工具名称，config.tool.type 区分来源
const summaryItems = computed(() => {
  const items = [];
  // 工具名称直接取 nodeLabel（由 tool-library-panel 在创建时设置为工具名）
  const toolName = props.data.nodeLabel;
  if (toolName) {
    const toolType = props.data.config?.tool?.type;
    const typeLabel = toolType === 'mcp' ? $t('ai.workflow_node.mcpService') : $t('ai.workflow_node.builtinTool');
    items.push({ label: typeLabel, value: toolName });
  }
  return items;
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data }" :summary-items="summaryItems" class="tool-node">
    <div class="mb-1 text-xs c-gray-5">
      {{
        $t('ai.workflow_node.providedBy', {
          type:
            data.config?.tool?.type === 'mcp' ? $t('ai.workflow_node.mcpService') : $t('ai.workflow_node.builtinTool')
        })
      }}
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 320px !important;
  max-width: 360px;
}
</style>
