<script lang="ts" setup>
/* eslint-disable max-depth */
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted, ref } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { NButton, NPopover, NSpace, NSwitch, useDialog, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { ControlButton, Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import type { Connection } from '@vue-flow/core';
import { fetchAppDetail, publishApp, updateApp } from '@/service/api/ai/admin/app';
import { useWorkflowStore } from '@/store/modules/workflow';
import { useNodeDefinitionStore } from '@/store/modules/node-definition';
import { useWorkflowLayout } from '@/composables/useWorkflowLayout';
import { useAutoSave } from '@/composables/useAutoSave';
import { dslToGraph, graphToDsl, validateGraph } from '@/utils/workflow/dsl-converter';
import { formatValidationErrors, validateWorkflow } from '@/utils/workflow/validation';
import { isValidConnection } from '@/utils/workflow/connection-rules';
import ComponentLibraryModal from '@/components/Flow/ComponentLibraryModal.vue';
import AppInfoNode from '@/components/Flow/Nodes/AppInfoNode.vue';
import StartNode from '@/components/Flow/Nodes/StartNode.vue';
import EndNode from '@/components/Flow/Nodes/EndNode.vue';
import IntentClassifierNode from '@/components/Flow/Nodes/IntentClassifierNode.vue';
import ConditionNode from '@/components/Flow/Nodes/ConditionNode.vue';
import FixedResponseNode from '@/components/Flow/Nodes/FixedResponseNode.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import CustomEdge from '@/components/Flow/Edges/CustomEdge.vue';
import ConnectionLine from '@/components/Flow/ConnectionLine.vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import ComponentLibraryPanel from '@/components/Flow/ComponentLibraryPanel.vue';
import WorkflowSaveStatus from '@/components/Flow/WorkflowSaveStatus.vue';

const LlmChatNode = defineAsyncComponent(() => import('@/components/Flow/Nodes/LlmChatNode.vue'));

const route = useRoute();
const message = useMessage();
const dialog = useDialog();
const appId = route.query.appId as unknown as CommonType.IdType;

const workflowStore = useWorkflowStore();
const nodeDefinitionStore = useNodeDefinitionStore();

// Vue Flow composable (提供 getNodes 等方法)
const { getNodes, zoomIn, zoomOut, fitView } = useVueFlow();

// 拖拽容器 Ref
const flowWrapper = ref<HTMLElement | null>(null);
const vueFlowInstance = ref<any>(null);

// 框选模式状态
const isSelectionMode = ref(false);

// 初始化布局管理 composable
const { handleAutoLayout, handleCollapseAll, handleExpandAll, handleCollapseAndLayout } = useWorkflowLayout({
  workflowStore,
  vueFlowInstance,
  getNodes,
  message
});

// 跟踪source Handle事件后源节点（用于创建连接）
const sourceNodeByHandle = ref<{ node: any; handleId: string | null } | null>(null);

// 面板关闭定时器
let panelCloseTimer: number | null = null;

// 注册 Edge 类型
const edgeTypes: any = {
  custom: markRaw(CustomEdge)
};

// 连接成功标志(用于避免连接成功后弹出面板)
let connectionSucceeded = false;

// VueFlow 加载完成回调
function onPaneReady(instance: any) {
  vueFlowInstance.value = instance;

  // 注册事件监听
  instance.onNodeDragStop(({ node }: any) => {
    workflowStore.updateNodePosition(node.id, node.position);
  });

  instance.onNodeClick(({ node }: any) => {
    workflowStore.selectNode(node.id);
  });

  // 跟踪当前连接的源/目标节点(用于连接验证和视觉反馈)
  let connectingSourceNode: any = null;
  let connectingSourceHandle: string | null = null;
  // let connectingHandleType: 'source' | 'target' = 'source';
  const updatingEdge = ref<any>(null); // Use ref for reliability

  // 连接开始:记录源节点
  instance.onConnectStart((params: any) => {
    connectingSourceNode = workflowStore.nodes.find(n => n.id === params.nodeId) || null;
    connectingSourceHandle = params.handleId || null;
    // connectingHandleType = 'source'; // 默认是正向连接
    connectionSucceeded = false; // 重置标志
  });

  // 连接结束:检测是否在空白区域,如果是则显示组件面板;如果在节点上但未连接,则手动创建连接
  instance.onConnectEnd((event: MouseEvent) => {
    // 如果正在更新边，不处理（由 onEdgeUpdateEnd 处理）
    if (updatingEdge.value) {
      return;
    }

    if (!connectingSourceNode) {
      // 移除所有节点的禁止样式
      document.querySelectorAll('.vue-flow__node').forEach(node => {
        node.classList.remove('connection-invalid');
      });
      return;
    }

    // 如果连接已成功,不需要额外处理
    if (!connectionSucceeded) {
      // 尝试手动处理连接结束逻辑
      handleManualConnectEnd(event);
    }

    // 清理状态
    connectingSourceNode = null;
    connectingSourceHandle = null;
    connectionSucceeded = false;
    // 移除所有节点的禁止样式
    document.querySelectorAll('.vue-flow__node').forEach(node => {
      node.classList.remove('connection-invalid');
    });
  });

  // 监听鼠标移动，动态更新节点样式（非法连接时显示禁止标识）
  instance.onPaneMouseMove((event: MouseEvent) => {
    if (!connectingSourceNode) return;

    // 获取鼠标位置下的元素
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const nodeEl = target?.closest('.vue-flow__node');

    // 移除所有节点的禁止样式
    document.querySelectorAll('.vue-flow__node').forEach(node => {
      node.classList.remove('connection-invalid');
    });

    if (nodeEl) {
      const targetNodeId = nodeEl.getAttribute('data-id');
      const targetNode = workflowStore.nodes.find(n => n.id === targetNodeId);

      if (targetNode && connectingSourceNode && connectingSourceNode.id !== targetNodeId) {
        // if (connectingHandleType === 'source') {
        const sourceType = connectingSourceNode.data.nodeType;
        const targetType = targetNode.data.nodeType;
        const exists = workflowStore.edges.some(
          e =>
            e.id !== updatingEdge.value?.id && // 排除当前正在更新的边
            e.source === connectingSourceNode.id &&
            e.target === targetNodeId &&
            (e.sourceHandle === connectingSourceHandle || (!e.sourceHandle && !connectingSourceHandle))
        );

        // 如果是正在更新的边，且回到了原来的目标，则不视为重复
        const isRestoring =
          updatingEdge.value &&
          updatingEdge.value.source === connectingSourceNode.id &&
          updatingEdge.value.target === targetNodeId &&
          (updatingEdge.value.sourceHandle === connectingSourceHandle ||
            (!updatingEdge.value.sourceHandle && !connectingSourceHandle));

        // 使用统一的验证函数
        if (!isValidConnection(sourceType, targetType)) {
          nodeEl.classList.add('connection-invalid');
        } else if (exists && !isRestoring) {
          nodeEl.classList.add('connection-invalid');
        }
      }
    }
  });

  // 监听连接线更新开始
  instance.onEdgeUpdateStart(({ edge }: any) => {
    updatingEdge.value = edge; // 记录当前正在更新的边
    workflowStore.setUpdatingEdgeId(edge.id); // 设置到 store 供 ConnectionLine 使用

    // 隐藏旧连接 (视觉上删除)
    const edgeItem = workflowStore.edges.find(e => e.id === edge.id);
    if (edgeItem) edgeItem.hidden = true;

    // 初始化连接状态
    // 注意：Vue Flow 1.x 的 handleType 可能为 undefined
    // 由于我们设置了 updatable: target，默认假设从 target handle 拖动
    // 拖拽 target handle -> 源头是 Source Node
    connectingSourceNode = workflowStore.nodes.find(n => n.id === edge.source) || null;
    connectingSourceHandle = edge.sourceHandle;
    // connectingHandleType = 'source'; // 模拟从 source 向 target 拖动
    connectionSucceeded = false;
  });

  // 监听连接线更新成功 (拖动到有效把手)
  instance.onEdgeUpdate(({ edge, connection }: any) => {
    connectionSucceeded = true; // 标记更新成功

    // 验证新连接
    if (validateConnection(connection, updatingEdge.value?.id)) {
      // 创建新边
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

      // 同步操作：先删除旧边，再添加新边
      const currentEdges = workflowStore.edges.filter(e => e.id !== edge.id);
      currentEdges.push(newEdge);
      workflowStore.setEdges(currentEdges);
    } else {
      message.warning('无效的连接');
      // 无效连接 -> 移除旧边
      workflowStore.removeEdge(edge.id);
    }
    updatingEdge.value = null; // Clear state
  });

  // 监听连接线更新结束 (处理空白处或节点上的释放)
  instance.onEdgeUpdateEnd(({ edge, event }: any) => {
    // 如果没有触发 onEdgeUpdate (即 connectionSucceeded = false)
    if (!connectionSucceeded) {
      // 尝试手动处理连接逻辑
      const actionTaken = handleManualConnectEnd(event as MouseEvent);

      const currentEdges = [...workflowStore.edges];
      const index = currentEdges.findIndex(e => e.id === edge.id);

      if (actionTaken) {
        // 如果执行了动作（连上了新节点 或 打开了面板），则确保移除旧边
        if (index !== -1) {
          // 使用同步操作删除
          currentEdges.splice(index, 1);
          workflowStore.setEdges(currentEdges);
        } else {
          // Fallback
          const fallbackIndex = currentEdges.findIndex(
            e =>
              e.source === edge.source &&
              e.target === edge.target &&
              (e.sourceHandle === edge.sourceHandle || (!e.sourceHandle && !edge.sourceHandle)) &&
              (e.targetHandle === edge.targetHandle || (!e.targetHandle && !edge.targetHandle))
          );
          if (fallbackIndex !== -1) {
            currentEdges.splice(fallbackIndex, 1);
            workflowStore.setEdges(currentEdges);
          }
        }
      } else if (index !== -1) {
        // 如果没有动作（比如拖回去原节点，或拖到无效区域但未打开面板），则恢复旧边
        const edgeItem = currentEdges[index];
        if (edgeItem.hidden) {
          edgeItem.hidden = false;
          workflowStore.setEdges([...currentEdges]);
        }
      }
    }

    // 清理状态
    connectingSourceNode = null;
    connectingSourceHandle = null;
    updatingEdge.value = null;
    workflowStore.setUpdatingEdgeId(null); // 清除 store 中的状态
    connectionSucceeded = false;
    document.querySelectorAll('.vue-flow__node').forEach(node => {
      node.classList.remove('connection-invalid');
    });
  });

  /** 查找节点上最近的 Handle */
  function findNearestHandle(nodeEl: Element, event: MouseEvent, handleType: 'source' | 'target'): string | null {
    const handles = nodeEl.querySelectorAll(`.vue-flow__handle-${handleType}`);
    if (handles.length === 0) return null;

    let minDistance = Infinity;
    let nearestHandleId: string | null = null;
    handles.forEach((handle: Element) => {
      const rect = handle.getBoundingClientRect();
      const handleCenterX = rect.left + rect.width / 2;
      const handleCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        (event.clientX - handleCenterX) ** 2 +
          (event.clientX - handleCenterX) ** 2 +
          (event.clientY - handleCenterY) ** 2
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestHandleId = handle.getAttribute('data-handleid');
      }
    });
    return nearestHandleId;
  }

  /** 检查是否是拖回原节点（恢复操作） */
  function checkIfRestoring(connection: Connection): boolean {
    if (!updatingEdge.value) return false;
    return (
      updatingEdge.value.source === connection.source &&
      updatingEdge.value.target === connection.target &&
      (updatingEdge.value.sourceHandle === connection.sourceHandle ||
        (!updatingEdge.value.sourceHandle && !connection.sourceHandle)) &&
      (updatingEdge.value.targetHandle === connection.targetHandle ||
        (!updatingEdge.value.targetHandle && !connection.targetHandle))
    );
  }

  /** 构建连接信息 */
  function buildConnectionInfo(
    targetNode: any,
    dropElements: { nodeEl: Element; handleEl: Element | null | undefined },
    event: MouseEvent
  ) {
    const { nodeEl, handleEl } = dropElements;
    let connection: Connection | null = null;

    // if (connectingHandleType === 'source') {
    const targetHandle = handleEl?.getAttribute('data-handleid') || findNearestHandle(nodeEl, event, 'target');
    if (targetHandle || !handleEl) {
      connection = {
        source: connectingSourceNode!.id,
        target: targetNode.id,
        sourceHandle: connectingSourceHandle,
        targetHandle
      };
    }
    const condition = generateEdgeCondition(connectingSourceNode, connectingSourceHandle);
    return { connection, condition };
  }

  /** 处理节点上的连接释放 */
  function handleConnectionDropOnNode(
    dropData: { targetNodeId: string; nodeEl: Element; handleEl: Element | null | undefined },
    event: MouseEvent
  ): boolean {
    const { targetNodeId, nodeEl, handleEl } = dropData;
    const targetNode = workflowStore.nodes.find(n => n.id === targetNodeId);

    if (!targetNode || !connectingSourceNode || targetNodeId === connectingSourceNode.id) return false;

    const { connection, condition } = buildConnectionInfo(targetNode, { nodeEl, handleEl }, event);

    if (!connection) return false;

    if (checkIfRestoring(connection)) {
      return false;
    }

    if (validateConnection(connection, updatingEdge.value?.id)) {
      workflowStore.addEdge({
        id: `e-${connection.source}-${connection.sourceHandle || ''}-${connection.target}`,
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
      connectionSucceeded = true;
      return true;
    }
    return false;
  }

  // 辅助函数: 手动处理连接结束逻辑
  // 返回 boolean: true 表示有了实质性操作（连接或打开面板），false 表示无操作（可能需要恢复旧边）
  function handleManualConnectEnd(event: MouseEvent): boolean {
    if (!connectingSourceNode) return false;

    // 获取鼠标位置下的元素
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const nodeEl = target?.closest('.vue-flow__node');
    const handleEl = target?.closest('.vue-flow__handle');

    if (nodeEl) {
      return handleConnectionDropOnNode(
        { targetNodeId: nodeEl.getAttribute('data-id') as string, nodeEl, handleEl },
        event
      );
    } else if (!nodeEl && !handleEl) {
      // 空白处 -> 打开组件面板
      handleSourceHandleClick(event, connectingSourceNode.id, connectingSourceHandle);
      return true; // Action Taken
    }
    return false; // No Action
  }
}

// 验证连接是否允许（用于 VueFlow 的 isValidConnection prop）
function validateConnection(connection: Connection, ignoreEdgeId?: string) {
  const sourceNode = workflowStore.nodes.find(n => n.id === connection.source);
  const targetNode = workflowStore.nodes.find(n => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  const sourceType = sourceNode.data.nodeType as Workflow.NodeType;
  const targetType = targetNode.data.nodeType as Workflow.NodeType;

  // 基础规则验证
  if (!isValidConnection(sourceType, targetType)) return false;

  // 重复连接验证
  const exists = workflowStore.edges.some(
    e =>
      e.id !== ignoreEdgeId && // 排除当前正在更新的边
      e.source === connection.source &&
      e.target === connection.target &&
      (e.sourceHandle === connection.sourceHandle || (!e.sourceHandle && !connection.sourceHandle))
  );

  return !exists;
}

/**
 * 根据源节点类型和 sourceHandle 生成条件表达式
 * @param sourceNode 源节点
 * @param sourceHandle 源 Handle ID
 * @returns 条件表达式字符串,如果不需要条件则返回 undefined
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

const loading = ref(false);
const appName = ref('');

// 组件面板状态
const showHandlePanel = ref(false);
const handlePanelPosition = ref({ x: 0, y: 0 });

// 获取所有可用的节点类型 - 使用 computed 确保响应式
const availableNodeTypes = computed(() => nodeDefinitionStore.getAllNodeTypes());

const DynamicNode = defineAsyncComponent(() => import('@/components/Flow/Nodes/DynamicNode.vue'));

// 根据节点类型获取对应的组件
function getNodeComponent(nodeType: Workflow.NodeType) {
  const componentMap: Record<Workflow.NodeType, any> = {
    START: markRaw(StartNode),
    END: markRaw(EndNode),
    LLM_CHAT: markRaw(LlmChatNode),
    INTENT_CLASSIFIER: markRaw(IntentClassifierNode),
    CONDITION: markRaw(ConditionNode),
    FIXED_RESPONSE: markRaw(FixedResponseNode),
    APP_INFO: markRaw(AppInfoNode)
  };
  return componentMap[nodeType] || markRaw(DynamicNode);
}

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
      nodeLabel: nodeConfig.nodeLabel,
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

// 初始化自动保存
const { enableAutoSave } = useAutoSave(handleAutoSave);

// 加载工作流
async function loadWorkflow() {
  if (!appId) {
    message.error('缺少应用 ID');
    return;
  }

  loading.value = true;
  try {
    const res = await fetchAppDetail(appId);
    if (res.data) {
      appName.value = res.data.appName;
      workflowStore.setWorkflowInfo(res.data.appName, String(appId));

      // 设置初始最后保存时间 (如果有更新时间则使用更新时间, 否则使用创建时间)
      const lastTime = res.data.updateTime || res.data.createTime;
      if (lastTime) {
        workflowStore.setInitialLastSavedAt(new Date(lastTime).getTime());
      }

      // 优先使用 GraphData (包含坐标信息), 如果没有则使用 DSL (坐标会丢失)
      if (res.data.graphData) {
        const graphData = JSON.parse(res.data.graphData);

        workflowStore.setNodes(graphData.nodes);
        // 强制使用自定义 Edge，且为实线
        const edges = graphData.edges.map((e: any) => ({
          ...e,
          type: 'custom',
          animated: false,
          updatable: 'target' as const
        }));
        workflowStore.setEdges(edges);
      } else if (res.data.dslData) {
        const dsl = JSON.parse(res.data.dslData);
        const graphData = dslToGraph(dsl);

        workflowStore.setNodes(graphData.nodes);
        // 强制使用自定义 Edge，且为实线
        const edges = graphData.edges.map((e: any) => ({
          ...e,
          type: 'custom',
          animated: false,
          updatable: 'target' as const
        }));
        workflowStore.setEdges(edges);
      } else {
        // 初始化一个开始节点
        const startNodeDef = nodeDefinitionStore.getNodeDefinition('START');
        const startNode = {
          id: 'start',
          type: 'custom',
          position: { x: 300, y: 250 }, // 向右移动,避开左上角的基础信息节点
          data: {
            id: 'start',
            nodeType: 'START' as Workflow.NodeType,
            nodeLabel: '开始',
            nodeColor: startNodeDef?.nodeColor || '#10b981',
            nodeIcon: startNodeDef?.nodeIcon,
            description: startNodeDef?.description,
            status: 'idle' as Workflow.NodeStatus
          }
        };
        workflowStore.addNode(startNode);

        // 初始化一个结束节点
        const endNodeDef = nodeDefinitionStore.getNodeDefinition('END');
        const endNode = {
          id: 'end',
          type: 'custom',
          position: { x: 1000, y: 250 }, // 在 START 节点右侧
          data: {
            id: 'end',
            nodeType: 'END' as Workflow.NodeType,
            nodeLabel: '结束',
            nodeColor: endNodeDef?.nodeColor || '#ef4444',
            nodeIcon: endNodeDef?.nodeIcon,
            description: endNodeDef?.description,
            status: 'idle' as Workflow.NodeStatus
          }
        };
        workflowStore.addNode(endNode);
      }

      // 确保基础信息节点存在并更新配置(在 DSL 加载后执行,防止被覆盖)
      createAppInfoNode(res.data);
    } else {
      message.error('工作流数据不存在');
    }
  } catch {
    message.error('加载工作流失败');
  } finally {
    loading.value = false;
    // 加载完成后标记为已保存并延迟启用自动保存
    setTimeout(() => {
      enableAutoSave();
    }, 2000);
  }
}

// 校验应用配置
function validateApp(graphData: any, workflowNodes: any[], appInfoConfig: any) {
  // 验证 Graph 数据
  const validation = validateGraph(graphData);
  if (!validation.valid) {
    message.error(`发布失败: ${validation.errors.join(', ')}`);
    return false;
  }

  // 验证必填参数
  const paramValidation = validateWorkflow(workflowNodes);
  if (!paramValidation.valid) {
    const errorMessage = formatValidationErrors(paramValidation);
    message.error(errorMessage, {
      duration: 5000,
      closable: true
    });
    return false;
  }

  // 单独校验 APP_INFO 节点
  if (appInfoConfig) {
    const appInfoErrors: string[] = [];
    if (!appInfoConfig?.appName) appInfoErrors.push('缺少必填配置: 应用名称');
    if (!appInfoConfig?.modelId) appInfoErrors.push('缺少必填配置: 推理模型');

    if (appInfoErrors.length > 0) {
      const errorMessage = `发布失败，存在未配置项:\n\n【基础信息】\n${appInfoErrors.map(e => `  • ${e}`).join('\n')}`;
      message.error(errorMessage, { duration: 5000, closable: true });
      return false;
    }
  }
  return true;
}

// 保存工作流
// eslint-disable-next-line complexity
async function handleSave(trigger: boolean | Event = false) {
  const isAutoSave = typeof trigger === 'boolean' ? trigger : false;

  // 校验基础信息 (保存时仅校验ID)
  if (!appId) {
    message.error('缺少应用 ID');
    return;
  }

  // 准备数据...

  // 获取基础信息节点的配置
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  const appInfoConfig = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;

  // 提取应用参数配置
  const parameters = appInfoConfig
    ? {
        globalParams: appInfoConfig.globalParams || [],
        interfaceParams: appInfoConfig.interfaceParams || [],
        sessionParams: appInfoConfig.sessionParams || []
      }
    : null;

  // 过滤掉基础信息节点(不属于工作流)
  // Deep clone and clean nodes to avoid circular references and Vue internal properties
  const workflowNodes = workflowStore.nodes
    .filter(n => n.data.nodeType !== 'APP_INFO')
    .map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data
        // Remove any runtime or circular properties if they exist in data
        // Explicitly keep config and paramBindings
      }
      // Ensure we don't carry over other VueFlow internal props
    }));

  // Clean edges to remove circular references like sourceNode and targetNode
  const cleanEdges = workflowStore.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
    animated: edge.animated,
    label: edge.label,
    data: edge.data,
    updatable: edge.updatable
    // Explicitly OMIT sourceNode, targetNode, events, etc.
  }));

  const graphData = {
    nodes: workflowNodes,
    edges: cleanEdges
  };

  // 转换为 DSL
  const dsl = graphToDsl(graphData, workflowStore.workflowName);

  try {
    // 保存工作流数据和基础信息
    await updateApp({
      appId,
      modelId: appInfoConfig?.modelId,
      graphData: JSON.stringify(graphData),
      dslData: JSON.stringify(dsl),
      parameters,
      appName: appInfoConfig?.appName || appName.value,
      description: appInfoConfig?.description,
      icon: appInfoConfig?.icon,
      prologue: appInfoConfig?.prologue
    });
    if (!isAutoSave) {
      message.success('保存成功');
    }
    workflowStore.markSaved(); // 标记为已保存

    // 更新本地应用名称
    if (appInfoConfig?.appName) {
      appName.value = appInfoConfig.appName;
      workflowStore.setWorkflowInfo(appInfoConfig.appName, String(appId));
    }
  } catch {
    message.error('保存失败');
  }
}

// 发布应用
async function handlePublish() {
  // 1. 准备校验数据
  const workflowNodes = workflowStore.nodes
    .filter(n => n.data.nodeType !== 'APP_INFO')
    .map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data }
    }));

  const cleanEdges = workflowStore.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
    animated: edge.animated,
    label: edge.label,
    data: edge.data,
    updatable: edge.updatable
  }));

  const graphData = { nodes: workflowNodes, edges: cleanEdges };

  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  const appInfoConfig = appInfoNode?.data.config;

  // 2. 执行校验
  if (!validateApp(graphData, workflowNodes, appInfoConfig)) {
    return;
  }

  try {
    loading.value = true;
    // 3. 先保存
    await handleSave(true); // 静默保存

    // 4. 再发布
    await publishApp(appId);
    message.success('发布成功');
  } catch {
    message.error('发布失败');
  } finally {
    loading.value = false;
  }
}

// 跳转去对话
function handleGoToChat() {
  window.open(`/#/ai/chat?appId=${appId}`, '_blank');
}

// 查看发布历史
function handlePublishHistory() {
  message.info('发布历史功能开发中...');
}
async function handleAutoSave() {
  if (workflowStore.isSaving) return; // 防止并发保存

  try {
    workflowStore.setSaving(true);
    await handleSave(true);
    workflowStore.markSaved();
  } catch {
    // 静默失败，不打扰用户（手动保存时会有提示）
  } finally {
    workflowStore.setSaving(false);
  }
}

// 路由守卫：离开页面时提醒
onBeforeRouteLeave((_to, _from, next) => {
  if (!workflowStore.isDirty) {
    next();
    return;
  }

  dialog.warning({
    title: '未保存的更改',
    content: '您有未保存的更改，确定要离开吗？',
    positiveText: '保存并离开',
    negativeText: '放弃更改',
    onPositiveClick: async () => {
      await handleAutoSave();
      next();
    },
    onNegativeClick: () => {
      next();
    },
    onMaskClick: () => {
      next(false); // 取消离开
    }
  });
});

// 浏览器关闭提醒
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (workflowStore.isDirty) {
    e.preventDefault();
    e.returnValue = ''; // Chrome 要求
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// 创建基础信息节点
function createAppInfoNode(appData: Api.AI.Admin.App) {
  if (appData) {
    // 如果不存在,添加基础信息节点
    const appInfoNodeDef = nodeDefinitionStore.getNodeDefinition('APP_INFO');

    const newAppInfoNode = {
      id: 'app-info',
      type: 'custom',
      position: { x: 10, y: 50 },
      data: {
        id: 'app-info',
        nodeType: 'APP_INFO' as Workflow.NodeType,
        nodeLabel: appInfoNodeDef?.nodeLabel || '基础信息',
        nodeColor: appInfoNodeDef?.nodeColor,
        nodeIcon: appInfoNodeDef?.nodeIcon || 'mdi:information',
        description: appInfoNodeDef?.description,
        status: 'idle' as Workflow.NodeStatus,
        config: {
          appName: appData.appName || '',
          description: appData.description || '',
          icon: appData.icon || '',
          prologue: appData.prologue || '',
          modelId: appData.modelId,
          // 加载应用参数配置
          globalParams: appData.parameters?.globalParams || [],
          interfaceParams: appData.parameters?.interfaceParams || [],
          sessionParams: appData.parameters?.sessionParams || []
        }
      }
    };
    workflowStore.addNode(newAppInfoNode);
  }
}

// 从组件库选择节点 (点击添加)
function handleSelectNode(nodeType: Workflow.NodeType) {
  // 在画布中心位置添加节点
  // 简单的位移策略，避免重叠
  const position = { x: 300, y: 200 + workflowStore.nodes.length * 50 };
  const newNode = createNodeData(nodeType, position);
  if (newNode) workflowStore.addNode(newNode);
}

// 删除节点
function handleDeleteNode(nodeId: string) {
  workflowStore.removeNode(nodeId);
}

// 复制节点
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

/**
 * 切换框选模式
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-underscore-dangle
function _toggleSelectionMode() {
  isSelectionMode.value = !isSelectionMode.value;
}

/**
 * 清空画布(带确认)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-underscore-dangle
function _handleClearCanvas() {
  window.$dialog?.warning({
    title: '确认清空',
    content: '清空画布将删除所有节点和连线，此操作不可恢复，是否继续？',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: () => {
      workflowStore.clearWorkflow();
      message.success('已清空画布');
    }
  });
}

// 组件挂载时加载工作流
onMounted(async () => {
  try {
    // 先加载节点定义
    await nodeDefinitionStore.loadNodeDefinitions();
    // 先清空工作流
    workflowStore.clearWorkflow();
    // 再加载工作流
    await loadWorkflow();
  } catch {
    message.error('初始化失败,请刷新页面重试');
  }
});
</script>

<template>
  <div class="relative h-full">
    <!-- 全屏画布区域 -->
    <div ref="flowWrapper" class="absolute inset-0 overflow-hidden bg-gray-1 dark:bg-dark-1">
      <VueFlow
        v-model:nodes="workflowStore.nodes"
        v-model:edges="workflowStore.edges"
        :edge-types="edgeTypes"
        :connection-radius="1"
        :pan-on-drag="true"
        :pan-on-scroll="false"
        :zoom-on-scroll="true"
        :zoom-on-pinch="true"
        class="h-full w-full"
        @pane-ready="onPaneReady"
      >
        <Background />
        <Controls :show-zoom="false" :show-fit-view="false" :show-interactive="false">
          <!-- 缩放控制 -->
          <ControlButton title="放大" @click="zoomIn">
            <SvgIcon icon="mdi:magnify-plus-outline" />
          </ControlButton>
          <ControlButton title="缩小" @click="zoomOut">
            <SvgIcon icon="mdi:magnify-minus-outline" />
          </ControlButton>
          <ControlButton title="适应视图" @click="fitView">
            <SvgIcon icon="mdi:fit-to-screen-outline" />
          </ControlButton>

          <!-- 分隔线 -->
          <div class="vue-flow__controls-divider" />
          <!-- 折叠所有节点 -->
          <ControlButton title="折叠所有节点" @click="handleCollapseAll">
            <SvgIcon icon="mdi:unfold-less-horizontal" />
          </ControlButton>

          <!-- 展开所有节点 -->
          <ControlButton title="展开所有节点" @click="handleExpandAll">
            <SvgIcon icon="mdi:unfold-more-horizontal" />
          </ControlButton>

          <!-- 分隔线 -->
          <div class="vue-flow__controls-divider" />

          <!-- 自动布局 -->
          <ControlButton title="优雅布局" @click="handleAutoLayout">
            <SvgIcon icon="mdi:auto-fix" />
          </ControlButton>

          <!-- 折叠并布局 -->
          <ControlButton title="折叠并优雅布局" @click="handleCollapseAndLayout">
            <SvgIcon icon="mdi:format-align-justify" />
          </ControlButton>
        </Controls>
        <MiniMap />

        <!-- 自定义连接线(拖动时显示) -->
        <template #connection-line="connectionLineProps">
          <ConnectionLine v-bind="connectionLineProps" />
        </template>

        <!-- 自定义节点模板 -->
        <template #node-custom="nodeProps">
          <component
            :is="getNodeComponent(nodeProps.data.nodeType)"
            v-bind="nodeProps"
            @delete-node="handleDeleteNode"
            @duplicate-node="handleDuplicateNode"
            @source-handle-click="handleSourceHandleClick"
          />
        </template>
      </VueFlow>

      <!-- Source Handle 点击后的组件面板 -->
      <div
        v-if="showHandlePanel"
        class="fixed z-1000"
        :style="{
          left: `${handlePanelPosition.x}px`,
          top: `${handlePanelPosition.y}px`
        }"
        @mouseenter="handlePanelMouseEnter"
        @mouseleave="handlePanelMouseLeave"
      >
        <ComponentLibraryPanel
          :source-node="sourceNodeByHandle?.node"
          @select="handlePanelSelectNode"
          @drag-start="handlePanelDragStart"
        />
      </div>

      <!-- 点击遮罩关闭面板 -->
      <div v-if="showHandlePanel" class="fixed inset-0 z-999" @click="handleSourceHandleClose" />
    </div>

    <!-- 左上角浮动标题卡片 -->
    <div class="absolute left-4 top-4 z-1000">
      <div class="pointer-events-none text-base font-bold drop-shadow-md">{{ appName }}</div>
    </div>

    <!-- 右上角浮动操作按钮 -->
    <div class="absolute right-4 top-4 z-1000">
      <NSpace align="center" size="small">
        <!-- 保存状态指示器 -->
        <WorkflowSaveStatus v-if="workflowStore.autoSaveEnabled" class="mr-2" />
        <!-- 使用组件库面板，将按钮作为触发器 -->
        <ComponentLibraryModal @select="handleSelectNode" @drag-start="handleManualDragStart">
          <template #trigger>
            <NButton class="bg-white/90 shadow-md backdrop-blur-md dark:bg-dark-2/90">
              <template #icon>
                <SvgIcon icon="carbon:add" />
              </template>
              添加组件
            </NButton>
          </template>
        </ComponentLibraryModal>
        <NButton class="shadow-md" :loading="loading" @click="handleSave">
          <template #icon>
            <SvgIcon icon="mdi:content-save-outline" />
          </template>
          保存
        </NButton>
        <NButton type="primary" class="shadow-md" :loading="loading" @click="handlePublish">发布</NButton>
        <!-- 更多操作菜单 -->
        <NPopover trigger="click" placement="bottom-end" :show-arrow="false" class="w-[180px] p-0">
          <template #trigger>
            <NButton quaternary circle class="ml-1">
              <template #icon>
                <SvgIcon icon="mdi:dots-vertical" class="text-xl" />
              </template>
            </NButton>
          </template>
          <div
            class="flex flex-col border border-gray-100 rounded-md bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-dark-2"
          >
            <!-- 去对话 -->
            <div
              class="flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="handleGoToChat"
            >
              <SvgIcon icon="mdi:chat-processing-outline" class="text-base text-gray-500" />
              <span>去对话</span>
            </div>

            <!-- 发布历史 -->
            <div
              class="flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="handlePublishHistory"
            >
              <SvgIcon icon="mdi:history" class="text-base text-gray-500" />
              <span>发布历史</span>
            </div>

            <div class="mx-2 my-1 h-px bg-gray-100 dark:bg-gray-700" />

            <!-- 自动保存 -->
            <div class="flex items-center justify-between px-4 py-2.5">
              <div class="flex items-center gap-2">
                <SvgIcon icon="mdi:content-save-cog-outline" class="text-base text-gray-500" />
                <span>自动保存</span>
              </div>
              <NSwitch v-model:value="workflowStore.autoSaveEnabled" size="small" />
            </div>
          </div>
        </NPopover>
      </NSpace>
    </div>
  </div>
</template>

<style scoped>
.vue-flow__node.connection-invalid::after {
  content: '❌';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  pointer-events: none;
  z-index: 100;
}

/* 框选按钮激活状态 */
.is-active {
  background-color: var(--vf-controls-button-bg-hover);
  color: var(--vf-controls-button-color-hover);
}

/* 工具条分隔线 */
.vue-flow__controls-divider {
  width: 100%;
  height: 1px;
  border: solid 2px whitesmoke;
  background-color: var(--vf-controls-button-border-color);
  margin: 1px 0;
}

/* 增大工具条尺寸 */
:deep(.vue-flow__controls) {
  border-radius: 5px;
  background-color: #fbfbfb;
}
/* 增大工具条尺寸 */
:deep(.vue-flow__controls-button) {
  width: 28px !important;
  height: 28px !important;
  border: 0;
  border-radius: 5px;
  padding: 2px !important;
  cursor: pointer !important;
  background-color: transparent !important;

  &:hover {
    background-color: #cdd7ea !important;
  }
}

:deep(.vue-flow__controls-button svg) {
  width: 22px !important;
  height: 22px !important;
  max-width: 22px !important;
  max-height: 22px !important;
  font-size: 2px !important;
}
</style>
