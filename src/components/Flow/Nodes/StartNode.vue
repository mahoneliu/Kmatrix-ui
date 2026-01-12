<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:play-circle' }" class="start-node">
    <div class="w-80 p-2">
      <NCollapse :default-expanded-names="['info']">
        <!-- 节点说明 -->
        <NCollapseItem title="节点说明" name="info">
          <div class="py-2">
            <div class="text-xs c-gray-5">工作流的入口节点,接收用户输入并启动工作流执行。</div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 340px !important;
  max-width: 340px;
}
</style>
