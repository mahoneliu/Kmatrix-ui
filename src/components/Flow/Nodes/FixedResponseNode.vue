<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();

const config = computed(() => props.data.config as Workflow.FixedResponseConfig | undefined);
const preview = computed(() => {
  const content = config.value?.content || '未配置内容';
  return content.length > 20 ? `${content.substring(0, 20)}...` : content;
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:message-text' }">
    <div class="text-xs text-gray-500">{{ preview }}</div>
  </BaseNode>
</template>
