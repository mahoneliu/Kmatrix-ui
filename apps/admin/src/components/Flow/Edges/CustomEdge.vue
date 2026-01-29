<!-- eslint-disable -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';
import type { EdgeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { useHighlightEdge } from '@/composables/useHighlightEdge';


// 自定义 Edge Props 以支持 updatable 属性
// updatable 可以是 boolean 或 'source' | 'target' 字符串
interface CustomEdgeProps extends Omit<EdgeProps, 'updatable'> {
  updatable?: boolean | 'source' | 'target';
}

const props = defineProps<CustomEdgeProps>();
const { isEdgeHighlighted } = useHighlightEdge();
// 获取工作流状态管理实例
const workflowStore = useWorkflowStore();

// 计算贝塞尔曲线路径，用于绘制边的形状
const path = computed(() => getBezierPath(props));

// 跟踪鼠标是否悬停在边上
const isHovered = ref(false);
// 用于延迟处理悬停状态的定时器
let hoverTimer: number | null = null;

// 鼠标进入边的事件处理函数
function onMouseEnter() {
  // 清除之前的定时器
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  // 设置悬停状态为真
  isHovered.value = true;
}

// 鼠标离开边的事件处理函数
function onMouseLeave() {
  // 设置定时器，在200毫秒后取消悬停状态
  hoverTimer = window.setTimeout(() => {
    isHovered.value = false;
    hoverTimer = null;
  }, 200);
}

// 删除当前边的函数
function deleteEdge() {
  workflowStore.removeEdge(props.id);
}

</script>

<template>
  <!-- Interaction Group: 捕获鼠标悬停事件 -->
  <g class="custom-edge" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- 不可见的交互路径（较宽），用于扩大鼠标交互区域 -->
    <path :d="path[0]" fill="none" stroke="transparent" stroke-width="20" class="interaction-path" />

    <!-- Visible Path -->
    <BaseEdge :path="path[0]" :style="{stroke: isEdgeHighlighted(props.id),'stroke-width': isEdgeHighlighted(props.id) ? '3' : '2'}" />

    <!-- 边标签渲染器，用于在边上显示额外元素 -->
    <EdgeLabelRenderer>
      <!-- 当鼠标悬停在边上时，显示删除按钮 -->
      <div
        v-if="isHovered"
        class="nodrag nopan edge-button-container"
        :style="{
          transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`
        }"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <!-- 删除按钮，点击时删除当前边 -->
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
/* 交互路径样式：设置鼠标指针为手型 */
.interaction-path {
  cursor: pointer;
}
/* When CustomEdge group is hovered, style the visible path */
.custom-edge:hover .visible-path {
  stroke: #555;
  stroke-width: 3;
}
/* 边按钮容器样式：设置不可拖拽、不可平移，绝对定位和z-index */
.edge-button-container {
  pointer-events: all;
  position: absolute;
  z-index: 20;
}
</style>
