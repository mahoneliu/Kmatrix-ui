<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();

const config = computed(() => props.data.config as Workflow.LlmNodeConfig | undefined);
const modelName = computed(() => (config.value?.modelId ? `模型 ID: ${config.value.modelId}` : '未配置模型'));
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:robot' }">
    <div class="text-xs text-gray-500">{{ modelName }}</div>
    <div v-if="config?.temperature" class="mt-1 text-xs text-gray-400">温度: {{ config.temperature }}</div>
  </BaseNode>
</template>
