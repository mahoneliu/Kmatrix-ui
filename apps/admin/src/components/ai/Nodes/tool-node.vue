<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data }" class="tool-node">
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
