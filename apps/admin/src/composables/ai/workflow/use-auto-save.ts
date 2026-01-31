/**
 * 工作流自动保存 Composable
 * @author Mahone
 * @date 2026-01-16
 */

import { watch } from 'vue';
import { useDebounceFn, useDocumentVisibility } from '@vueuse/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

/**
 * 自动保存 Hook
 *
 * 核心机制：
 * 1. 精确监听关键数据变化（节点/边数量、配置、参数绑定等），触发防抖保存
 * 2. 使用初始化标志避免首次加载时触发保存
 * 3. 监听页面失焦，立即保存未保存的更改
 *
 * @param saveCallback 保存回调函数
 * @returns 启用监听的函数
 */
export function useAutoSave(saveCallback: () => Promise<void>) {
  const workflowStore = useWorkflowStore();
  const visibility = useDocumentVisibility();
  let isInitialized = false; // 标记是否完成初始化

  // 防抖保存函数（3秒）
  const debouncedSave = useDebounceFn(async () => {
    if (!workflowStore.autoSaveEnabled || !workflowStore.isDirty) {
      return;
    }
    await saveCallback();
  }, 3000);

  // 1. 精确监听关键数据变化
  watch(
    [
      () => workflowStore.nodes.length, // 节点数量
      () => workflowStore.edges.length, // 边数量
      () => workflowStore.nodes.map(n => n.data?.config), // 节点配置
      () => workflowStore.nodes.map(n => n.data?.paramBindings), // 参数绑定
      () => workflowStore.nodes.map(n => n.data?.customInputParams), // 自定义输入参数
      () => workflowStore.nodes.map(n => n.data?.customOutputParams), // 自定义输出参数
      () => workflowStore.nodes.map(n => n.position), // 节点位置
      () => workflowStore.edges.map(e => e.data?.condition) // 边的条件表达式
    ],
    () => {
      // 只有在初始化完成后才触发保存
      if (isInitialized) {
        workflowStore.markDirty();
        debouncedSave();
      }
    },
    { deep: true }
  );

  // 2. 失焦保存 - 辅助机制
  watch(visibility, async (current, previous) => {
    // 页面从可见变为隐藏时保存
    if (previous === 'visible' && current === 'hidden') {
      if (isInitialized && workflowStore.isDirty && workflowStore.autoSaveEnabled) {
        await saveCallback();
      }
    }
  });

  /**
   * 启用自动保存（在数据加载完成后调用）
   */
  const enableAutoSave = () => {
    isInitialized = true;
  };

  return {
    enableAutoSave
  };
}
