<script lang="ts" setup>
import { defineAsyncComponent, markRaw, onMounted, onUnmounted, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { NButton, NPopover, NSpace, NSwitch, useDialog, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { ControlButton, Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/workflow';
import { useNodeDefinitionStore } from '@/store/modules/node-definition';
import { useWorkflowLayout } from '@/composables/useWorkflowLayout';
import ConnectionLine from '@/components/Flow/ConnectionLine.vue';
import ComponentLibraryModal from '@/components/Flow/ComponentLibraryModal.vue';
import ComponentLibraryPanel from '@/components/Flow/ComponentLibraryPanel.vue';
import WorkflowSaveStatus from '@/components/Flow/WorkflowSaveStatus.vue';
import DebugChatDialog from '@/components/ai/DebugChatDialog.vue';
import AppInfoNode from '@/components/Flow/Nodes/AppInfoNode.vue';
import StartNode from '@/components/Flow/Nodes/StartNode.vue';
import EndNode from '@/components/Flow/Nodes/EndNode.vue';
import IntentClassifierNode from '@/components/Flow/Nodes/IntentClassifierNode.vue';
import ConditionNode from '@/components/Flow/Nodes/ConditionNode.vue';
import FixedResponseNode from '@/components/Flow/Nodes/FixedResponseNode.vue';
import DbQueryNode from '@/components/Flow/Nodes/DbQueryNode.vue';
import SqlGenerateNode from '@/components/Flow/Nodes/SqlGenerateNode.vue';
import SqlExecuteNode from '@/components/Flow/Nodes/SqlExecuteNode.vue';
import KnowledgeRetrievalNode from '@/components/Flow/Nodes/KnowledgeRetrievalNode.vue';
import { useGraphInteraction } from './composables/useGraphInteraction';
import { useComponentPanel } from './composables/useComponentPanel';
import { useWorkflowPersistence } from './composables/useWorkflowPersistence';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const LlmChatNode = defineAsyncComponent(() => import('@/components/Flow/Nodes/LlmChatNode.vue'));
const DynamicNode = defineAsyncComponent(() => import('@/components/Flow/Nodes/DynamicNode.vue'));

const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();
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
  message.info('发布历史功能开发中...');
}

// 根据节点类型获取对应的组件
function getNodeComponent(nodeType: Workflow.NodeType) {
  const componentMap: Record<Workflow.NodeType, any> = {
    START: markRaw(StartNode),
    END: markRaw(EndNode),
    LLM_CHAT: markRaw(LlmChatNode),
    INTENT_CLASSIFIER: markRaw(IntentClassifierNode),
    CONDITION: markRaw(ConditionNode),
    FIXED_RESPONSE: markRaw(FixedResponseNode),
    DB_QUERY: markRaw(DbQueryNode),
    SQL_GENERATE: markRaw(SqlGenerateNode),
    SQL_EXECUTE: markRaw(SqlExecuteNode),
    KNOWLEDGE_RETRIEVAL: markRaw(KnowledgeRetrievalNode),
    APP_INFO: markRaw(AppInfoNode)
  };
  return componentMap[nodeType] || markRaw(DynamicNode);
}

// 路由守卫
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
      next(false);
    }
  });
});

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (workflowStore.isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  try {
    await nodeDefinitionStore.loadNodeDefinitions();
    workflowStore.clearWorkflow();
    await loadWorkflow();
  } catch {
    message.error('初始化失败,请刷新页面重试');
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
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
        <Controls
          :show-zoom="false"
          :show-fit-view="false"
          :show-interactive="false"
          class="!rounded-5px !bg-[#fbfbfb]"
        >
          <ControlButton title="放大" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="zoomIn">
            <SvgIcon icon="mdi:magnify-plus-outline" class="toolbar-icon" />
          </ControlButton>
          <ControlButton title="缩小" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="zoomOut">
            <SvgIcon icon="mdi:magnify-minus-outline" class="toolbar-icon" />
          </ControlButton>
          <ControlButton title="适应视图" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="fitView">
            <SvgIcon icon="mdi:fit-to-screen-outline" class="toolbar-icon" />
          </ControlButton>
          <div class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)]" />
          <ControlButton
            title="折叠所有节点"
            class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]"
            @click="handleCollapseAll"
          >
            <SvgIcon icon="mdi:unfold-less-horizontal" class="toolbar-icon" />
          </ControlButton>
          <ControlButton title="展开所有节点" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="handleExpandAll">
            <SvgIcon icon="mdi:unfold-more-horizontal" class="toolbar-icon" />
          </ControlButton>
          <div class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)]" />
          <ControlButton title="优雅布局" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="handleAutoLayout">
            <SvgIcon icon="mdi:auto-fix" class="toolbar-icon" />
          </ControlButton>
          <ControlButton
            title="折叠并优雅布局"
            class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]"
            @click="handleCollapseAndLayout"
          >
            <SvgIcon icon="mdi:format-align-justify" class="toolbar-icon" />
          </ControlButton>
        </Controls>
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
            <NButton class="bg-white/90 shadow-md">
              <template #icon>
                <SvgIcon icon="carbon:add" />
              </template>
              组件
            </NButton>
          </template>
        </ComponentLibraryModal>
        <NButton class="bg-white/90 shadow-md" :loading="loading" @click="handleSave">
          <template #icon>
            <SvgIcon icon="mdi:content-save-outline" />
          </template>
          保存
        </NButton>
        <NButton class="bg-white/90 shadow-md" @click="handleDebug">
          <template #icon>
            <SvgIcon icon="mdi:bug-outline" />
          </template>
          调试
        </NButton>
        <NButton type="primary" class="shadow-md" :loading="loading" @click="handlePublish">发布</NButton>
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
            <div
              class="flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="handleGoToChat"
            >
              <SvgIcon icon="mdi:chat-processing-outline" class="text-base text-gray-500" />
              <span>去对话</span>
            </div>
            <div
              class="flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="handlePublishHistory"
            >
              <SvgIcon icon="mdi:history" class="text-base text-gray-500" />
              <span>发布历史</span>
            </div>
            <div class="mx-2 my-1 h-px bg-gray-100 dark:bg-gray-700" />
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

/* 强制覆盖 vue-flow 默认样式 */
:deep(.vue-flow__controls-button) {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 6px !important;
}

:deep(.toolbar-icon) {
  width: 20px !important;
  height: 20px !important;
  font-size: 20px !important;
  display: block;
}

:deep(.toolbar-icon svg) {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  max-width: none !important;
  max-height: none !important;
}
</style>
