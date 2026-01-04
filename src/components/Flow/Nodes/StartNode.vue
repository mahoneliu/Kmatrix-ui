<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:play-circle' }">
    <div class="text-xs text-gray-500">工作流入口</div>
  </BaseNode>
</template>
