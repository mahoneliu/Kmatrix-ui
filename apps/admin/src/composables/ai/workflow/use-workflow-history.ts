/**
 * 工作流撤销重做 Composable
 * @author LHF
 * @date 2026-01-30
 */

import { computed, ref, watch } from 'vue';
import { createSharedComposable, useDebounceFn } from '@vueuse/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

export interface HistoryItem {
  snapshot: string;
  timestamp: number;
  label: string;
}

function formatVal(val: any): string {
  if (val === undefined || val === null || val === '') return '空';
  if (Array.isArray(val)) return `${val.length}项数组`;
  if (typeof val === 'object') return '对象值';
  const str = String(val);
  return str.length > 20 ? `${str.substring(0, 20)}...` : str;
}

function getDetailedDiffLabel(oldState: any, newState: any): string | null {
  try {
    if (oldState.nodes.length !== newState.nodes.length) {
      return oldState.nodes.length < newState.nodes.length ? '添加节点' : '删除节点';
    }

    for (const newNode of newState.nodes) {
      const oldNode = oldState.nodes.find((n: any) => n.id === newNode.id);
      if (!oldNode) continue;

      const nodeName = newNode.data?.nodeLabel || newNode.id;

      const newConfig = newNode.data?.config || {};
      const oldConfig = oldNode.data?.config || {};
      for (const key in newConfig) {
        const newVal = newConfig[key];
        const oldVal = oldConfig[key];
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          if (Array.isArray(newVal) && Array.isArray(oldVal)) {
            if (newVal.length !== oldVal.length) {
              return `[${nodeName}] 配置项 [${key}] 数量从 [${oldVal.length}] 改为 [${newVal.length}]`;
            }
            return `[${nodeName}] 配置项 [${key}] 内部数组项发生修改`;
          }
          return `[${nodeName}] 配置项 [${key}] 从 [${formatVal(oldVal)}] 改为 [${formatVal(newVal)}]`;
        }
      }
      for (const key in oldConfig) {
        if (!(key in newConfig)) {
          return `[${nodeName}] 移除配置项[${key}]`;
        }
      }

      let autoPopulatedKeyInfo: string | null = null;

      const checkParamDefsChange = (newDefs: any[] | undefined, oldDefs: any[] | undefined, typeName: string) => {
        const nDefs = newDefs || [];
        const oDefs = oldDefs || [];
        if (nDefs.length > oDefs.length) {
          return `[${nodeName}] 新增${typeName}`;
        }
        if (nDefs.length < oDefs.length) {
          return `[${nodeName}] 移除${typeName}`;
        }
        for (let i = 0; i < nDefs.length; i++) {
          const newDef = nDefs[i];
          const oldDef = oDefs[i];
          if (newDef.key !== oldDef.key) {
            if (!oldDef.key || oldDef.key.trim() === '') {
              autoPopulatedKeyInfo = `[${nodeName}] 设置${typeName}键名[${newDef.key}]`;
            } else {
              return `[${nodeName}] 修改${typeName}键名[${oldDef.key} -> ${newDef.key}]`;
            }
          } else if (JSON.stringify(newDef) !== JSON.stringify(oldDef)) {
            return `[${nodeName}] 修改${typeName}[${newDef.label || newDef.key || '未命名'}]配置`;
          }
        }
        return null;
      };

      const customInputDiff = checkParamDefsChange(
        newNode.data?.customInputParams,
        oldNode.data?.customInputParams,
        '自定义入参'
      );
      if (customInputDiff) return customInputDiff;

      const customOutputDiff = checkParamDefsChange(
        newNode.data?.customOutputParams,
        oldNode.data?.customOutputParams,
        '自定义出参'
      );
      if (customOutputDiff) return customOutputDiff;

      const newParams: any[] = newNode.data?.paramBindings || [];
      const oldParams: any[] = oldNode.data?.paramBindings || [];

      const formatBinding = (b: any) => {
        if (!b) return '空';
        if (b.sourceType === 'global') return `[全局.${b.sourceKey}.${b.sourceParam}]`;
        if (b.sourceType === 'node') {
          // 查找节点名称 (优先在新状态找，如果被删了去旧状态找)
          const sourceNode =
            newState.nodes.find((n: any) => n.id === b.sourceKey) ||
            oldState.nodes.find((n: any) => n.id === b.sourceKey);
          const nodeName = sourceNode?.data?.nodeLabel || b.sourceKey;
          return `[${nodeName}.${b.sourceParam}]`;
        }
        return JSON.stringify(b);
      };

      for (const newBinding of newParams) {
        const paramKey = newBinding.paramKey;
        const oldBinding = oldParams.find((p: any) => p.paramKey === paramKey);

        let paramName = paramKey;
        const paramDef = newNode.data?.customInputParams?.find((p: any) => p.key === paramKey);
        if (paramDef && paramDef.label) {
          paramName = paramDef.label;
        }

        if (JSON.stringify(newBinding) !== JSON.stringify(oldBinding)) {
          return `[${nodeName}] 入参 [${paramName}] 从 ${formatBinding(oldBinding)} 改为 ${formatBinding(newBinding)}`;
        }
      }
      for (const oldBinding of oldParams) {
        const paramKey = oldBinding.paramKey;
        if (!newParams.find((p: any) => p.paramKey === paramKey)) {
          let paramName = paramKey;
          const paramDef = oldNode.data?.customInputParams?.find((p: any) => p.key === paramKey);
          if (paramDef && paramDef.label) {
            paramName = paramDef.label;
          }
          return `[${nodeName}] 移除入参[${paramName}]`;
        }
      }

      if (autoPopulatedKeyInfo) {
        return autoPopulatedKeyInfo;
      }
    }

    if (oldState.edges.length !== newState.edges.length) {
      return oldState.edges.length < newState.edges.length ? '添加连线' : '删除连线';
    }

    for (const newEdge of newState.edges) {
      const oldEdge = oldState.edges.find((e: any) => e.id === newEdge.id);
      if (!oldEdge) continue;

      const newCond = newEdge.data?.condition;
      const oldCond = oldEdge.data?.condition;
      if (JSON.stringify(newCond) !== JSON.stringify(oldCond)) {
        return `连线条件变更`;
      }
    }
  } catch (e) {
    console.error('Failed to generate diff label:', e);
  }
  return null;
}

export const useWorkflowHistory = createSharedComposable(() => {
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

    if ((label === '更新配置' || label === '节点变更') && currentIndex.value >= 0) {
      const oldState = JSON.parse(historyStack.value[currentIndex.value].snapshot);
      const newState = JSON.parse(snapshot);
      const diffLabel = getDetailedDiffLabel(oldState, newState);
      if (diffLabel) {
        label = diffLabel;
      }
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
      currentIndex.value += 1;
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
      // eslint-disable-next-line no-console
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
    currentIndex.value -= 1;
    applySnapshot(historyStack.value[currentIndex.value].snapshot);
  };

  /**
   * 重做
   */
  const redo = () => {
    if (!canRedo.value) return;
    currentIndex.value += 1;
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
    [() => JSON.parse(JSON.stringify(workflowStore.nodes)), () => JSON.parse(JSON.stringify(workflowStore.edges))],
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
});
