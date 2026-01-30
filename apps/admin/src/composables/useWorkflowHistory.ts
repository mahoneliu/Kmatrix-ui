/**
 * 工作流撤销重做 Composable
 * @author LHF
 * @date 2026-01-30
 */

import { computed, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useWorkflowStore } from '@/store/modules/workflow';

export interface HistoryItem {
  snapshot: string;
  timestamp: number;
  label: string;
}

export function useWorkflowHistory() {
  const workflowStore = useWorkflowStore();
  const historyStack = ref<HistoryItem[]>([]);
  const currentIndex = ref(-1);
  const maxHistory = 50;

  // 内部标记，防止在撤销/重做应用状态时又记录快照
  let isInnerStateChange = false;

  const canUndo = computed(() => currentIndex.value > 0);
  const canRedo = computed(() => currentIndex.value < historyStack.value.length - 1);

  /**
   * 清理数据并序列化为快照
   */
  const getCleanSnapshot = () => {
    const nodes = workflowStore.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: { ...n.position },
      data: JSON.parse(JSON.stringify(n.data))
    }));

    const edges = workflowStore.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: e.type,
      animated: e.animated,
      label: e.label,
      data: JSON.parse(JSON.stringify(e.data)),
      updatable: e.updatable
    }));

    return JSON.stringify({ nodes, edges });
  };

  /**
   * 记录当前状态到历史栈
   */
  const takeSnapshot = (label: string = '未知操作') => {
    if (isInnerStateChange) return;

    const snapshot = getCleanSnapshot();

    // 如果与当前状态完全一致，则不记录
    if (currentIndex.value >= 0 && historyStack.value[currentIndex.value].snapshot === snapshot) {
      return;
    }

    // 如果在历史中间进行新操作，删除“未来”记录
    if (currentIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, currentIndex.value + 1);
    }

    historyStack.value.push({
      snapshot,
      timestamp: Date.now(),
      label
    });

    if (historyStack.value.length > maxHistory) {
      historyStack.value.shift();
    } else {
      currentIndex.value++;
    }
  };

  /**
   * 将快照应用到当前 Store
   */
  const applySnapshot = (snapshotStr: string) => {
    isInnerStateChange = true;
    try {
      const { nodes: newNodes, edges: newEdges } = JSON.parse(snapshotStr);
      workflowStore.setNodes(newNodes);
      workflowStore.setEdges(newEdges);
      workflowStore.markDirty();
    } catch (e) {
      console.error('Failed to apply workflow snapshot:', e);
    } finally {
      setTimeout(() => {
        isInnerStateChange = false;
      }, 0);
    }
  };

  /**
   * 撤销
   */
  const undo = () => {
    if (!canUndo.value) return;
    currentIndex.value--;
    applySnapshot(historyStack.value[currentIndex.value].snapshot);
  };

  /**
   * 重做
   */
  const redo = () => {
    if (!canRedo.value) return;
    currentIndex.value++;
    applySnapshot(historyStack.value[currentIndex.value].snapshot);
  };

  /**
   * 跳转到特定历史记录
   */
  const jumpToHistory = (index: number) => {
    if (index < 0 || index >= historyStack.value.length) return;
    currentIndex.value = index;
    applySnapshot(historyStack.value[currentIndex.value].snapshot);
  };

  /**
   * 初始化历史记录
   */
  const initHistory = () => {
    historyStack.value = [
      {
        snapshot: getCleanSnapshot(),
        timestamp: Date.now(),
        label: '初始化'
      }
    ];
    currentIndex.value = 0;
  };

  // 防抖记录快照
  const debouncedSnapshot = useDebounceFn((label: string) => {
    takeSnapshot(label);
  }, 1000);

  // 监听关键数据的深层变化
  watch(
    [
      () => workflowStore.nodes.map(n => n.data?.config),
      () => workflowStore.nodes.map(n => n.data?.paramBindings),
      () => workflowStore.edges.map(e => e.data?.condition)
    ],
    (_newVal, oldVal) => {
      if (currentIndex.value >= 0 && !isInnerStateChange) {
        let label = '更新配置';
        if (oldVal && oldVal[0] && oldVal[0].length !== workflowStore.nodes.length) {
          label = '节点变更';
        }
        debouncedSnapshot(label);
      }
    },
    { deep: true }
  );

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    historyStack,
    currentIndex,
    takeSnapshot,
    jumpToHistory,
    initHistory
  };
}
