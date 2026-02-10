<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NPopover, NSpace, NSwitch, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useWorkflowLayout } from '@/composables/ai/workflow/use-workflow-layout';
import { useNodeComponents } from '@/composables/ai/workflow/use-node-components';
import { useUnsavedChangesGuard } from '@/composables/ai/workflow/use-unsaved-changes-guard';
import { hexToRgba } from '@/utils/color';
import ConnectionLine from '@/components/ai/edges/connection-line.vue';
import ComponentLibraryModal from '@/components/ai/workflow/component-library-modal.vue';
import ComponentLibraryPanel from '@/components/ai/workflow/component-library-panel.vue';
import WorkflowSaveStatus from '@/components/ai/workflow/workflow-save-status.vue';
import WorkflowControls from '@/components/ai/workflow/workflow-controls.vue';
import DebugChatDialog from '@/components/ai/chat/debug-chat-dialog.vue';
import PublishHistoryModal from '@/components/ai/workflow/publish-history-modal.vue';
import AppInfoNode from '@/components/ai/Nodes/appInfo-node.vue';
import { useGraphInteraction } from '../../../composables/ai/workflow/useGraphInteraction';
import { useComponentPanel } from '../../../composables/ai/workflow/useComponentPanel';
import { useWorkflowPersistence } from './composables/use-workflow-persistence';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const appId = ref(route.query.appId as unknown as CommonType.IdType);

const workflowStore = useWorkflowStore();
const nodeDefinitionStore = useNodeDefinitionStore();

// Vue Flow composable
const { getNodes, zoomIn, zoomOut, fitView } = useVueFlow();

// Refs
const flowWrapper = ref<HTMLElement | null>(null);
const vueFlowInstance = ref<any>(null);

// Composables
const { loading, appName, loadWorkflow, handleSave, handlePublish, handleAutoSave } = useWorkflowPersistence(appId);

const {
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
  handleSelectNode
} = useComponentPanel(vueFlowInstance, flowWrapper);

const { onPaneReady, handleDeleteNode, handleDuplicateNode, edgeTypes } = useGraphInteraction(
  vueFlowInstance,
  showHandlePanel,
  handleSourceHandleClick
);

const { handleAutoLayout, handleCollapseAll, handleExpandAll, handleCollapseAndLayout } = useWorkflowLayout({
  workflowStore,
  vueFlowInstance,
  getNodes,
  message
});

// 调试对话窗口
const showDebugDialog = ref(false);
const debugAppName = ref('');

// 发布历史弹窗
const showPublishHistory = ref(false);

async function handleDebug() {
  const success = await handleSave(true);
  if (!success) return;

  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  if (appInfoNode?.data.config) {
    debugAppName.value = appName.value || '未命名应用';
  }
  showDebugDialog.value = true;
}

function handleGoToChat() {
  const { href } = router.resolve({
    path: '/ai/chat',
    query: { appId: appId.value }
  });
  router.push(href);
}

function handlePublishHistory() {
  showPublishHistory.value = true;
}

// 节点组件映射
const { getNodeComponent } = useNodeComponents({ appInfoComponent: AppInfoNode });

// 路由守卫和浏览器关闭守卫
useUnsavedChangesGuard(handleAutoSave);

onMounted(async () => {
  try {
    await nodeDefinitionStore.loadNodeDefinitions();
    workflowStore.clearWorkflow();
    await loadWorkflow();
  } catch {
    message.error('初始化失败,请刷新页面重试');
  }
});

const lastRunningNodeId = ref<string | null>(null);

// 监听运行节点变化，更新节点状态
watch(
  () => workflowStore.runningNodeId,
  (newId, oldId) => {
    handleRunningNodeChange(newId, oldId);
  }
);

function handleRunningNodeChange(newId: string | null, oldId: string | null) {
  if (oldId) {
    restoreOldNodeState(oldId);
  }
  if (newId) {
    updateNewNodeState(newId, oldId);
  }
}

function restoreOldNodeState(oldId: string) {
  const oldNode = workflowStore.nodes.find(n => n.id === oldId);
  if (oldNode) {
    oldNode.data = { ...oldNode.data, running: false };
    const oldClass = typeof oldNode.class === 'string' ? oldNode.class : '';
    oldNode.class = oldClass.replace(/node-running/g, '').trim();

    // 移除动态样式变量
    if (oldNode.style) {
      const newStyle = { ...oldNode.style };
      // 使用类型断言避免TS报错
      const styleAny = newStyle as any;
      if (styleAny['--node-running-color']) delete styleAny['--node-running-color'];
      if (styleAny['--node-running-shadow']) delete styleAny['--node-running-shadow'];
      oldNode.style = newStyle;
    }
  }

  // 恢复指向旧节点的边
  const inboundEdges = workflowStore.edges.filter(e => e.target === oldId);
  inboundEdges.forEach(edge => {
    edge.animated = false;
    edge.style = { ...edge.style, stroke: undefined, strokeWidth: undefined };
    const edgeClass = typeof edge.class === 'string' ? edge.class : '';
    edge.class = edgeClass.replace(/edge-running/g, '').trim();
  });
}

function updateNewNodeState(newId: string, oldId: string | null) {
  const newNode = workflowStore.nodes.find(n => n.id === newId);

  // 获取节点定义及颜色
  const nodeType = newNode?.data?.nodeType;
  const nodeDef = nodeType ? nodeDefinitionStore.getNodeDefinition(nodeType) : null;
  const nodeColor = nodeDef?.nodeColor || '#2d8cf0';
  const runningColor = hexToRgba(nodeColor, 1);
  const shadowColor = hexToRgba(nodeColor, 0.5);

  if (newNode) {
    newNode.data = { ...newNode.data, running: true };

    // 设置动态样式变量
    newNode.style = {
      ...(newNode.style || {}),
      '--node-running-color': runningColor,
      '--node-running-shadow': shadowColor
    };

    const newClass = typeof newNode.class === 'string' ? newNode.class : '';
    // 避免重复添加
    if (!newClass.includes('node-running')) {
      newNode.class = `${newClass} node-running`.trim();
    }
  }

  // 高亮指向新节点的边
  const inboundEdges = workflowStore.edges.filter(e => e.target === newId);
  let edgesToAnimate = inboundEdges;

  // 尝试获取上一个运行节点（优先使用 oldId，如果是 null 则使用 lastRunningNodeId）
  const sourceNodeId = oldId || lastRunningNodeId.value;

  // 如果有多个入边（如End节点），只高亮来自上一个运行节点的边
  if (inboundEdges.length > 1 && sourceNodeId) {
    const connectedEdges = inboundEdges.filter(e => e.source === sourceNodeId);
    if (connectedEdges.length > 0) {
      edgesToAnimate = connectedEdges;
    }
  }

  edgesToAnimate.forEach(edge => {
    edge.animated = true;
    // 使用与节点一致的主题色
    edge.style = { ...edge.style, stroke: runningColor, strokeWidth: 3 };
    const edgeClass = typeof edge.class === 'string' ? edge.class : '';
    if (!edgeClass.includes('edge-running')) {
      edge.class = `${edgeClass} edge-running`.trim();
    }
  });

  // 更新 lastRunningNodeId
  lastRunningNodeId.value = newId;
}
</script>

<template>
  <div class="relative h-full">
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
        <WorkflowControls
          :on-zoom-in="zoomIn"
          :on-zoom-out="zoomOut"
          :on-fit-view="fitView"
          :on-collapse-all="handleCollapseAll"
          :on-expand-all="handleExpandAll"
          :on-auto-layout="handleAutoLayout"
          :on-collapse-and-layout="handleCollapseAndLayout"
        />
        <MiniMap />
        <template #connection-line="connectionLineProps">
          <ConnectionLine v-bind="connectionLineProps" />
        </template>
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

      <DebugChatDialog v-model:visible="showDebugDialog" :app-id="String(appId)" :app-name="debugAppName" />
      <PublishHistoryModal v-model:visible="showPublishHistory" :app-id="String(appId)" />

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
      <div v-if="showHandlePanel" class="fixed inset-0 z-999" @click="handleSourceHandleClose" />
    </div>

    <div class="absolute left-4 top-4 z-1000">
      <div class="pointer-events-none text-base font-bold drop-shadow-md">{{ appName }}</div>
    </div>

    <div class="absolute right-4 top-4 z-1000">
      <NSpace align="center" size="small">
        <WorkflowSaveStatus v-if="workflowStore.autoSaveEnabled" class="mr-2" />
        <ComponentLibraryModal @select="handleSelectNode" @drag-start="handleManualDragStart">
          <template #trigger>
            <NButton class="bg-white/90 shadow-md dark:bg-dark-2">
              <template #icon>
                <SvgIcon local-icon="carbon-add" />
              </template>
              组件
            </NButton>
          </template>
        </ComponentLibraryModal>
        <NButton class="bg-white/90 shadow-md dark:bg-dark-2" :loading="loading" @click="handleSave">
          <template #icon>
            <SvgIcon local-icon="mdi-content-save-outline" />
          </template>
          保存
        </NButton>
        <NButton class="bg-white/90 shadow-md dark:bg-dark-2" @click="handleDebug">
          <template #icon>
            <SvgIcon local-icon="mdi-bug-outline" />
          </template>
          调试
        </NButton>
        <NButton type="primary" class="shadow-md" :loading="loading" @click="handlePublish">发布</NButton>
        <NPopover trigger="hover" placement="bottom" :show-arrow="false">
          <template #trigger>
            <NButton quaternary circle class="ml-1">
              <template #icon>
                <SvgIcon local-icon="mdi-dots-vertical" class="text-xl" />
              </template>
            </NButton>
          </template>
          <div class="min-w-[160px] flex flex-col rounded-md bg-white py-1 text-sm dark:bg-dark-2">
            <div
              class="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="handleGoToChat"
            >
              <SvgIcon local-icon="mdi-chat-processing-outline" class="text-base text-gray-500" />
              <span>去对话</span>
            </div>
            <div
              class="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              @click="handlePublishHistory"
            >
              <SvgIcon local-icon="mdi-history" class="text-base text-gray-500" />
              <span>发布历史</span>
            </div>
            <div class="mx-2 my-0.5 h-px bg-gray-200 dark:bg-gray-700" />
            <div class="flex items-center justify-between px-3 py-2">
              <div class="flex items-center gap-2">
                <SvgIcon local-icon="mdi-content-save-cog-outline" class="text-base text-gray-500" />
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
@import '@/styles/modules/workflow.scss';

:deep(.vue-flow__node.node-running) {
  border-radius: 8px;
  /* 使用动态变量，fallback 为默认蓝色 */
  box-shadow:
    0 0 0 2px var(--node-running-color, #2d8cf0),
    0 0 10px var(--node-running-shadow, rgba(45, 140, 240, 0.5)) !important;
  transition: all 0.3s ease;
  z-index: 1000 !important;
  /* 简单的脉冲动画 */
  animation: pulse-border 1.5s infinite;
}

@keyframes pulse-border {
  0% {
    box-shadow:
      0 0 0 2px var(--node-running-color, #2d8cf0),
      0 0 0 0 var(--node-running-shadow, rgba(45, 140, 240, 0.7));
  }

  70% {
    box-shadow:
      0 0 0 2px var(--node-running-color, #2d8cf0),
      0 0 0 6px rgba(45, 140, 240, 0);
  }

  100% {
    box-shadow:
      0 0 0 2px var(--node-running-color, #2d8cf0),
      0 0 0 0 rgba(45, 140, 240, 0);
  }
}
</style>
