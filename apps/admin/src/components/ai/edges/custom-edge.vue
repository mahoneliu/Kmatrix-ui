<!-- eslint-disable -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';
import type { EdgeProps } from '@vue-flow/core';
import { useWorkflowHistory } from '@/composables/ai/workflow/use-workflow-history';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

// 自定义 Edge Props 以支持 updatable 属性
// updatable 可以是 boolean 或 'source' | 'target' 字符串
interface CustomEdgeProps extends Omit<EdgeProps, 'updatable'> {
  updatable?: boolean | 'source' | 'target';
}

const props = defineProps<CustomEdgeProps>();

const workflowStore = useWorkflowStore();

// 初始化历史管理
const { takeSnapshot } = useWorkflowHistory();

const path = computed(() => getBezierPath(props));
// 调试日志
/* import { watch } from 'vue';
watch(isHighlighted, v => {
  if (v) console.log('Edge Highlighted:', props.id);
}); */

const isHighlighted = computed(() => {
  return (
    workflowStore.hoveredNodeId &&
    (workflowStore.hoveredNodeId === props.source || workflowStore.hoveredNodeId === props.target)
  );
});

// 使用 style 绑定来强制更改颜色，避开 CSS 优先级问题
const edgeStyle = computed(() => {
  if (isHighlighted.value) {
    const hoveredNode = workflowStore.nodes.find(n => n.id === workflowStore.hoveredNodeId);
    const highlightColor = hoveredNode?.data?.nodeColor || '#18a058';

    return {
      ...props.style,
      stroke: highlightColor,
      strokeWidth: 3,
      opacity: 1
    };
  }
  return props.style;
});

const isHovered = ref(false);
let hoverTimer: number | null = null;

function onMouseEnter() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  isHovered.value = true;
}

function onMouseLeave() {
  hoverTimer = window.setTimeout(() => {
    isHovered.value = false;
    hoverTimer = null;
  }, 200);
}

function deleteEdge() {
  const sourceNode = workflowStore.nodes.find(n => n.id === props.source);
  const targetNode = workflowStore.nodes.find(n => n.id === props.target);
  workflowStore.removeEdge(props.id);
  takeSnapshot(`删除[${sourceNode?.data?.nodeLabel}] 到 [${targetNode?.data?.nodeLabel}] 的连接`);
}
</script>

<template>
  <!-- Interaction Group: capture hover events -->
  <g class="custom-edge" :class="{ highlighted: isHighlighted }" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- Invisible Interaction Path (Thick) -->
    <path :d="path[0]" fill="none" stroke="transparent" stroke-width="20" class="interaction-path" />

    <!-- Visible Path -->
    <BaseEdge :path="path[0]" :style="edgeStyle" class="visible-path" :animated="isHighlighted" />

    <EdgeLabelRenderer>
      <div
        v-if="isHovered"
        class="nodrag nopan edge-button-container"
        :style="{
          transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`
        }"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <button
          class="h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform active:scale-95 hover:scale-110"
          @click="deleteEdge"
        >
          <SvgIcon local-icon="mdi-close" class="text-3" />
        </button>
      </div>
    </EdgeLabelRenderer>
  </g>
</template>

<style scoped>
.interaction-path {
  cursor: pointer;
}

.visible-path {
  stroke-width: 2;
  transition: all 0.2s;
}

/* When CustomEdge group is hovered, style the visible path */
.custom-edge:hover .visible-path {
  stroke: #555;
  stroke-width: 3;
}

.custom-edge.highlighted .visible-path {
  stroke: var(--primary-color, #18a058) !important;
  stroke-width: 3 !important;
}

.edge-button-container {
  pointer-events: all;
  position: absolute;
  z-index: 20;
}
</style>
