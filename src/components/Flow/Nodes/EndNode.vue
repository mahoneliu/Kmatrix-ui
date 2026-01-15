<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-60">
      <!--      <div class="text-xs c-gray-5">结束节点,标记流程完成并输出最终结果</div>-->
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 380px !important;
  max-width: 380px;
}
</style>
