<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:stop-circle' }" class="end-node">
    <div class="w-90 p-2">
      <NCollapse :default-expanded-names="['info']">
        <!-- 节点说明 -->
        <NCollapseItem title="节点说明" name="info">
          <div class="py-2">
            <div class="text-xs c-gray-5">工作流的结束节点,标记流程完成并输出最终结果。</div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 380px !important;
  max-width: 380px;
}
</style>
