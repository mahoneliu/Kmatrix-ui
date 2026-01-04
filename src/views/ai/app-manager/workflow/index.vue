<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NCard, NSpace, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
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
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const route = useRoute();
const message = useMessage();
const appId = Number(route.query.appId);

const workflowStore = useWorkflowStore();
const { onConnect, onNodeClick, onNodeDragStop } = useVueFlow();

// 监听节点拖拽结束，更新位置
onNodeDragStop(({ node }) => {
  workflowStore.updateNodePosition(node.id, node.position);
});

const loading = ref(false);
const appName = ref('');
const showComponentLibrary = ref(false);

// 注册自定义节点类型
const nodeTypes = {
  custom: StartNode // 默认使用 StartNode，实际会根据 data.type 动态渲染
};

// 获取所有可用的节点类型
const availableNodeTypes = getAllNodeTypes();

// 打开组件库弹窗
function openComponentLibrary() {
  showComponentLibrary.value = true;
}

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
        workflowStore.setEdges(graphData.edges);
      } else if (res.data.dslData) {
        const dsl = JSON.parse(res.data.dslData);
        const graphData = dslToGraph(dsl);
        workflowStore.setNodes(graphData.nodes);
        workflowStore.setEdges(graphData.edges);
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

// 从组件库选择节点
function handleSelectNode(nodeType: Workflow.NodeType) {
  const nodeConfig = availableNodeTypes.find(n => n.type === nodeType);
  if (!nodeConfig) return;

  // 在画布中心位置添加节点
  const newNode = {
    id: `${nodeType.toLowerCase()}-${Date.now()}`,
    type: 'custom',
    position: { x: 300, y: 200 + workflowStore.nodes.length * 50 },
    data: {
      id: `${nodeType.toLowerCase()}-${Date.now()}`,
      type: nodeType,
      label: nodeConfig.label,
      icon: nodeConfig.icon,
      status: 'idle' as Workflow.NodeStatus,
      config: {}
    }
  };

  workflowStore.addNode(newNode);
}

// 连接节点
onConnect((connection: Connection) => {
  const edge = {
    id: `edge-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    data: {
      id: `edge-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target
    }
  };
  workflowStore.addEdge(edge);
});

// 点击节点
onNodeClick(({ node }) => {
  workflowStore.selectNode(node.id);
});

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
          <NButton @click="openComponentLibrary">
            <template #icon>
              <SvgIcon icon="carbon:add" />
            </template>
            添加组件
          </NButton>
          <NButton @click="workflowStore.clearWorkflow">清空</NButton>
          <NButton type="primary" :loading="loading" @click="handleSave">保存</NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <!-- 画布区域 -->
    <div class="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
      <VueFlow
        v-model:nodes="workflowStore.nodes"
        v-model:edges="workflowStore.edges"
        :node-types="nodeTypes"
        class="h-full w-full"
      >
        <Background />
        <Controls />
        <MiniMap />

        <!-- 自定义节点模板 -->
        <template #node-custom="nodeProps">
          <component :is="getNodeComponent(nodeProps.data.type)" v-bind="nodeProps" />
        </template>
      </VueFlow>
    </div>

    <!-- 组件库弹窗 -->
    <ComponentLibraryModal v-model:visible="showComponentLibrary" @select="handleSelectNode" />
  </div>
</template>

<style scoped>
.node-palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid;
  border-radius: 6px;
  background: white;
  cursor: move;
  font-size: 13px;
  transition: all 0.2s;
}

.node-palette-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
