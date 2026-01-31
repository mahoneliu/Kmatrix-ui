/**
 * Workflow 连接管理 Composable
 *
 * 负责处理工作流节点之间的连接逻辑,包括:
 * - 连接验证
 * - 条件生成
 * - Handle 查找
 * - 连接创建
 */

import type { Ref } from 'vue';
import type { MessageApi } from 'naive-ui';
import type { Connection } from '@vue-flow/core';
import type { useWorkflowStore } from '@/store/modules/ai/workflow';
import { isValidConnection } from '@/utils/ai/connection-rules';

type WorkflowStore = ReturnType<typeof useWorkflowStore>;

export interface UseWorkflowConnectionOptions {
  workflowStore: WorkflowStore;
  vueFlowInstance: Ref<any>;
  message: MessageApi;
}

export interface ConnectionDropData {
  targetNodeId: string;
  nodeEl: Element;
  handleEl: Element | null | undefined;
}

export function useWorkflowConnection(options: UseWorkflowConnectionOptions) {
  const { workflowStore } = options;

  /**
   * 验证连接是否允许
   */
  function validateConnection(connection: Connection, ignoreEdgeId?: string): boolean {
    const sourceNode = workflowStore.nodes.find((n: any) => n.id === connection.source);
    const targetNode = workflowStore.nodes.find((n: any) => n.id === connection.target);

    if (!sourceNode || !targetNode) return false;

    const sourceType = sourceNode.data.nodeType as Workflow.NodeType;
    const targetType = targetNode.data.nodeType as Workflow.NodeType;

    // 基础规则验证
    if (!isValidConnection(sourceType, targetType)) return false;

    // 重复连接验证
    const exists = workflowStore.edges.some(
      (e: any) =>
        e.id !== ignoreEdgeId && // 排除当前正在更新的边
        e.source === connection.source &&
        e.target === connection.target &&
        (e.sourceHandle === connection.sourceHandle || (!e.sourceHandle && !connection.sourceHandle))
    );

    return !exists;
  }

  /**
   * 根据源节点类型和 sourceHandle 生成条件表达式
   */
  function generateEdgeCondition(sourceNode: any, sourceHandle: string | null | undefined): string | undefined {
    if (!sourceHandle) return undefined;

    const nodeType = sourceNode.data.nodeType as Workflow.NodeType;

    // 意图分类器节点: 根据 sourceHandle 生成条件
    if (nodeType === 'INTENT_CLASSIFIER') {
      if (sourceHandle === 'else') {
        return "intent == 'else'";
      }
      // sourceHandle 格式: intent-0, intent-1, ...
      const match = sourceHandle.match(/^intent-(\d+)$/);
      if (match) {
        const intentIndex = Number.parseInt(match[1], 10);
        const config = sourceNode.data.config as Workflow.IntentClassifierConfig;
        if (config?.intents && config.intents[intentIndex]) {
          const intentName = config.intents[intentIndex];
          return `intent == '${intentName}'`;
        }
      }
    }
    return undefined;
  }

  /**
   * 查找节点上最近的 Handle
   */
  function findNearestHandle(nodeEl: Element, event: MouseEvent, handleType: 'source' | 'target'): string | null {
    const handles = nodeEl.querySelectorAll(`.vue-flow__handle-${handleType}`);
    if (handles.length === 0) return null;

    let nearestHandle: Element | null = null;
    let minDistance = Infinity;

    handles.forEach(handle => {
      const rect = handle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt((event.clientX - centerX) ** 2 + (event.clientY - centerY) ** 2);

      if (distance < minDistance) {
        minDistance = distance;
        nearestHandle = handle;
      }
    });

    if (!nearestHandle) return null;
    return (nearestHandle as Element).getAttribute('data-handleid') || null;
  }

  /**
   * 检查是否是拖回原节点（恢复操作）
   */
  function checkIfRestoring(connection: Connection): boolean {
    return connection.source === connection.target;
  }

  /**
   * 构建连接信息
   */
  function buildConnectionInfo(
    targetNode: any,
    dropElements: { nodeEl: Element; handleEl: Element | null | undefined },
    event: MouseEvent
  ) {
    const targetHandleId =
      dropElements.handleEl?.getAttribute('data-handleid') || findNearestHandle(dropElements.nodeEl, event, 'target');

    return {
      targetNodeId: targetNode.id,
      targetHandleId
    };
  }

  /**
   * 处理节点上的连接释放
   * @returns true 表示成功处理,false 表示失败
   */
  function handleConnectionDropOnNode(dropData: ConnectionDropData, event: MouseEvent): boolean {
    const { targetNodeId, nodeEl, handleEl } = dropData;

    const targetNode = workflowStore.nodes.find((n: any) => n.id === targetNodeId);
    if (!targetNode) return false;

    // 构建连接信息
    buildConnectionInfo(targetNode, { nodeEl, handleEl }, event);

    // 这里需要访问外部的 sourceNodeByHandle 状态
    // 由于这是在 composable 中,我们需要通过参数传入或返回一个函数
    // 暂时返回 connectionInfo,让调用者处理
    return true;
  }

  return {
    validateConnection,
    generateEdgeCondition,
    findNearestHandle,
    checkIfRestoring,
    buildConnectionInfo,
    handleConnectionDropOnNode
  };
}
