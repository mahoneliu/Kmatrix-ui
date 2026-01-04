<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NCard, NSpace, useMessage } from 'naive-ui';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import type { Connection } from '@vue-flow/core';
import { fetchAppDetail, updateApp } from '@/service/api/ai/admin/app';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getAllNodeTypes } from '@/utils/workflow/node-registry';
import { dslToGraph, graphToDsl, validateGraph } from '@/utils/workflow/dsl-converter';
import ComponentLibraryModal from '@/components/Flow/ComponentLibraryModal.vue';
import AppInfoNode from '@/components/Flow/Nodes/AppInfoNode.vue';
import StartNode from '@/components/Flow/Nodes/StartNode.vue';
import EndNode from '@/components/Flow/Nodes/EndNode.vue';
import LlmChatNode from '@/components/Flow/Nodes/LlmChatNode.vue';
import IntentClassifierNode from '@/components/Flow/Nodes/IntentClassifierNode.vue';
import ConditionNode from '@/components/Flow/Nodes/ConditionNode.vue';
import FixedResponseNode from '@/components/Flow/Nodes/FixedResponseNode.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import CustomEdge from '@/components/Flow/Edges/CustomEdge.vue'; // Moved to top
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const route = useRoute();
const message = useMessage();
const appId = Number(route.query.appId);

const workflowStore = useWorkflowStore();
// 拖拽容器 Ref
const flowWrapper = ref<HTMLElement | null>(null);
const vueFlowInstance = ref<any>(null);

// 注册 Edge 类型
const edgeTypes = {
  custom: CustomEdge
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

  // 记录当前拖拽连接的源节点信息
  let connectingState: { nodeId: string; handleId: string | null } | null = null;

  instance.onConnectStart((params: any) => {
    connectingState = { nodeId: params.nodeId, handleId: params.handleId };
  });

  instance.onConnectEnd((event: MouseEvent | TouchEvent) => {
    if (!connectingState) return;

    // 获取鼠标位置下的元素
    const target = event.target as Element;
    // 向上查找最近的节点元素
    const nodeEl = target.closest('.vue-flow__node');

    if (nodeEl) {
      const targetNodeId = nodeEl.getAttribute('data-id');

      // 确保不是自连接，且目标节点存在
      if (targetNodeId && targetNodeId !== connectingState.nodeId) {
        const sourceId = connectingState.nodeId;
        // 检查连接是否已存在
        const exists = workflowStore.edges.some(e => e.source === sourceId && e.target === targetNodeId);

        if (!exists) {
          // 检查目标节点是否有输入 Handle (排除 START 节点等)
          // 这里假设大部分业务节点都有且只有一个默认的 target handle
          // 如果需要更严谨的逻辑，可以检查节点类型或元数据

          workflowStore.addEdge({
            id: `e-${sourceId}-${targetNodeId}`,
            source: sourceId,
            target: targetNodeId,
            sourceHandle: connectingState.handleId,
            targetHandle: null, // 默认 target handle
            type: 'custom',
            animated: false
          });
        }
      }
    }

    connectingState = null;
  });

  // 连接节点 (Handle to Handle 精确连接)
  instance.onConnect((connection: Connection) => {
    // 检查是否已有连接(避免重复)
    const exists = workflowStore.edges.some(e => e.source === connection.source && e.target === connection.target);
    if (!exists) {
      workflowStore.addEdge({
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'custom',
        animated: false
      });
    }
  });
}

const loading = ref(false);
const appName = ref('');

// 注册自定义节点类型
const nodeTypes = {
  custom: StartNode // 默认使用 StartNode，实际会根据 data.type 动态渲染
};

// 获取所有可用的节点类型
const availableNodeTypes = getAllNodeTypes();

// 根据节点类型获取对应的组件
function getNodeComponent(nodeType: Workflow.NodeType) {
  const componentMap: Record<Workflow.NodeType, any> = {
    START: StartNode,
    END: EndNode,
    LLM_CHAT: LlmChatNode,
    INTENT_CLASSIFIER: IntentClassifierNode,
    CONDITION: ConditionNode,
    FIXED_RESPONSE: FixedResponseNode,
    APP_INFO: AppInfoNode
  };
  return componentMap[nodeType] || StartNode;
}

// 创建新节点数据
function createNodeData(nodeType: Workflow.NodeType, position: { x: number; y: number }) {
  const nodeConfig = availableNodeTypes.find(n => n.type === nodeType);
  if (!nodeConfig) return null;

  const timestamp = Date.now();
  return {
    id: `${nodeType.toLowerCase()}-${timestamp}`,
    type: 'custom',
    position,
    data: {
      id: `${nodeType.toLowerCase()}-${timestamp}`,
      type: nodeType,
      label: nodeConfig.label,
      icon: nodeConfig.icon,
      status: 'idle' as Workflow.NodeStatus,
      config: {}
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
          id: 'start-1',
          type: 'custom',
          position: { x: 500, y: 150 }, // 向右移动,避开左上角的基础信息节点
          data: {
            id: 'start-1',
            type: 'START' as Workflow.NodeType,
            label: '开始',
            status: 'idle' as Workflow.NodeStatus
          }
        };
        workflowStore.addNode(startNode);
      }

      // 确保基础信息节点存在并更新配置(在 DSL 加载后执行,防止被覆盖)
      ensureAppInfoNode(res.data);
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
  const appInfoNode = workflowStore.nodes.find(n => n.data.type === 'APP_INFO');
  const appInfoConfig = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;

  // 过滤掉基础信息节点(不属于工作流)
  const workflowNodes = workflowStore.nodes.filter(n => n.data.type !== 'APP_INFO');
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

// 确保基础信息节点存在并更新配置
function ensureAppInfoNode(appData: Api.AI.App) {
  const appInfoNode = workflowStore.nodes.find(n => n.data.type === 'APP_INFO');

  if (!appInfoNode) {
    // 如果不存在,添加基础信息节点
    const newAppInfoNode = {
      id: 'app-info',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: {
        id: 'app-info',
        type: 'APP_INFO' as Workflow.NodeType,
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
  } else {
    // 如果存在,更新配置
    workflowStore.updateNodeConfig('app-info', {
      appName: appData.appName || '',
      description: appData.description || '',
      icon: appData.icon || '',
      prologue: appData.prologue || ''
    });
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
    id: `${originalNode.data.type.toLowerCase()}-${timestamp}`,
    position: {
      x: originalNode.position.x + 50,
      y: originalNode.position.y + 50
    },
    data: {
      ...originalNode.data,
      id: `${originalNode.data.type.toLowerCase()}-${timestamp}`
    }
  };

  workflowStore.addNode(newNode);
}

// 手动拖拽处理 (绕过 HTML5 DnD 限制)
function handleManualDragStart({ type, x, y }: { type: Workflow.NodeType; x: number; y: number }) {
  const nodeConfig = availableNodeTypes.find(n => n.type === type);

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
        if (newNode) workflowStore.addNode(newNode);
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
onMounted(() => {
  loadWorkflow();
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
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        class="h-full w-full"
        @pane-ready="onPaneReady"
      >
        <Background />
        <Controls />
        <MiniMap />

        <!-- 自定义节点模板 -->
        <template #node-custom="nodeProps">
          <component
            :is="getNodeComponent(nodeProps.data.type)"
            v-bind="nodeProps"
            @delete-node="handleDeleteNode"
            @duplicate-node="handleDuplicateNode"
          />
        </template>
      </VueFlow>
    </div>
  </div>
</template>
