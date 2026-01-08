<script lang="ts" setup>
import { computed, defineAsyncComponent, markRaw, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NCard, NSpace, useMessage } from 'naive-ui';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import type { Connection } from '@vue-flow/core';
import { fetchAppDetail, updateApp } from '@/service/api/ai/admin/app';
import { useWorkflowStore } from '@/store/modules/workflow';
import { useNodeDefinitionStore } from '@/store/modules/node-definition';
import { dslToGraph, graphToDsl, validateGraph } from '@/utils/workflow/dsl-converter';
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
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import ComponentLibraryPanel from '@/components/Flow/ComponentLibraryPanel.vue';

const LlmChatNode = defineAsyncComponent(() => import('@/components/Flow/Nodes/LlmChatNode.vue'));

const route = useRoute();
const message = useMessage();
const appId = route.query.appId as unknown as CommonType.IdType;

const workflowStore = useWorkflowStore();
const nodeDefinitionStore = useNodeDefinitionStore();

// 拖拽容器 Ref
const flowWrapper = ref<HTMLElement | null>(null);
const vueFlowInstance = ref<any>(null);

// 跟踪source Handle事件后源节点（用于创建连接）
let sourceNodeByHandle: any = null;

// 面板关闭定时器
let panelCloseTimer: number | null = null;

// 注册 Edge 类型
const edgeTypes = {
  custom: markRaw(CustomEdge)
};

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

  // 跟踪当前连接的源节点（用于连接验证和视觉反馈）
  let connectingSourceNode: any = null;
  let connectingSourceHandle: string | null = null;

  // 连接开始：记录源节点
  instance.onConnectStart((params: any) => {
    connectingSourceNode = workflowStore.nodes.find(n => n.id === params.nodeId) || null;
    connectingSourceHandle = params.handleId || null;
  });

  // 连接结束：检测鼠标附近的节点并创建连接
  instance.onConnectEnd((event: MouseEvent) => {
    if (!connectingSourceNode) {
      // 移除所有节点的禁止样式
      document.querySelectorAll('.vue-flow__node').forEach(node => {
        node.classList.remove('connection-invalid');
      });
      return;
    }

    // 获取鼠标位置
    const clientX = event.clientX;
    const clientY = event.clientY;

    // 获取鼠标位置下的元素
    const target = document.elementFromPoint(clientX, clientY);
    const nodeEl = target?.closest('.vue-flow__node');

    if (nodeEl) {
      const targetNodeId = nodeEl.getAttribute('data-id');
      const targetNode = workflowStore.nodes.find(n => n.id === targetNodeId);

      // 确保不是自连接，且目标节点存在
      if (targetNode && targetNodeId !== connectingSourceNode.id) {
        // 构建临时连接对象用于验证
        const connectionParams: Connection = {
          source: connectingSourceNode.id,
          target: targetNodeId as string,
          sourceHandle: connectingSourceHandle,
          targetHandle: null
        };

        console.log('connectionParams', connectionParams);
        // 使用统一的验证函数 (包括类型验证和重复验证)
        if (validateConnection(connectionParams)) {
          const edgeId = `e-${connectingSourceNode.id}-${connectingSourceHandle || ''}-${targetNodeId}`;

          // 根据源节点类型和 sourceHandle 生成条件表达式
          const condition = generateEdgeCondition(connectingSourceNode, connectingSourceHandle);

          workflowStore.addEdge({
            id: edgeId,
            source: connectingSourceNode.id,
            target: targetNodeId as string,
            sourceHandle: connectingSourceHandle,
            targetHandle: null,
            type: 'custom',
            animated: false,
            label: condition,
            data: {
              condition
            }
          });
        } else {
          const sourceType = connectingSourceNode.data.nodeType as Workflow.NodeType;
          const targetType = targetNode.data.nodeType as Workflow.NodeType;
          if (!isValidConnection(sourceType, targetType)) {
            message.warning('该节点类型不允许连接到目标节点');
          }
        }
      }
    } else {
      // 与connection-radius="100"冲突，暂时不启用
      // handleSourceHandleClick(event, connectingSourceNode.id);
    }

    connectingSourceNode = null;
    connectingSourceHandle = null;
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
        const sourceType = connectingSourceNode.data.nodeType as Workflow.NodeType;
        const targetType = targetNode.data.nodeType as Workflow.NodeType;

        // 使用统一的验证函数
        if (!isValidConnection(sourceType, targetType)) {
          nodeEl.classList.add('connection-invalid');
        } else {
          // 检测是否已经存在连接
          const exists = workflowStore.edges.some(
            e =>
              e.source === connectingSourceNode.id &&
              e.target === targetNodeId &&
              (e.sourceHandle === connectingSourceHandle || (!e.sourceHandle && !connectingSourceHandle))
          );
          if (exists) {
            nodeEl.classList.add('connection-invalid');
          }
        }
      }
    }
  });
}

// 验证连接是否允许（用于 VueFlow 的 isValidConnection prop）
function validateConnection(connection: Connection) {
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
function generateEdgeCondition(sourceNode: any, sourceHandle: string | null): string | undefined {
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

  // 条件节点: 类似逻辑(如果需要的话)
  // if (nodeType === 'CONDITION') { ... }

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
  const nodeConfig = availableNodeTypes.value.find(n => n.type === nodeType);
  if (!nodeConfig) return null;

  const timestamp = Date.now();
  return {
    id: `${nodeType.toLowerCase()}-${timestamp}`,
    type: 'custom',
    position,
    data: {
      id: `${nodeType.toLowerCase()}-${timestamp}`,
      nodeType,
      label: nodeConfig.label,
      icon: nodeConfig.icon,
      description: nodeConfig.description,
      nodeColor: nodeConfig.color,
      category: nodeConfig.category,
      isSystem: nodeConfig.isSystem,
      status: 'idle' as Workflow.NodeStatus,
      config: {},
      paramBindings: []
    }
  };
}

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

      // 优先使用 GraphData (包含坐标信息), 如果没有则使用 DSL (坐标会丢失)
      if (res.data.graphData) {
        const graphData = JSON.parse(res.data.graphData);

        workflowStore.setNodes(graphData.nodes);
        // 强制使用自定义 Edge，且为实线
        const edges = graphData.edges.map((e: any) => ({ ...e, type: 'custom', animated: false }));
        workflowStore.setEdges(edges);
      } else if (res.data.dslData) {
        const dsl = JSON.parse(res.data.dslData);
        const graphData = dslToGraph(dsl);

        workflowStore.setNodes(graphData.nodes);
        // 强制使用自定义 Edge，且为实线
        const edges = graphData.edges.map((e: any) => ({ ...e, type: 'custom', animated: false }));
        workflowStore.setEdges(edges);
      } else {
        // 初始化一个开始节点
        const startNode = {
          id: 'start',
          type: 'custom',
          position: { x: 500, y: 150 }, // 向右移动,避开左上角的基础信息节点
          data: {
            id: 'start',
            nodeType: 'START' as Workflow.NodeType,
            label: '开始',
            status: 'idle' as Workflow.NodeStatus
          }
        };
        workflowStore.addNode(startNode);
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
  }
}

// 保存工作流
async function handleSave() {
  if (!appId) {
    message.error('缺少应用 ID');
    return;
  }

  // 获取基础信息节点的配置
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  const appInfoConfig = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;

  console.log('workflowStore.edges:', workflowStore.edges);
  // 过滤掉基础信息节点(不属于工作流)
  const workflowNodes = workflowStore.nodes.filter(n => n.data.nodeType !== 'APP_INFO');
  const graphData = {
    nodes: workflowNodes,
    edges: workflowStore.edges
  };

  // 验证 Graph 数据
  const validation = validateGraph(graphData);

  if (!validation.valid) {
    message.error(`工作流验证失败: ${validation.errors.join(', ')}`);
    return;
  }

  // 转换为 DSL
  const dsl = graphToDsl(graphData, workflowStore.workflowName);

  try {
    // 保存工作流数据和基础信息
    await updateApp({
      appId,
      graphData: JSON.stringify(graphData),
      dslData: JSON.stringify(dsl),
      // 同步基础信息到应用数据
      appName: appInfoConfig?.appName || appName.value,
      description: appInfoConfig?.description,
      icon: appInfoConfig?.icon,
      prologue: appInfoConfig?.prologue
    });
    message.success('保存成功');

    // 更新本地应用名称
    if (appInfoConfig?.appName) {
      appName.value = appInfoConfig.appName;
      workflowStore.setWorkflowInfo(appInfoConfig.appName, String(appId));
    }
  } catch {
    message.error('保存失败');
  }
}

// 创建基础信息节点
function createAppInfoNode(appData: Api.AI.Admin.App) {
  if (appData) {
    // 如果不存在,添加基础信息节点
    const newAppInfoNode = {
      id: 'app-info',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: {
        id: 'app-info',
        nodeType: 'APP_INFO' as Workflow.NodeType,
        label: '基础信息',
        icon: 'mdi:information',
        status: 'idle' as Workflow.NodeStatus,
        config: {
          appName: appData.appName || '',
          description: appData.description || '',
          icon: appData.icon || '',
          prologue: appData.prologue || ''
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
function handleSourceHandleClick(e: MouseEvent, id: string) {
  // 记录源节点
  sourceNodeByHandle = workflowStore.nodes.find(n => n.id === id);
  // 计算面板位置（鼠标右侧）
  handlePanelPosition.value = {
    x: e.clientX + 10,
    y: e.clientY
  };
  showHandlePanel.value = true;
}

function handleSourceHandleClose() {
  // 清除源节点
  sourceNodeByHandle = null;
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
      if (sourceNodeByHandle) {
        workflowStore.addEdge({
          id: `e-${sourceNodeByHandle.id}-${newNode.id}`,
          source: sourceNodeByHandle.id,
          target: newNode.id,
          sourceHandle: null,
          targetHandle: null,
          type: 'custom',
          animated: false
        });
        sourceNodeByHandle = null;
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
  const nodeConfig = availableNodeTypes.value.find(n => n.type === type);

  // 创建跟随鼠标的 Ghost 元素
  const ghost = document.createElement('div');
  ghost.innerHTML = `
    <div class="flex items-center gap-2">
      <div style="width: 16px; height: 16px; background: ${nodeConfig?.color}20; color: ${nodeConfig?.color}; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span class="icon" style="font-size: 12px;">+</span>
      </div>
      <span>${nodeConfig?.label || type}</span>
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
          if (sourceNodeByHandle) {
            workflowStore.addEdge({
              id: `e-${sourceNodeByHandle.id}-${newNode.id}`,
              source: sourceNodeByHandle.id,
              target: newNode.id,
              sourceHandle: null,
              targetHandle: null,
              type: 'custom',
              animated: false
            });
            sourceNodeByHandle = null;
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

// 组件挂载时加载工作流
onMounted(async () => {
  try {
    // 先加载节点定义
    await nodeDefinitionStore.loadNodeDefinitions();
    // 再加载工作流
    await loadWorkflow();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('初始化失败:', error);
    message.error('初始化失败,请刷新页面重试');
  }
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 顶部工具栏和基础信息 -->
    <NCard :bordered="false" size="small" class="mb-2 card-wrapper">
      <!-- 工具栏 -->
      <NSpace align="center" justify="space-between" class="mb-3">
        <div>
          <div class="text-lg font-bold">工作流编排</div>
          <div class="mt-1 text-xs text-gray-500">{{ appName }}</div>
        </div>
        <NSpace>
          <!-- 使用组件库面板，将按钮作为触发器 -->
          <ComponentLibraryModal @select="handleSelectNode" @drag-start="handleManualDragStart">
            <template #trigger>
              <NButton>
                <template #icon>
                  <SvgIcon icon="carbon:add" />
                </template>
                添加组件
              </NButton>
            </template>
          </ComponentLibraryModal>
          <NButton @click="workflowStore.clearWorkflow">清空</NButton>
          <NButton type="primary" :loading="loading" @click="handleSave">保存</NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 画布区域 -->
    <div
      ref="flowWrapper"
      class="flex-1 overflow-hidden b b-gray-2 rounded-2 b-solid bg-gray-1 dark:b-dark-3 dark:bg-dark-1"
    >
      <VueFlow
        v-model:nodes="workflowStore.nodes"
        v-model:edges="workflowStore.edges"
        :edge-types="edgeTypes"
        :connection-radius="30"
        class="h-full w-full"
        @pane-ready="onPaneReady"
      >
        <Background />
        <Controls />
        <MiniMap />

        <!-- 自定义节点模板 -->
        <template #node-custom="nodeProps">
          <component
            :is="getNodeComponent(nodeProps.data.nodeType)"
            v-bind="nodeProps"
            @delete-node="handleDeleteNode"
            @duplicate-node="handleDuplicateNode"
            @source-handle-click="handleSourceHandleClick"
          />
          <div v-if="false" class="absolute left-0 z-50 whitespace-pre bg-black p-1 text-xs text-white -top-10">
            Type: {{ nodeProps.data.nodeType }} Data: {{ JSON.stringify(nodeProps.data, null, 2) }}
          </div>
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
        <ComponentLibraryPanel @select="handlePanelSelectNode" @drag-start="handlePanelDragStart" />
      </div>

      <!-- 点击遮罩关闭面板 -->
      <div v-if="showHandlePanel" class="fixed inset-0 z-999" @click="handleSourceHandleClose" />
    </div>
  </div>
</template>

<style>
.vue-flow__node.connection-invalid::after {
  content: '❌';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  pointer-events: none;
  z-index: 100;
}
</style>
