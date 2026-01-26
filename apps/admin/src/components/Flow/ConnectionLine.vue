<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Position } from '@vue-flow/core';
import { getBezierPath, useVueFlow } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { isValidConnection } from '@/utils/workflow/connection-rules';

// 定义组件接收的 props - 使用 Vue Flow 实际传递的 prop 名称
const props = defineProps<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  connectionStatus?: 'valid' | 'invalid' | null;
}>();

const { findNode, connectionStartHandle } = useVueFlow();
const workflowStore = useWorkflowStore();

// 跟踪真实的鼠标屏幕坐标(Client Coordinates)用于 elementsFromPoint
const mousePosition = ref({ x: 0, y: 0 });

const updateMousePosition = (e: MouseEvent) => {
  mousePosition.value = { x: e.clientX, y: e.clientY };
};

onMounted(() => {
  window.addEventListener('mousemove', updateMousePosition);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMousePosition);
});

// 计算当前鼠标下的节点（不依赖于 handle）
const hoveredNode = computed(() => {
  try {
    const mouseX = mousePosition.value.x;
    const mouseY = mousePosition.value.y;

    if (mouseX === 0 && mouseY === 0) return null;

    const elements = document.elementsFromPoint(mouseX, mouseY);
    if (!elements || elements.length === 0) return null;

    const nodeEl = elements.find(el => el?.classList?.contains('vue-flow__node'));
    if (!nodeEl) return null;

    const nodeId = nodeEl.getAttribute('data-id') || '';
    if (!nodeId) return null;
    return findNode(nodeId);
  } catch {
    return null;
  }
});

// 综合判断连接状态
const currentConnectionStatus = computed(() => {
  // 1. 如果 Vue Flow 已经给出了状态，直接使用
  if (props.connectionStatus) {
    return props.connectionStatus;
  }

  // 2. 如果没有状态，手动检查当前 hover 的节点
  const targetNode = hoveredNode.value;
  if (!targetNode) return null;

  // 获取源节点信息
  const sourceHandle = connectionStartHandle.value;
  if (!sourceHandle?.nodeId) return null;

  const sourceNode = findNode(sourceHandle.nodeId);
  if (!sourceNode) return null;

  // 基础规则检查
  // 不允许自连
  if (sourceNode.id === targetNode.id) return 'invalid';

  // 目标节点类型检查
  // START 和 APP_INFO 节点没有 target handle，不允许作为目标
  if (['START', 'APP_INFO'].includes(targetNode.data?.nodeType)) return 'invalid';

  // 类型兼容性检查
  const sourceType = sourceNode.data?.nodeType;
  const targetType = targetNode.data?.nodeType;

  if (sourceType && targetType && !isValidConnection(sourceType, targetType)) {
    return 'invalid';
  }

  // 重复连接检查
  const exists = workflowStore.edges.some(
    e =>
      e.id !== workflowStore.updatingEdgeId && // 排除正在更新的边
      e.source === sourceNode.id &&
      e.target === targetNode.id &&
      (e.sourceHandle === sourceHandle.id || (!e.sourceHandle && !sourceHandle.id))
  );

  if (exists) return 'invalid';

  return 'valid';
});

// 查找鼠标位置下的目标节点,并找到其 target handle 进行磁吸
const nearestHandlePosition = computed(() => {
  // 如果连接状态无效，禁用磁吸
  if (currentConnectionStatus.value === 'invalid') {
    return null;
  }

  try {
    const node = hoveredNode.value;
    if (!node || !node.position || !node.dimensions) {
      return null;
    }

    // START 和 APP_INFO 节点不能作为目标
    if (node.data?.nodeType === 'START' || node.data?.nodeType === 'APP_INFO') {
      return null;
    }

    // 计算 target handle 的位置 (左侧垂直居中)
    const handleX = node.position.x;
    const handleY = node.position.y + node.dimensions.height / 2;

    return {
      x: handleX,
      y: handleY
    };
  } catch {
    return null;
  }
});

// 计算连接线路径
const connectionPath = computed(() => {
  try {
    const targetPos = nearestHandlePosition.value;
    const targetX = targetPos ? targetPos.x : props.targetX;
    const targetY = targetPos ? targetPos.y : props.targetY;

    const [path] = getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX,
      targetY,
      targetPosition: props.targetPosition
    });

    return path;
  } catch {
    return `M ${props.sourceX},${props.sourceY} L ${props.targetX},${props.targetY}`;
  }
});
</script>

<template>
  <g class="connection-line-container">
    <path
      :d="connectionPath"
      fill="none"
      :stroke="currentConnectionStatus === 'invalid' ? '#ff4d4f' : '#b1b1b7'"
      stroke-width="2"
      class="animated"
    />
  </g>
</template>

<style scoped>
.animated {
  animation: dash 0.5s linear infinite;
  stroke-dasharray: 5, 5;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

.connection-line-container {
  pointer-events: none;
}
</style>
