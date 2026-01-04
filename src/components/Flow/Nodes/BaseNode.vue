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
}>();

const workflowStore = useWorkflowStore();

// 检查连接状态
const hasSourceConnection = computed(() => {
  return workflowStore.edges.some(e => e.source === props.id);
});

const hasTargetConnection = computed(() => {
  return workflowStore.edges.some(e => e.target === props.id);
});

// 折叠状态
const collapsed = ref(false);

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

// 根据状态计算样式类
const statusClass = computed(() => {
  const status = props.data.status || 'idle';
  const classes = [`status-${status}`];
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
</script>

<template>
  <div
    class="workflow-node min-w-45 cursor-pointer rounded-2 b-solid bg-white p-3 shadow-sm transition-all dark:bg-dark-2 hover:shadow-md"
    :class="[statusClass, selected ? 'b-2' : 'b-1 hover:b-2']"
    :style="{ borderColor: nodeColor }"
    @click="handleClick"
  >
    <!-- 输入连接点 (左侧) -->
    <Handle
      v-if="data.type !== 'START' && data.type !== 'APP_INFO'"
      :position="Position.Left"
      type="target"
      class="custom-handle"
      :class="{ 'show-plus': !hasTargetConnection }"
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
          class="h-5 w-5 flex items-center justify-center rounded transition-colors hover:bg-gray-1 dark:hover:bg-dark-3"
          @click.stop
        >
          <SvgIcon icon="mdi:dots-vertical" class="text-4 c-gray-5" />
        </button>
      </NDropdown>
      <!-- 折叠按钮 -->
      <button
        v-if="$slots.default"
        class="h-5 w-5 flex items-center justify-center rounded transition-colors hover:bg-gray-1 dark:hover:bg-dark-3"
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
      class="custom-handle"
      :class="{ 'show-plus': !hasSourceConnection }"
    />
  </div>
</template>

<style scoped>
/* Handle 基础样式 */
:deep(.vue-flow__handle.custom-handle) {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #9ca3af; /* gray-400 */
  border-radius: 50%;
  opacity: 0; /* 默认隐藏 */
  transition: all 0.2s;
  z-index: 10;
}

/* Hover 或 Selected 时显示 Handle */
.workflow-node:hover :deep(.vue-flow__handle),
.workflow-node.selected :deep(.vue-flow__handle) {
  opacity: 1;
}

/* 加上加号的样式 (无连接时) */
:deep(.vue-flow__handle.custom-handle.show-plus)::after {
  content: '+';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: #9ca3af;
  line-height: 1;
  pointer-events: none;
}

:deep(.vue-flow__handle.custom-handle.show-plus) {
  width: 14px;
  height: 14px;
  border-width: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb; /* gray-50 */
}

/* 运行状态动画 - 保留少量原生 CSS 用于动画 */
.workflow-node.status-running {
  border-width: 3px;
  animation: pulse 2s infinite;
}

.workflow-node.status-success {
  border-color: #10b981 !important;
}

.workflow-node.status-error {
  border-color: #ef4444 !important;
  animation: shake 0.5s;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
</style>
