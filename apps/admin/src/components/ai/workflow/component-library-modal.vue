<script setup lang="ts">
import { ref } from 'vue';
import { NPopover } from 'naive-ui';
import ComponentLibraryPanel from './component-library-panel.vue';

interface Emits {
  (e: 'select', nodeType: Workflow.NodeType): void;
  (e: 'dragStart', data: { type: Workflow.NodeType; x: number; y: number }): void;
}

const emit = defineEmits<Emits>();

const showPopover = ref(false);

function handleSelect(nodeType: Workflow.NodeType) {
  emit('select', nodeType);
  showPopover.value = false;
}

function handleDragStart(data: { type: Workflow.NodeType; x: number; y: number }) {
  showPopover.value = false;
  emit('dragStart', data);
}
</script>

<template>
  <NPopover
    v-model:show="showPopover"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    raw
    :content-style="{ padding: 0 }"
  >
    <template #trigger>
      <slot name="trigger" />
    </template>

    <ComponentLibraryPanel @select="handleSelect" @drag-start="handleDragStart" />
  </NPopover>
</template>
