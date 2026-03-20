<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data }" class="skill-node">
    <div class="mb-1 text-xs c-gray-5">
      {{ $t('ai.skill.providedBySkillConfig') }}
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 320px !important;
  max-width: 360px;
}
</style>
