/**
 * Workflow 布局管理 Composable
 *
 * 负责处理工作流画布的布局相关功能:
 * - 自动布局
 * - 适应视图
 * - 折叠/展开节点
 */

import type { Ref } from 'vue';
import type { MessageApi } from 'naive-ui';
import type { WorkflowStore } from '@/store/modules/workflow';
import { getLayoutedElements } from '@/utils/workflow/layout-helper';

export interface UseWorkflowLayoutOptions {
  workflowStore: WorkflowStore;
  vueFlowInstance: Ref<any>;
  getNodes: Ref<any[]>;
  message: MessageApi;
}

export function useWorkflowLayout(options: UseWorkflowLayoutOptions) {
  const { workflowStore, vueFlowInstance, getNodes, message } = options;

  /**
   * 适应画布视图
   */
  function handleFitView() {
    if (vueFlowInstance.value) {
      vueFlowInstance.value.fitView({ padding: 0.2, duration: 200 });
    }
  }

  /**
   * 自动布局节点
   */
  function handleAutoLayout() {
    if (workflowStore.nodes.length === 0) {
      message.warning('没有节点需要布局');
      return;
    }

    // 从 Vue Flow 获取包含实时尺寸(dimensions)的节点数据
    // 这样可以根据节点当前的实际大小(包括折叠/展开状态)进行布局
    const currentNodes = getNodes.value;

    const { nodes: layoutedNodes } = getLayoutedElements(currentNodes, workflowStore.edges, {
      direction: 'LR', // 从左到右
      nodeSpacing: 80,
      rankSpacing: 200
    });

    workflowStore.setNodes(layoutedNodes);

    // 布局后自动适应画布
    setTimeout(() => {
      handleFitView();
    }, 50);

    message.success('布局优化完成');
  }

  /**
   * 折叠所有节点
   */
  function handleCollapseAll() {
    workflowStore.setCollapseAllNodes(true);
    message.success('已折叠所有节点');
  }

  /**
   * 展开所有节点
   */
  function handleExpandAll() {
    workflowStore.setCollapseAllNodes(false);
    message.success('已展开所有节点');
  }

  /**
   * 折叠并布局
   */
  function handleCollapseAndLayout() {
    if (workflowStore.nodes.length === 0) {
      message.warning('没有节点需要布局');
      return;
    }

    // 先折叠所有节点
    workflowStore.setCollapseAllNodes(true);

    // 等待折叠动画完成后再布局
    // 延长等待时间以确保 DOM 更新和 dimensions 重新计算
    setTimeout(() => {
      handleAutoLayout();
    }, 400);
  }

  return {
    handleFitView,
    handleAutoLayout,
    handleCollapseAll,
    handleExpandAll,
    handleCollapseAndLayout
  };
}
