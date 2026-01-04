<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();

const config = computed(() => props.data.config as Workflow.IntentClassifierConfig | undefined);
const intentCount = computed(() => config.value?.intents?.length || 0);
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:brain' }">
    <div class="text-xs text-gray-500">{{ intentCount }} 个意图分类</div>
  </BaseNode>
</template>
