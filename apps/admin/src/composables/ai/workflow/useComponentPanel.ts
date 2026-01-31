import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { generateEdgeCondition } from '@/utils/ai/connection-rules';
import { generateNodeLabel } from '@/utils/ai/node-naming';

export function useComponentPanel(vueFlowInstance: Ref<any>, flowWrapper: Ref<HTMLElement | null>) {
  const workflowStore = useWorkflowStore();
  const nodeDefinitionStore = useNodeDefinitionStore();

  // 组件面板状态
  const showHandlePanel = ref(false);
  const handlePanelPosition = ref({ x: 0, y: 0 });
  const sourceNodeByHandle = ref<{ node: any; handleId: string | null } | null>(null);

  // 面板关闭定时器
  let panelCloseTimer: number | null = null;

  // 获取所有可用的节点类型
  const availableNodeTypes = computed(() => nodeDefinitionStore.getAllNodeTypes());

  // 创建新节点数据
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
        nodeLabel: generateNodeLabel(nodeConfig.nodeLabel, workflowStore.nodes),
        nodeIcon: nodeConfig.nodeIcon,
        nodeColor: nodeConfig.nodeColor,
        isSystem: nodeConfig.isSystem,
        description: nodeConfig.description,
        status: 'idle' as Workflow.NodeStatus,
        config: {},
        paramBindings: []
      }
    };
  }

  // 处理 Source Handle 点击
  function handleSourceHandleClick(e: MouseEvent, id: string, handleId?: string | null) {
    // 记录源节点和 handle ID
    const node = workflowStore.nodes.find(n => n.id === id);
    if (node) {
      sourceNodeByHandle.value = {
        node,
        handleId: handleId || null
      };
    }
    // 计算面板位置（鼠标右侧）
    handlePanelPosition.value = {
      x: e.clientX + 10,
      y: e.clientY
    };
    showHandlePanel.value = true;
  }

  function handleSourceHandleClose() {
    // 清除源节点
    sourceNodeByHandle.value = null;
    showHandlePanel.value = false;
    if (panelCloseTimer) {
      clearTimeout(panelCloseTimer);
      panelCloseTimer = null;
    }
  }

  // 鼠标进入面板区域，取消关闭
  function handlePanelMouseEnter() {
    if (panelCloseTimer) {
      clearTimeout(panelCloseTimer);
      panelCloseTimer = null;
    }
  }

  // 鼠标离开面板区域，延迟关闭
  function handlePanelMouseLeave() {
    panelCloseTimer = window.setTimeout(() => {
      handleSourceHandleClose();
    }, 1000);
  }

  // 手动拖拽处理 (绕过 HTML5 DnD 限制)
  function handleManualDragStart({ type, x, y }: { type: Workflow.NodeType; x: number; y: number }) {
    const nodeConfig = availableNodeTypes.value.find(n => n.nodeType === type);

    // 创建跟随鼠标的 Ghost 元素
    const ghost = document.createElement('div');
    ghost.innerHTML = `
      <div class="flex items-center gap-2">
        <div style="width: 16px; height: 16px; background: ${nodeConfig?.nodeColor}20; color: ${nodeConfig?.nodeColor}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
          <span class="icon" style="font-size: 12px;">+</span>
        </div>
        <span>${nodeConfig?.nodeLabel || type}</span>
      </div>
    `;

    // 基础样式
    ghost.className =
      'fixed p-[6px_10px] bg-white b b-solid b-[#e5e7eb] rounded-6px shadow-md z-[9999] pointer-events-none -translate-50% text-[13px] font-500 text-[#374151] select-none dark:bg-[#1f1f1f] dark:b-[#333] dark:text-[#e5e7eb]';

    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;

    document.body.appendChild(ghost);

    // 鼠标移动更新 Ghost 位置
    const onMove = (e: MouseEvent) => {
      ghost.style.left = `${e.clientX}px`;
      ghost.style.top = `${e.clientY}px`;
    };

    // 鼠标松开处理 Drop
    const onUp = (e: MouseEvent) => {
      if (flowWrapper.value && vueFlowInstance.value) {
        const rect = flowWrapper.value.getBoundingClientRect();

        const isInside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        // 检查鼠标是否在画布区域内
        if (isInside) {
          // 计算画布坐标
          const position = vueFlowInstance.value.project({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });

          const newNode = createNodeData(type, position);
          if (newNode) {
            workflowStore.addNode(newNode);
            // 如果有sourceNodeByHandle，说明是handle点击或拖拽，创建连接
            if (sourceNodeByHandle.value) {
              const condition = generateEdgeCondition(sourceNodeByHandle.value.node, sourceNodeByHandle.value.handleId);
              workflowStore.addEdge({
                id: `e-${sourceNodeByHandle.value.node.id}-${sourceNodeByHandle.value.handleId || ''}-${newNode.id}`,
                source: sourceNodeByHandle.value.node.id,
                target: newNode.id,
                sourceHandle: sourceNodeByHandle.value.handleId,
                targetHandle: null,
                type: 'custom',
                animated: false,
                updatable: 'target' as const,
                label: condition,
                data: { condition }
              });
              sourceNodeByHandle.value = null;
            }
          }
        }
      }

      // 清理
      if (ghost.parentNode) document.body.removeChild(ghost);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // 从 Handle 面板选择节点后自动连接
  function handlePanelSelectNode(nodeType: Workflow.NodeType) {
    showHandlePanel.value = false;
    // 在面板位置附近创建节点
    if (flowWrapper.value && vueFlowInstance.value) {
      const rect = flowWrapper.value.getBoundingClientRect();
      const position = vueFlowInstance.value.project({
        x: handlePanelPosition.value.x - rect.left,
        y: handlePanelPosition.value.y - rect.top
      });
      const newNode = createNodeData(nodeType, position);
      if (newNode) {
        workflowStore.addNode(newNode);
        // 创建连接
        if (sourceNodeByHandle.value) {
          const condition = generateEdgeCondition(sourceNodeByHandle.value.node, sourceNodeByHandle.value.handleId);
          workflowStore.addEdge({
            id: `e-${sourceNodeByHandle.value.node.id}-${sourceNodeByHandle.value.handleId || ''}-${newNode.id}`,
            source: sourceNodeByHandle.value.node.id,
            target: newNode.id,
            sourceHandle: sourceNodeByHandle.value.handleId,
            targetHandle: null,
            type: 'custom',
            animated: false,
            updatable: 'target' as const,
            label: condition,
            data: { condition }
          });
          sourceNodeByHandle.value = null;
        }
      }
    }
  }

  // 从 Handle 面板拖拽节点
  function handlePanelDragStart(data: { type: Workflow.NodeType; x: number; y: number }) {
    showHandlePanel.value = false;
    handleManualDragStart(data);
  }

  // 从组件库选择节点 (点击添加)
  function handleSelectNode(nodeType: Workflow.NodeType) {
    // 在画布中心位置添加节点
    // 简单的位移策略，避免重叠
    const position = { x: 300, y: 200 + workflowStore.nodes.length * 50 };
    const newNode = createNodeData(nodeType, position);
    if (newNode) workflowStore.addNode(newNode);
  }

  return {
    showHandlePanel,
    handlePanelPosition,
    sourceNodeByHandle,
    handleSourceHandleClick,
    handleSourceHandleClose,
    handlePanelMouseEnter,
    handlePanelMouseLeave,
    handlePanelSelectNode,
    handlePanelDragStart,
    handleManualDragStart,
    handleSelectNode,
    createNodeData
  };
}
