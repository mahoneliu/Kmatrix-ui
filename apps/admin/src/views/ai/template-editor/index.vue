<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NSpace, NSwitch, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useWorkflowLayout } from '@/composables/ai/workflow/use-workflow-layout';
import { useNodeComponents } from '@/composables/ai/workflow/use-node-components';
import { useUnsavedChangesGuard } from '@/composables/ai/workflow/use-unsaved-changes-guard';
import ConnectionLine from '@/components/ai/edges/connection-line.vue';
import ComponentLibraryModal from '@/components/ai/workflow/component-library-modal.vue';
import ComponentLibraryPanel from '@/components/ai/workflow/component-library-panel.vue';
import WorkflowSaveStatus from '@/components/ai/workflow/workflow-save-status.vue';
import WorkflowControls from '@/components/ai/workflow/workflow-controls.vue';
import { useGraphInteraction } from '../../../composables/ai/workflow/use-graph-interaction';
import { useComponentPanel } from '../../../composables/ai/workflow/use-component-panel';
import { useTemplatePersistence } from './composables/use-template-persistence';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const route = useRoute();
const message = useMessage();
const templateId = ref(route.query.templateId as unknown as CommonType.IdType);

const workflowStore = useWorkflowStore();
const nodeDefinitionStore = useNodeDefinitionStore();

// Vue Flow composable
const { getNodes, zoomIn, zoomOut, fitView } = useVueFlow();

// Refs
const flowWrapper = ref<HTMLElement | null>(null);
const vueFlowInstance = ref<any>(null);

// Composables - 使用模板专用的持久化逻辑
const { loading, templateName, loadWorkflow, handleSave, handleAutoSave } = useTemplatePersistence(templateId);

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

// 节点组件映射（模板不需要 APP_INFO 节点，使用默认配置）
const { getNodeComponent } = useNodeComponents();

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

    <!-- 左上角标题 -->
    <div class="absolute left-4 top-4 z-1000">
      <div class="flex items-center gap-2">
        <span class="pointer-events-none font-bold drop-shadow-md">{{ templateName || '模板编辑' }}</span>
        <span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">模板</span>
      </div>
    </div>

    <!-- 右上角工具栏 -->
    <div class="absolute right-4 top-4 z-1000">
      <NSpace align="center" size="small">
        <WorkflowSaveStatus v-if="workflowStore.autoSaveEnabled" class="mr-2" />
        <ComponentLibraryModal @select="handleSelectNode" @drag-start="handleManualDragStart">
          <template #trigger>
            <NButton class="bg-white/90 shadow-md dark:bg-dark-2 dark:text-white">
              <template #icon>
                <SvgIcon local-icon="carbon-add" />
              </template>
              组件
            </NButton>
          </template>
        </ComponentLibraryModal>
        <NButton
          class="bg-white/90 shadow-md dark:bg-dark-2 dark:text-white"
          :loading="loading"
          @click="() => handleSave(false)"
        >
          <template #icon>
            <SvgIcon local-icon="mdi-content-save-outline" />
          </template>
          保存
        </NButton>
        <div class="flex items-center gap-2 rounded bg-white/90 px-3 py-1.5 shadow-md dark:bg-dark-2 dark:text-white">
          <SvgIcon local-icon="mdi-content-save-cog-outline" class="text-gray-500 dark:text-white" />
          <span class="text-sm">自动保存</span>
          <NSwitch v-model:value="workflowStore.autoSaveEnabled" size="small" />
        </div>
      </NSpace>
    </div>
  </div>
</template>

<style scoped>
@import '@/styles/modules/workflow.scss';
</style>
