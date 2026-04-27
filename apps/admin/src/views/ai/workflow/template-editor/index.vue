<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NDropdown, NSpace, NSwitch, useMessage } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useWorkflowLayout } from '@/composables/ai/workflow/use-workflow-layout';
import { useNodeComponents } from '@/composables/ai/workflow/use-node-components';
import { useUnsavedChangesGuard } from '@/composables/ai/workflow/use-unsaved-changes-guard';
import { useGraphInteraction } from '@/composables/ai/workflow/use-graph-interaction';
import { useComponentPanel } from '@/composables/ai/workflow/use-component-panel';
import { $t } from '@/locales';
import ConnectionLine from '@/components/ai/edges/connection-line.vue';
import ComponentLibraryPanel from '@/components/ai/workflow/component-library-panel.vue';
import WorkflowSaveStatus from '@/components/ai/workflow/workflow-save-status.vue';
import WorkflowControls from '@/components/ai/workflow/workflow-controls.vue';
import NodeDrawer from '@/components/ai/workflow/node-drawer.vue';
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
const { getNodes, zoomIn, zoomOut, fitView, nodesDraggable, setInteractive } = useVueFlow();

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

// 页面全屏（CSS fixed 铺满浏览器视口）
const isPageFullscreen = ref(false);
function togglePageFullscreen() {
  isPageFullscreen.value = !isPageFullscreen.value;
}

function toggleInteractive() {
  setInteractive(!nodesDraggable.value);
}

function onKeydownEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isPageFullscreen.value) {
    isPageFullscreen.value = false;
  }
}

// 路由守卫和浏览器关闭守卫
useUnsavedChangesGuard(handleAutoSave);

onMounted(async () => {
  document.addEventListener('keydown', onKeydownEsc);
  try {
    await nodeDefinitionStore.loadNodeDefinitions();
    workflowStore.clearWorkflow();
    await loadWorkflow();
  } catch {
    message.error($t('ai.workflow_template.init_failed'));
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydownEsc);
});

// ---- 工作流操作下拉菜单 ----
const workflowMenuOptions = computed<DropdownOption[]>(() => [
  {
    key: 'save',
    label: $t('common.save'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-content-save-outline', class: 'text-base' })
  },
  { key: 'divider-1', type: 'divider' },
  {
    key: 'auto-save',
    label: '',
    icon: () => h(SvgIcon, { localIcon: 'mdi-content-save-cog-outline', class: 'text-base' })
  }
]);

function renderWorkflowMenuLabel(option: DropdownOption) {
  if (option.key === 'auto-save') {
    return h('div', { class: 'flex items-center justify-between gap-6 w-full' }, [
      h('span', {}, $t('ai.workflow.auto_save')),
      h(NSwitch, {
        value: workflowStore.autoSaveEnabled,
        size: 'small',
        onClick: (e: MouseEvent) => e.stopPropagation(),
        'onUpdate:value': (v: boolean) => {
          workflowStore.autoSaveEnabled = v;
        }
      })
    ]);
  }
  return String(option.label ?? '');
}

function handleWorkflowMenuSelect(key: string) {
  if (key === 'save') handleSave(false);
}
</script>

<template>
  <div class="relative h-full -m-16px">
    <Teleport to="body" :disabled="!isPageFullscreen">
      <div :class="isPageFullscreen ? 'fixed inset-0 z-100 bg-gray-1 dark:bg-dark-1' : 'absolute inset-0'">
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
              :drawer-mode="workflowStore.globalDrawerMode"
              :on-toggle-drawer-mode="workflowStore.toggleGlobalDrawerMode"
              :on-select-node="handleSelectNode"
              :on-drag-start="handleManualDragStart"
              :is-page-fullscreen="isPageFullscreen"
              :on-toggle-page-fullscreen="togglePageFullscreen"
              :is-interactive="nodesDraggable"
              :on-toggle-interactive="toggleInteractive"
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
          <!-- 节点抽屉 -->
          <NodeDrawer />
        </div>

        <!-- 左上角标题 -->
        <div class="absolute left-4 top-4 z-1000">
          <div class="flex items-center gap-2">
            <span class="pointer-events-none font-bold drop-shadow-md">
              {{ templateName || $t('ai.workflow_template.template_edit') }}
            </span>
            <span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
              {{ $t('ai.workflow_template.template') }}
            </span>
          </div>
        </div>

        <!-- 右上角工具栏 -->
        <div class="absolute right-4 top-4 z-1000">
          <NSpace align="center" size="small">
            <WorkflowSaveStatus v-if="workflowStore.autoSaveEnabled" class="mr-2" />
            <NDropdown
              trigger="hover"
              placement="bottom-end"
              :options="workflowMenuOptions"
              :render-label="renderWorkflowMenuLabel"
              @select="handleWorkflowMenuSelect"
            >
              <NButton class="bg-white/90 shadow-md dark:bg-dark-2" :loading="loading">
                {{ $t('ai.workflow_template.workflow') }}
                <template #icon>
                  <SvgIcon local-icon="mdi-dots-horizontal" class="text-base" />
                </template>
              </NButton>
            </NDropdown>
          </NSpace>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import '@/styles/modules/workflow.scss';
</style>
