import { markRaw, ref } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import type { Connection } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { generateEdgeCondition, isValidConnection as isValidConnectionRule } from '@/utils/workflow/connection-rules'; // Rename to avoid naming conflict
import CustomEdge from '@/components/Flow/Edges/CustomEdge.vue';

export function useGraphInteraction(
  vueFlowInstance: Ref<any>,
  _showHandlePanel: Ref<boolean>,
  handleSourceHandleClick: (e: MouseEvent, id: string, handleId?: string | null) => void
) {
  const workflowStore = useWorkflowStore();
  const message = useMessage();
  const updatingEdge = ref<any>(null);
  let connectionSucceeded = false;

  // 注册 Edge 类型
  const edgeTypes: any = {
    custom: markRaw(CustomEdge)
  };

  function handleDeleteNode(nodeId: string) {
    workflowStore.removeNode(nodeId);
  }

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

  // 验证连接是否允许
  function validateConnection(connection: Connection, ignoreEdgeId?: string) {
    const sourceNode = workflowStore.nodes.find(n => n.id === connection.source);
    const targetNode = workflowStore.nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return false;

    const sourceType = sourceNode.data.nodeType as Workflow.NodeType;
    const targetType = targetNode.data.nodeType as Workflow.NodeType;

    if (!isValidConnectionRule(sourceType, targetType)) return false;

    const exists = workflowStore.edges.some(
      e =>
        e.id !== ignoreEdgeId &&
        e.source === connection.source &&
        e.target === connection.target &&
        (e.sourceHandle === connection.sourceHandle || (!e.sourceHandle && !connection.sourceHandle))
    );

    return !exists;
  }

  function onPaneReady(instance: any) {
    vueFlowInstance.value = instance;

    instance.onNodeDragStop(({ node }: any) => {
      workflowStore.updateNodePosition(node.id, node.position);
    });

    instance.onNodeClick(({ node }: any) => {
      workflowStore.selectNode(node.id);
    });

    let connectingSourceNode: any = null;
    let connectingSourceHandle: string | null = null;

    // 连接开始
    instance.onConnectStart((params: any) => {
      connectingSourceNode = workflowStore.nodes.find(n => n.id === params.nodeId) || null;
      connectingSourceHandle = params.handleId || null;

      connectionSucceeded = false;
    });

    // 连接结束
    instance.onConnectEnd((event: MouseEvent) => {
      if (updatingEdge.value) return;

      if (!connectingSourceNode) {
        document.querySelectorAll('.vue-flow__node').forEach(node => node.classList.remove('connection-invalid'));
        return;
      }

      if (!connectionSucceeded) {
        handleManualConnectEnd(event, connectingSourceNode, connectingSourceHandle);
      }

      connectingSourceNode = null;
      connectingSourceHandle = null;
      connectionSucceeded = false;
      document.querySelectorAll('.vue-flow__node').forEach(node => node.classList.remove('connection-invalid'));
    });

    // 鼠标移动
    instance.onPaneMouseMove((event: MouseEvent) => {
      if (!connectingSourceNode) return;

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const nodeEl = target?.closest('.vue-flow__node');

      document.querySelectorAll('.vue-flow__node').forEach(node => node.classList.remove('connection-invalid'));

      if (nodeEl) {
        const targetNodeId = nodeEl.getAttribute('data-id');
        const targetNode = workflowStore.nodes.find(n => n.id === targetNodeId);

        if (targetNode && connectingSourceNode && connectingSourceNode.id !== targetNodeId) {
          const connection = {
            source: connectingSourceNode.id,
            target: targetNode.id,
            sourceHandle: connectingSourceHandle,
            targetHandle: null
          } as Connection;

          const isValid = validateConnection(connection, updatingEdge.value?.id);

          if (!isValid) {
            nodeEl.classList.add('connection-invalid');
          }
        }
      }
    });

    // 连接线更新开始
    instance.onEdgeUpdateStart(({ edge }: any) => {
      updatingEdge.value = edge;
      workflowStore.setUpdatingEdgeId(edge.id);
      connectionSucceeded = false;
    });

    // 连接线更新成功
    instance.onEdgeUpdate(({ edge, connection }: any) => {
      connectionSucceeded = true;
      if (validateConnection(connection, updatingEdge.value?.id)) {
        const sourceNode = workflowStore.nodes.find(n => n.id === connection.source);
        const condition = generateEdgeCondition(sourceNode, connection.sourceHandle);
        const edgeId = `e-${connection.source}-${connection.sourceHandle || ''}-${connection.target}`;

        const newEdge = {
          id: edgeId,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: 'custom',
          animated: false,
          updatable: 'target' as const,
          label: condition,
          data: { condition }
        };

        const currentEdges = workflowStore.edges.filter(e => e.id !== edge.id);
        currentEdges.push(newEdge);
        workflowStore.setEdges(currentEdges);
      } else {
        message.warning('无效的连接');
        workflowStore.removeEdge(edge.id);
      }
      updatingEdge.value = null;
    });

    // 连接线更新结束
    instance.onEdgeUpdateEnd(({ edge, event }: any) => {
      if (!connectionSucceeded) {
        // Find source node for manual connect logic
        // If restoring logic fails, handleManualConnectEnd might trigger
        // Wait, handleManualConnectEnd needs connectingSourceNode.
        // During Update, connectingSourceNode isn't set via onConnectStart.
        // We set it manually in onEdgeUpdateStart?
        const sourceNode = workflowStore.nodes.find(n => n.id === edge.source);
        const actionTaken = handleManualConnectEnd(event as MouseEvent, sourceNode, edge.sourceHandle);

        const currentEdges = [...workflowStore.edges];
        const index = currentEdges.findIndex(e => e.id === edge.id);

        if (actionTaken && index !== -1) {
          currentEdges.splice(index, 1);
          workflowStore.setEdges(currentEdges);
        } // else VueFlow handles restoration usually, but we might have custom logic?
      }

      updatingEdge.value = null;
      workflowStore.setUpdatingEdgeId(null);
      connectionSucceeded = false;
      document.querySelectorAll('.vue-flow__node').forEach(node => node.classList.remove('connection-invalid'));
    });
  }

  function handleManualConnectEnd(event: MouseEvent, sourceNode: any, sourceHandle: string | null): boolean {
    if (!sourceNode) return false;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const nodeEl = target?.closest('.vue-flow__node');
    const handleEl = target?.closest('.vue-flow__handle');

    if (nodeEl) {
      const targetNodeId = nodeEl.getAttribute('data-id');
      const targetNode = workflowStore.nodes.find(n => n.id === targetNodeId);
      if (targetNode && targetNode.id !== sourceNode.id) {
        // Simplify: assumes target handle is default or found
        // Logic from original file to find handle or use default
        const connection = {
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle,
          targetHandle: handleEl?.getAttribute('data-handleid') || null
        } as Connection;

        if (validateConnection(connection)) {
          const condition = generateEdgeCondition(sourceNode, sourceHandle);
          const edgeId = `e-${connection.source}-${connection.sourceHandle || ''}-${connection.target}`;
          workflowStore.addEdge({
            id: edgeId,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'custom',
            animated: false,
            updatable: 'target' as const,
            label: condition,
            data: { condition }
          });
          return true;
        }
      }
      return false;
    } else if (!nodeEl && !handleEl) {
      // Blank space -> open panel
      handleSourceHandleClick(event, sourceNode.id, sourceHandle);
      return true;
    }
    return false;
  }

  return {
    onPaneReady,
    validateConnection,
    handleDeleteNode,
    handleDuplicateNode,
    edgeTypes,
    updatingEdge
  };
}
