<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

interface Props extends NodeProps {
  id: string; // 显式声明以消除 Vue lint 警告
  data: Workflow.NodeData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  nodeClick: [id: string];
}>();

// 根据状态计算样式类
const statusClass = computed(() => {
  const status = props.data.status || 'idle';
  return `status-${status}`;
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
</script>

<template>
  <div class="workflow-node" :class="[statusClass]" :style="{ borderColor: nodeColor }" @click="handleClick">
    <!-- 输入连接点 -->
    <Handle v-if="data.type !== 'START' && data.type !== 'APP_INFO'" :position="Position.Top" type="target" />

    <!-- 节点头部 -->
    <div class="node-header">
      <SvgIcon v-if="data.icon" :icon="data.icon" class="node-icon" />
      <span class="node-label">{{ data.label }}</span>
    </div>

    <!-- 节点内容插槽 -->
    <div v-if="$slots.default" class="node-body">
      <slot />
    </div>

    <!-- 状态指示器 -->
    <div v-if="data.status && data.status !== 'idle'" class="status-indicator">
      <div v-if="data.status === 'running'" class="i-mdi:loading animate-spin" />
      <div v-else-if="data.status === 'success'" class="i-mdi:check-circle text-green-500" />
      <div v-else-if="data.status === 'error'" class="i-mdi:alert-circle text-red-500" />
    </div>

    <!-- 输出连接点 -->
    <Handle v-if="data.type !== 'END' && data.type !== 'APP_INFO'" :position="Position.Bottom" type="source" />
  </div>
</template>

<style scoped>
.workflow-node {
  min-width: 180px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: white;
  padding: 12px;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.workflow-node:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.workflow-node.status-running {
  border-width: 3px;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
  animation: pulse 2s infinite;
}

.workflow-node.status-success {
  border-color: #10b981 !important;
}

.workflow-node.status-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.node-icon {
  width: 20px;
  height: 20px;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-body {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}

.status-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
</style>
