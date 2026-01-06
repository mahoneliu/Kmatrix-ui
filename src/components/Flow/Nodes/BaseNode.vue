<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NDropdown } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props extends NodeProps {
  id: string;
  data: Workflow.NodeData;
  selected: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  nodeClick: [id: string];
  deleteNode: [id: string];
  duplicateNode: [id: string];
  sourceHandleClick: [event: MouseEvent, id: string];
}>();

const workflowStore = useWorkflowStore();

// 检查连接状态
const hasSourceConnection = computed(() => {
  return workflowStore.edges.some(e => e.source === props.id);
});

// 折叠状态
const collapsed = ref(false);

// Handle 显示状态（用于延时隐藏）
const showHandles = ref(false);
let handleHideTimer: number | null = null;

// 菜单选项
const menuOptions: DropdownOption[] = [
  {
    label: '复制节点',
    key: 'duplicate',
    icon: () => h(SvgIcon, { icon: 'mdi:content-copy', class: 'text-18px' })
  },
  {
    label: '删除节点',
    key: 'delete',
    icon: () => h(SvgIcon, { icon: 'mdi:delete-outline', class: 'text-18px' })
  }
];

// 计算样式类
const statusClass = computed(() => {
  const classes = [];
  if (props.selected) classes.push('selected');
  return classes.join(' ');
});

// 根据节点类型获取颜色
const nodeColor = computed(() => {
  const colorMap: Record<Workflow.NodeType, string> = {
    APP_INFO: '#10b981',
    START: '#10b981',
    END: '#ef4444',
    LLM_CHAT: '#3b82f6',
    INTENT_CLASSIFIER: '#8b5cf6',
    CONDITION: '#f59e0b',
    FIXED_RESPONSE: '#6b7280'
  };
  return colorMap[props.data.type] || '#6b7280';
});

function handleClick() {
  emit('nodeClick', props.id);
}

function toggleCollapse(e: Event) {
  e.stopPropagation();
  collapsed.value = !collapsed.value;
}

function handleMenuSelect(key: string) {
  if (key === 'delete') {
    emit('deleteNode', props.id);
  } else if (key === 'duplicate') {
    emit('duplicateNode', props.id);
  }
}

function handleSourceHandleClick(e: MouseEvent) {
  e.stopPropagation();
  emit('sourceHandleClick', e, props.id);
}

// 鼠标进入节点
function handleMouseEnter() {
  if (handleHideTimer) {
    clearTimeout(handleHideTimer);
    handleHideTimer = null;
  }
  showHandles.value = true;
}

// 鼠标离开节点
function handleMouseLeave() {
  if (hasSourceConnection.value) {
    showHandles.value = false;
    return;
  }
  handleHideTimer = window.setTimeout(() => {
    showHandles.value = false;
  }, 1000);
}
</script>

<template>
  <div
    class="workflow-node min-w-45 cursor-pointer rounded-2 b-solid bg-white p-3 shadow-sm transition-all dark:bg-dark-2 hover:shadow-md"
    :class="[statusClass, selected ? 'b-2' : 'b-1 hover:b-2', { 'handles-visible': showHandles || selected }]"
    :style="{ borderColor: nodeColor }"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 输入连接点 (左侧) -->
    <Handle
      v-if="data.type !== 'START' && data.type !== 'APP_INFO'"
      :position="Position.Left"
      type="target"
      :connectable-start="false"
      :connectable-end="true"
      class="custom-handle custom-handle-target"
    />

    <!-- 节点头部 -->
    <div class="flex items-center gap-2 text-3.5 c-gray-8 font-600 dark:c-gray-1">
      <SvgIcon v-if="data.icon" :icon="data.icon" class="h-5 w-5" />
      <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ data.label }}</span>
      <!-- 操作菜单 -->
      <NDropdown
        v-if="data.type !== 'APP_INFO'"
        :options="menuOptions"
        trigger="click"
        placement="bottom-end"
        @select="handleMenuSelect"
      >
        <button
          class="h-5 w-5 flex items-center justify-center rounded bg-white transition-colors dark:bg-dark-3 hover:bg-gray-1 dark:hover:bg-dark-4"
          @click.stop
        >
          <SvgIcon icon="mdi:dots-vertical" class="text-4 c-gray-5" />
        </button>
      </NDropdown>
      <!-- 折叠按钮 -->
      <button
        v-if="$slots.default"
        class="h-5 w-5 flex items-center justify-center rounded bg-white transition-colors dark:bg-dark-3 hover:bg-gray-1 dark:hover:bg-dark-4"
        @click="toggleCollapse"
      >
        <SvgIcon :icon="collapsed ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="text-4 c-gray-5" />
      </button>
    </div>

    <!-- 节点内容插槽 -->
    <div
      v-if="!collapsed && $slots.default"
      class="mt-2 b-t b-gray-2 b-solid pt-2 text-3 c-gray-5 dark:b-dark-3 dark:c-gray-4"
    >
      <slot />
    </div>

    <!-- 状态指示器 -->
    <div
      v-if="data.status && data.status !== 'idle'"
      class="absolute h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-md -right-2 -top-2 dark:bg-dark-2"
    >
      <div v-if="data.status === 'running'" class="i-mdi:loading animate-spin c-blue-5" />
      <div v-else-if="data.status === 'success'" class="i-mdi:check-circle c-green-5" />
      <div v-else-if="data.status === 'error'" class="i-mdi:alert-circle c-red-5" />
    </div>

    <!-- 输出连接点 (右侧) -->
    <Handle
      v-if="data.type !== 'END' && data.type !== 'APP_INFO'"
      :position="Position.Right"
      type="source"
      class="custom-handle custom-handle-source"
      :class="[{ 'show-plus': !hasSourceConnection }, { 'handles-visible': showHandles || selected }]"
      @click="handleSourceHandleClick"
    />
  </div>
</template>

<style scoped>
/* Handle 基础样式 - 默认隐藏 */
.workflow-node :deep(.vue-flow__handle.custom-handle) {
  width: 0px !important;
  height: 0px !important;
  border-radius: 50% !important;
}

/* Hover 或 Selected 或 JavaScript 控制时显示完整 Handle */
.workflow-node.handles-visible :deep(.vue-flow__handle.custom-handle.custom-handle-source) {
  right: -10px !important; /* 向外突出 */
  width: 20px !important;
  height: 20px !important;
  border: 2px solid !important;
  opacity: 1 !important;
  border-color: #9ba0a1 !important;
}

/* 显示状态下 Target Handle 样式和位置 */
.workflow-node.handles-visible :deep(.vue-flow__handle.custom-handle-target) {
  background: #9ba0a1 !important;
  pointer-events: none !important;
}

/* 加号样式 (无连接时显示) */
.workflow-node.handles-visible :deep(.vue-flow__handle.custom-handle.show-plus)::after {
  content: '+';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #9ca3af;
}

/* 加号样式 (无连接时显示) */
/* :deep(.vue-flow__handle.custom-handle.show-plus)::after {
  content: '';
} */
</style>
