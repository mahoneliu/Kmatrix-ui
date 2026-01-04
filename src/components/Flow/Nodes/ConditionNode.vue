<script setup lang="ts">
import { computed } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();

const config = computed(() => props.data.config as Workflow.ConditionConfig | undefined);
const conditionCount = computed(() => config.value?.conditions?.length || 0);
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:call-split' }">
    <div class="text-xs text-gray-500">{{ conditionCount }} 个条件分支</div>
  </BaseNode>
</template>
