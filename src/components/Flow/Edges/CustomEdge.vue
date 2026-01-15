<script setup lang="ts">
import { computed, ref } from 'vue';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';
import type { EdgeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import SvgIcon from '@/components/custom/svg-icon.vue';

const props = defineProps<EdgeProps>();

const workflowStore = useWorkflowStore();

const path = computed(() => getBezierPath(props));

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
  workflowStore.removeEdge(props.id);
}
</script>

<template>
  <!-- Interaction Group: capture hover events -->
  <g class="custom-edge" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- Invisible Interaction Path (Thick) -->
    <path :d="path[0]" fill="none" stroke="transparent" stroke-width="20" class="interaction-path" />

    <!-- Visible Path -->
    <BaseEdge :path="path[0]" :style="props.style" class="visible-path" />

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
          <SvgIcon icon="mdi:close" class="text-3" />
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
.edge-button-container {
  pointer-events: all;
  position: absolute;
  z-index: 20;
}
</style>
