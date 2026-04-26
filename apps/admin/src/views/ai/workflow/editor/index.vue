<script lang="ts" setup>
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onKeyStroke, useMagicKeys, whenever } from '@vueuse/core';
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
import { useWorkflowHistory } from '@/composables/ai/workflow/use-workflow-history';
import { hexToRgba } from '@/utils/color';
import { $t } from '@/locales';
import ConnectionLine from '@/components/ai/edges/connection-line.vue';
import ComponentLibraryPanel from '@/components/ai/workflow/component-library-panel.vue';
import WorkflowSaveStatus from '@/components/ai/workflow/workflow-save-status.vue';
import WorkflowControls from '@/components/ai/workflow/workflow-controls.vue';
import DebugChatDialog from '@/components/ai/chat/debug-chat-dialog.vue';
import PublishHistoryModal from '@/components/ai/workflow/publish-history-modal.vue';
import AppInfoNode from '@/components/ai/Nodes/appInfo-node.vue';
import NodeDrawer from '@/components/ai/workflow/node-drawer.vue';
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
const { getNodes, fitView, nodesDraggable, setInteractive } = useVueFlow();

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

const { handleAutoLayout } = useWorkflowLayout({
  workflowStore,
  vueFlowInstance,
  getNodes,
  message
});

// 初始化历史管理
const { undo, redo, canUndo, canRedo } = useWorkflowHistory();

// 注册快捷键
const { ctrl_z, ctrl_y, ctrl_shift_z, meta_z, meta_y, meta_shift_z } = useMagicKeys();

// 撤销
const handleUndo = () => {
  if (canUndo.value) {
    undo();
  }
};

// 重做
const handleRedo = () => {
  if (canRedo.value) {
    redo();
  }
};

// 撤销: Ctrl+Z (Win) 或 Command+Z (Mac)
whenever(
  () => (ctrl_z.value || meta_z.value) && !meta_shift_z.value && !ctrl_shift_z.value,
  () => {
    handleUndo();
  }
);

// 重做: Ctrl+Y / Ctrl+Shift+Z (Win) 或 Command+Y / Command+Shift+Z (Mac)
whenever(
  () => ctrl_y.value || meta_y.value || ctrl_shift_z.value || meta_shift_z.value,
  () => {
    handleRedo();
  }
);

// 保存: Ctrl+S (Win) 或 Command+S (Mac)
onKeyStroke(['s', 'S'], e => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    handleSave();
  }
});

// 页面全屏（CSS fixed 铺满浏览器视口，非系统全屏）
const isPageFullscreen = ref(false);
const editorRoot = ref<HTMLElement | null>(null);

function togglePageFullscreen() {
  isPageFullscreen.value = !isPageFullscreen.value;
}

// 监听 ESC 键退出全屏
function onKeydownEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isPageFullscreen.value) {
    isPageFullscreen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydownEsc);
  try {
    await nodeDefinitionStore.loadNodeDefinitions(true);
    workflowStore.clearWorkflow();
    await loadWorkflow();
  } catch {
    message.error($t('ai.workflow_template.init_failed'));
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydownEsc);
});

function toggleInteractive() {
  setInteractive(!nodesDraggable.value);
}

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
    debugAppName.value = appName.value || $t('ai.workflow.unnamed_app');
  }
  showDebugDialog.value = true;
}

function handleGoToChat() {
  const { href } = router.resolve({
    path: '/ai/app/chat',
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
    edge.style = { ...edge.style, stroke: runningColor, strokeWidth: 1.5 };
    const edgeClass = typeof edge.class === 'string' ? edge.class : '';
    if (!edgeClass.includes('edge-running')) {
      edge.class = `${edgeClass} edge-running`.trim();
    }
  });

  // 更新 lastRunningNodeId
  lastRunningNodeId.value = newId;
}

// ---- 工作流操作下拉菜单 ----
const workflowMenuOptions = computed<DropdownOption[]>(() => [
  {
    key: 'save',
    label: $t('common.save'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-content-save-outline', class: 'text-base' })
  },
  {
    key: 'debug',
    label: $t('ai.workflow.debug'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-bug-outline', class: 'text-base' })
  },
  {
    key: 'publish',
    label: $t('ai.workflow_template.publish'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-rocket-launch-outline', class: 'text-base text-indigo-500' })
  },
  { key: 'divider-1', type: 'divider' },
  {
    key: 'go-chat',
    label: $t('ai.workflow.go_to_chat'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-chat-processing-outline', class: 'text-base' })
  },
  {
    key: 'publish-history',
    label: $t('ai.workflow.publish_history'),
    icon: () => h(SvgIcon, { localIcon: 'mdi-history', class: 'text-base' })
  },
  { key: 'divider-2', type: 'divider' },
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
  if (option.key === 'publish') {
    return h('span', { class: 'text-indigo-600 dark:text-indigo-400' }, String(option.label));
  }
  return String(option.label ?? '');
}

function handleWorkflowMenuSelect(key: string) {
  if (key === 'save') handleSave();
  else if (key === 'debug') handleDebug();
  else if (key === 'publish') handlePublish();
  else if (key === 'go-chat') handleGoToChat();
  else if (key === 'publish-history') handlePublishHistory();
}
</script>

<template>
  <!-- 非全屏时占位，全屏时 Teleport 到 body 突破 overflow 限制 -->
  <div class="workflow-editor-root relative h-full -m-16px">
    <Teleport to="body" :disabled="!isPageFullscreen">
      <div
        ref="editorRoot"
        :class="isPageFullscreen ? 'fixed inset-0 z-[9999] bg-gray-1 dark:bg-dark-1' : 'absolute inset-0'"
      >
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
              :on-fit-view="fitView"
              :on-auto-layout="handleAutoLayout"
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
              <ConnectionLine
                v-bind="connectionLineProps"
                :source-x="connectionLineProps.sourceX"
                :source-y="connectionLineProps.sourceY"
                :target-x="connectionLineProps.targetX"
                :target-y="connectionLineProps.targetY"
                :source-position="connectionLineProps.sourcePosition"
                :target-position="connectionLineProps.targetPosition"
              />
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
          <NodeDrawer />

          <div
            v-if="showHandlePanel"
            class="fixed z-1000"
            :style="{ left: `${handlePanelPosition.x}px`, top: `${handlePanelPosition.y}px` }"
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
            <NDropdown
              trigger="hover"
              placement="bottom-end"
              :options="workflowMenuOptions"
              :render-label="renderWorkflowMenuLabel"
              @select="handleWorkflowMenuSelect"
            >
              <NButton class="bg-white/90 shadow-md dark:bg-dark-2" :loading="loading">
                工作流
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
