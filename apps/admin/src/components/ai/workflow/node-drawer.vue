<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeComponents } from '@/composables/ai/workflow/use-node-components';
import { getNodeIconBackground } from '@/utils/color';
import AppInfoNode from '@/components/ai/Nodes/appInfo-node.vue';
import { DRAWER_EXPANDED_KEY, DRAWER_RENDER_KEY } from './drawer-context';

/** 抽屉最小宽度 */
const MIN_WIDTH = 320;
/** 抽屉最大宽度 */
const MAX_WIDTH = 900;
/** 抽屉默认宽度 */
const DEFAULT_WIDTH = 480;

const workflowStore = useWorkflowStore();
const { getNodeComponent } = useNodeComponents({ appInfoComponent: AppInfoNode });

const drawerWidth = ref(DEFAULT_WIDTH);
const isDragging = ref(false);
let startX = 0;
let startWidth = 0;

const isOpen = computed(() => Boolean(workflowStore.selectedNodeId));

const activeNode = computed(() => {
  if (!workflowStore.selectedNodeId) return null;
  return workflowStore.nodes.find(n => n.id === workflowStore.selectedNodeId) ?? null;
});

const nodeComponent = computed(() => {
  if (!activeNode.value) return null;
  return getNodeComponent(activeNode.value.data.nodeType);
});

function close() {
  workflowStore.selectNode(null);
}

// 拖拽调整宽度
function onResizeMouseDown(e: MouseEvent) {
  isDragging.value = true;
  startX = e.clientX;
  startWidth = drawerWidth.value;
  document.addEventListener('mousemove', onResizeMouseMove);
  document.addEventListener('mouseup', onResizeMouseUp);
  e.preventDefault();
}

function onResizeMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const delta = startX - e.clientX; // 向左拖 = 变宽
  const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
  drawerWidth.value = newWidth;
}

function onResizeMouseUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onResizeMouseMove);
  document.removeEventListener('mouseup', onResizeMouseUp);
}

// 关闭时重置宽度
watch(isOpen, open => {
  if (!open) drawerWidth.value = DEFAULT_WIDTH;
});

// 向子组件注入"当前是抽屉渲染上下文"
provide(DRAWER_RENDER_KEY, true);
// 向子组件注入"抽屉模式下自动展开所有折叠面板"
provide(DRAWER_EXPANDED_KEY, true);
</script>

<template>
  <Transition name="node-drawer">
    <div v-if="isOpen && activeNode" class="node-drawer-container" :style="{ width: `${drawerWidth}px` }">
      <!-- 左侧拖拽条 -->
      <div class="node-drawer-resize-handle" :class="{ dragging: isDragging }" @mousedown="onResizeMouseDown" />

      <!-- 抽屉头部 -->
      <div class="node-drawer-header" :style="{ borderBottomColor: activeNode.data.nodeColor || '#e5e7eb' }">
        <div class="min-w-0 flex items-center gap-2">
          <div
            class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-1"
            :style="{
              backgroundColor: getNodeIconBackground(activeNode.data.nodeColor),
              color: activeNode.data.nodeColor
            }"
          >
            <SvgIcon v-if="activeNode.data.nodeIcon" :local-icon="activeNode.data.nodeIcon" />
            <SvgIcon v-else local-icon="mdi-file-document-outline" />
          </div>
          <span class="truncate text-sm text-gray-800 font-semibold dark:text-gray-100">
            {{ activeNode.data.nodeLabel }}
          </span>
        </div>
        <button class="node-drawer-close-btn" @click="close">
          <SvgIcon local-icon="mdi-close" class="text-base" />
        </button>
      </div>

      <!-- 抽屉内容：渲染节点组件（抽屉模式下节点组件自身不渲染外壳） -->
      <div class="node-drawer-body nodrag nowheel">
        <div class="drawer-content-wrapper">
          <component
            :is="nodeComponent"
            v-if="nodeComponent"
            v-bind="{
              id: activeNode.id,
              type: activeNode.type,
              data: activeNode.data,
              selected: false,
              position: activeNode.position ?? { x: 0, y: 0 },
              dimensions: activeNode.dimensions ?? { width: 0, height: 0 },
              zIndex: 0,
              connectable: false,
              draggable: false,
              selectable: false,
              focusable: false,
              isParent: false,
              initialized: true,
              drawerMode: true,
              dragging: false,
              resizing: false,
              events: {}
            }"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.node-drawer-container {
  position: absolute;
  top: 56px; /* 与右上角操作按钮栏底部对齐 */
  right: 8px;
  bottom: 8px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  background: var(--node-drawer-bg, #fff);
  box-shadow:
    -2px 0 20px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--node-drawer-border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  overflow: hidden;
  color: var(--node-drawer-color, #1f2937);
}

.node-drawer-resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.15s;
}

.node-drawer-resize-handle:hover,
.node-drawer-resize-handle.dragging {
  background: rgba(99, 102, 241, 0.25);
}

.node-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px 6px 12px;
  border-bottom: 2px solid var(--node-drawer-header-border, #e5e7eb);
  flex-shrink: 0;
  gap: 6px;
  background: var(--node-drawer-bg, #fff);
}

.node-drawer-close-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.node-drawer-close-btn:hover {
  background: var(--node-drawer-btn-hover, #f3f4f6);
  color: var(--node-drawer-btn-hover-color, #374151);
}

.node-drawer-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 14px 14px 14px;
  background: var(--node-drawer-bg, #fff);
}

/* 内容包裹层：撑满宽度 */
.drawer-content-wrapper {
  width: 100%;
  box-sizing: border-box;
}

/* 覆盖节点 slot 内的所有固定宽度 div（w-93 / w-85 / w-80 / w-60 等） */
.drawer-content-wrapper :deep(> div[class*='w-']) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: unset !important;
  box-sizing: border-box;
}

/* 覆盖 :deep(.workflow-node) 的 min/max-width（各节点 scoped style 里设置的） */
.drawer-content-wrapper :deep(.workflow-node) {
  min-width: unset !important;
  max-width: unset !important;
  width: 100% !important;
}

/* 常见表单控件铺满 */
.drawer-content-wrapper :deep(.n-select),
.drawer-content-wrapper :deep(.n-input),
.drawer-content-wrapper :deep(.n-input-number),
.drawer-content-wrapper :deep(.n-collapse),
.drawer-content-wrapper :deep(.workflow-config-section),
.drawer-content-wrapper :deep(.workflow-config-item) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: unset !important;
  box-sizing: border-box;
}

/* 过渡动画 */
.node-drawer-enter-active,
.node-drawer-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.node-drawer-enter-from,
.node-drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

<!-- 全局样式：覆盖抽屉内节点的固定宽度（不能用 scoped，因为内容来自子组件 slot） -->
<style>
/* 深色模式下抽屉 CSS 变量覆盖 */
html.dark .node-drawer-container {
  --node-drawer-bg: #1e1e2e;
  --node-drawer-border: rgba(255, 255, 255, 0.08);
  --node-drawer-color: #e5e7eb;
  --node-drawer-header-border: rgba(255, 255, 255, 0.1);
  --node-drawer-btn-hover: rgba(255, 255, 255, 0.1);
  --node-drawer-btn-hover-color: #e5e7eb;
  box-shadow:
    -2px 0 20px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.3);
}

.drawer-content-wrapper .w-93,
.drawer-content-wrapper .w-85,
.drawer-content-wrapper .w-80,
.drawer-content-wrapper .w-60,
.drawer-content-wrapper .w-full {
  width: 100% !important;
  max-width: 100% !important;
  min-width: unset !important;
  box-sizing: border-box;
}

/* 覆盖各节点 scoped style 里的 :deep(.workflow-node) min/max-width */
.drawer-content-wrapper .workflow-node {
  min-width: unset !important;
  max-width: unset !important;
  width: 100% !important;
}
</style>
