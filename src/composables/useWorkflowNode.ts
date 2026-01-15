/**
 * Workflow 节点操作 Composable
 *
 * 负责处理工作流节点的 CRUD 操作:
 * - 创建节点
 * - 选择节点
 * - 删除节点
 * - 复制节点
 */

import type { ReturnType as WorkflowStoreType } from '@/store/modules/workflow';

export interface UseWorkflowNodeOptions {
  workflowStore: WorkflowStoreType;
  availableNodeTypes: Ref<any[]>;
  getNodeComponent: (nodeType: Workflow.NodeType) => any;
}

export function useWorkflowNode(options: UseWorkflowNodeOptions) {
  const { workflowStore, availableNodeTypes } = options;

  /**
   * 创建新节点数据
   */
  function createNodeData(nodeType: Workflow.NodeType, position: { x: number; y: number }) {
    const nodeConfig = availableNodeTypes.value.find(n => n.nodeType === nodeType);
    if (!nodeConfig) return null;

    const timestamp = Date.now();
    const id = `${nodeType.toLowerCase()}-${timestamp}`;
    return {
      id,
      type: 'custom',
      position,
      data: {
        id,
        nodeType,
        nodeLabel: nodeConfig.nodeLabel,
        nodeIcon: nodeConfig.nodeIcon,
        label: nodeConfig.nodeLabel,
        description: nodeConfig.description || '',
        config: nodeConfig.defaultConfig || {},
        status: 'idle' as Workflow.NodeStatus,
        paramBindings: []
      }
    };
  }

  /**
   * 从组件库选择节点 (点击添加)
   */
  function handleSelectNode(nodeType: Workflow.NodeType) {
    // 在画布中心位置添加节点
    // 简单的位移策略,避免重叠
    const position = { x: 300, y: 200 + workflowStore.nodes.length * 50 };
    const newNode = createNodeData(nodeType, position);
    if (newNode) workflowStore.addNode(newNode);
  }

  /**
   * 删除节点
   */
  function handleDeleteNode(nodeId: string) {
    workflowStore.removeNode(nodeId);
  }

  /**
   * 复制节点
   */
  function handleDuplicateNode(nodeId: string) {
    const originalNode = workflowStore.nodes.find(n => n.id === nodeId);
    if (!originalNode) return;

    const timestamp = Date.now();
    const newNode = {
      ...originalNode,
      id: `${originalNode.data.nodeType.toLowerCase()}-${timestamp}`,
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50
      },
      data: {
        ...originalNode.data,
        id: `${originalNode.data.nodeType.toLowerCase()}-${timestamp}`
      }
    };

    workflowStore.addNode(newNode);
  }

  return {
    createNodeData,
    handleSelectNode,
    handleDeleteNode,
    handleDuplicateNode
  };
}
