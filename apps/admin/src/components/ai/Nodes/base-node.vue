<script setup lang="ts">
import { computed, defineAsyncComponent, h, inject, onMounted, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NDropdown, NInput, NModal, NTooltip } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { SvgIcon } from '@sa/materials';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useNodeCollapse } from '@/composables/ai/workflow/use-node-collapse';
import { getNodeInputParams, getNodeOutputParams } from '@/utils/ai/node-params';
import { getNodeTypeInfo } from '@/utils/ai/node-registry';
import { getNodeHeaderGradient, getNodeIconBackground } from '@/utils/color';
import { $t } from '@/locales';
import { DRAWER_RENDER_KEY } from '@/components/ai/workflow/drawer-context';

defineOptions({ inheritAttrs: false });

/** 摘要条目 */
export interface SummaryItem {
  /** 标签 */
  label: string;
  /** 值 */
  value: string;
}

const ParamBindingPanel = defineAsyncComponent(() => import('@/components/ai/Nodes/add-in/param-binding-panel.vue'));
const AiConfigPanel = defineAsyncComponent(() => import('@/components/ai/Nodes/add-in/ai-config-panel.vue'));
const DialogConfigPanel = defineAsyncComponent(() => import('@/components/ai/Nodes/add-in/dialog-config-panel.vue'));

interface Props extends NodeProps {
  id: string;
  data: Workflow.NodeData;
  selected: boolean;
  /** 摘要条目（抽屉模式下在节点卡片内展示） */
  summaryItems?: SummaryItem[];
  /** 是否在抽屉中渲染（隐藏节点外壳，只渲染内容） */
  drawerMode?: boolean;
  /** 是否隐藏默认输出 Handle */
  hideSourceHandle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  drawerMode: false,
  summaryItems: () => [],
  hideSourceHandle: false
});

const emit = defineEmits<{
  nodeClick: [id: string];
  deleteNode: [id: string];
  duplicateNode: [id: string];
  sourceHandleClick: [event: MouseEvent, id: string];
}>();

const workflowStore = useWorkflowStore();

// 全局抽屉模式（画布级别）
const isDrawerMode = computed(() => workflowStore.globalDrawerMode);

// 是否在抽屉中渲染：优先使用 prop，其次通过 inject 判断当前渲染上下文是否为抽屉
const isInDrawerContext = inject(DRAWER_RENDER_KEY, false);
const isInDrawer = computed(() => props.drawerMode || isInDrawerContext);

const { collapseProps } = useNodeCollapse();

function openDrawer(e: Event) {
  e.stopPropagation();
  workflowStore.openNodeDrawer(props.id);
}

// 检查连接状态
const hasSourceConnection = computed(() => {
  return workflowStore.edges.some(e => e.source === props.id);
});

const hasTargetConnection = computed(() => {
  return workflowStore.edges.some(e => e.target === props.id);
});

// 头部渐变背景
const headerGradient = computed(() => getNodeHeaderGradient(props.data.nodeColor));

// 图标背景颜色（带透明度）
const iconBackgroundColor = computed(() => getNodeIconBackground(props.data.nodeColor));

// 检查特定 Handle 是否应该高亮
function checkHandleHighlight(handleId: string | null, type: 'source' | 'target') {
  const hovered = workflowStore.hoveredNodeId;
  if (!hovered) return false;

  return workflowStore.edges.some(e => {
    if (type === 'source') {
      return (
        e.source === props.id &&
        (e.sourceHandle === handleId || (!e.sourceHandle && !handleId)) &&
        (e.target === hovered || props.id === hovered)
      );
    }
    return (
      e.target === props.id &&
      (e.targetHandle === handleId || (!e.targetHandle && !handleId)) &&
      (e.source === hovered || props.id === hovered)
    );
  });
}

// 默认 Source Handle 高亮状态
const shouldHighlightSourceHandle = computed(() => checkHandleHighlight(null, 'source'));

// 默认 Target Handle 高亮状态
const shouldHighlightTargetHandle = computed(() => checkHandleHighlight(null, 'target'));

// 节点是否被悬停
const isHovered = computed(() => workflowStore.hoveredNodeId === props.id);

// 动态计算 Handle 样式
// 使用 background 简写而非 backgroundColor，确保完整覆盖 vue-flow 的 background 简写属性
function getHandleStyle(highlighted: boolean) {
  const baseStyle = {
    background: props.data.nodeColor,
    zIndex: 10
  };
  if (!highlighted) return baseStyle;
  return { ...baseStyle };
}

// 折叠状态
const collapsed = ref(false);

// 初始化标记，防止初始化阶段触发不必要的更新
const isInitializing = ref(true);

// 参数绑定状态
const paramBindings = ref<Workflow.ParamBinding[]>([]);

// 输入参数定义
const inputParams = computed(() => {
  if (!props.data.nodeType) return [];
  return getNodeInputParams(props.data.nodeType);
});

// 输出参数定义
const outputParams = computed(() => {
  if (!props.data.nodeType) return [];

  // 1. 获取数据库定义的静态出参
  const baseParams = getNodeOutputParams(props.data.nodeType);

  // 2. 获取业务动态出参
  // 优先读取标准字段 dynamicOutputParams
  const dynamicOutputs = props.data.dynamicOutputParams || [];

  // 合并并格式化输出
  return [...baseParams, ...dynamicOutputs].map(p => ({
    key: p.key,
    label: p.label,
    type: p.type,
    required: p.required || false,
    defaultValue: p.defaultValue || '',
    description: p.description || ''
  }));
});

// 获取节点定义配置
const nodeConfig = computed(() => {
  if (!props.data.nodeType) return null;
  return getNodeTypeInfo(props.data.nodeType);
});

const isAiNode = computed(() => nodeConfig.value?.requireAiConfig === '1');
const isDialogNode = computed(() => nodeConfig.value?.requireDialogConfig === '1');
const allowCustomInput = computed(() => nodeConfig.value?.allowCustomInputParams === '1');
const allowCustomOutput = computed(() => nodeConfig.value?.allowCustomOutputParams === '1');

// 自定义参数
const customInputParams = ref<Workflow.ParamDefinition[]>([]);
const customOutputParams = ref<Workflow.ParamDefinition[]>([]);

watch(
  () => props.data,
  newData => {
    const oldInputKeys = new Set(customInputParams.value.map(p => p.key));
    const oldOutputKeys = new Set(customOutputParams.value.map(p => p.key));

    customInputParams.value = newData.customInputParams || [];
    customOutputParams.value = newData.customOutputParams || [];

    const newInputKeys = new Set(customInputParams.value.map(p => p.key));
    const newOutputKeys = new Set(customOutputParams.value.map(p => p.key));
    // ... rest of binding cleanup logic ...
    const deletedInputKeys = [...oldInputKeys].filter(key => !newInputKeys.has(key));
    const deletedOutputKeys = [...oldOutputKeys].filter(key => !newOutputKeys.has(key));
    if (deletedInputKeys.length > 0 || deletedOutputKeys.length > 0) {
      paramBindings.value = paramBindings.value.filter(binding => {
        if (deletedInputKeys.includes(binding.paramKey)) return false;
        if (
          binding.sourceType === 'node' &&
          binding.sourceKey === props.id &&
          deletedOutputKeys.includes(binding.sourceParam || '')
        )
          return false;
        return true;
      });
    }
  },
  { immediate: true, deep: true }
);

watch(
  [customInputParams, customOutputParams],
  ([newInputs, newOutputs]) => {
    if (
      JSON.stringify(newInputs) !== JSON.stringify(props.data.customInputParams) ||
      JSON.stringify(newOutputs) !== JSON.stringify(props.data.customOutputParams)
    ) {
      // 避免在初始化或无变化时更新
      if (isInitializing.value) return;

      workflowStore.updateNode(props.id, {
        customInputParams: newInputs,
        customOutputParams: newOutputs
      });
    }
  },
  { deep: true }
);

onMounted(() => {
  paramBindings.value = props.data.paramBindings || [];
  isInitializing.value = false;
});

watch(
  () => workflowStore.collapseAllNodes,
  newValue => {
    if (newValue !== null) collapsed.value = newValue;
  }
);

watch(
  paramBindings,
  newBindings => {
    const node = workflowStore.nodes.find(n => n.id === props.id);
    if (node) {
      if (JSON.stringify(newBindings) !== JSON.stringify(props.data.paramBindings)) {
        workflowStore.updateNode(props.id, { paramBindings: newBindings });
      }
    }
  },
  { deep: true }
);

watch(
  () => props.data.paramBindings,
  newBindings => {
    if (newBindings && JSON.stringify(newBindings) !== JSON.stringify(paramBindings.value)) {
      paramBindings.value = newBindings;
    }
  },
  { deep: true }
);

// Handle 显示状态
const showHandles = ref(false);
let handleHideTimer: number | null = null;

// 节点操作菜单是否展开
const isMenuOpen = ref(false);

// 浮动操作栏显示状态（hover 或 selected 或菜单打开中）
const showFloatingActions = computed(() => showHandles.value || props.selected || isMenuOpen.value);

// 菜单选项
const menuOptions: DropdownOption[] = [
  {
    label: $t('ai.workflow_node.rename_node'),
    key: 'rename',
    icon: () => h(SvgIcon, { localIcon: 'mdi-rename-box', class: 'text-18px' })
  },
  {
    label: $t('ai.workflow_node.copy_node'),
    key: 'duplicate',
    icon: () => h(SvgIcon, { localIcon: 'mdi-content-copy', class: 'text-18px' })
  },
  {
    label: $t('ai.workflow_node.delete_node'),
    key: 'delete',
    icon: () => h(SvgIcon, { localIcon: 'mdi-delete-outline', class: 'text-18px' })
  }
];

// 计算样式类
const statusClass = computed(() => {
  const classes = [];
  if (props.selected) classes.push('selected');
  if (isHovered.value) classes.push('hovered');
  return classes.join(' ');
});

// 计算边框样式
const outlineStyle = computed(() => {
  const isHighlighted = props.selected || isHovered.value;

  let boxShadow;
  if (props.selected) {
    // 选中状态：发光投影效果
    boxShadow = `0 0 0 3px ${props.data.nodeColor}30`;
  } else if (isHovered.value) {
    // 悬停状态：轻微投影
    boxShadow = `0 0 0 1.5px ${props.data.nodeColor}20`;
  }

  let outline = '1px solid rgba(0,0,0,0.1)';
  if (props.selected) {
    outline = `2px solid ${props.data.nodeColor}`;
  } else if (isHighlighted) {
    outline = `1px solid ${props.data.nodeColor}`;
  }

  return {
    outline,
    outlineOffset: '-1px',
    boxShadow
  };
});

function handleClick() {
  emit('nodeClick', props.id);
  // 抽屉模式下点击节点打开抽屉
  if (isDrawerMode.value) {
    workflowStore.openNodeDrawer(props.id);
  }
}

function toggleCollapse(e: Event) {
  e.stopPropagation();
  collapsed.value = !collapsed.value;
}

function handleMenuSelect(key: string) {
  if (key === 'delete') {
    emit('deleteNode', props.id);
  } else if (key === 'duplicate') {
    emit('duplicateNode', props.id);
  } else if (key === 'rename') {
    handleRename();
  }
}

function isHandleConnected(handleId: string) {
  return workflowStore.edges.some(e => e.source === props.id && e.sourceHandle === handleId);
}

function handleSourceHandleClick(e: MouseEvent) {
  e.stopPropagation();
  emit('sourceHandleClick', e, props.id);
}

function handleMouseEnter() {
  if (handleHideTimer) {
    clearTimeout(handleHideTimer);
    handleHideTimer = null;
  }
  showHandles.value = true;
}

function handleMouseLeave() {
  if (hasSourceConnection.value) {
    showHandles.value = false;
    return;
  }
  handleHideTimer = window.setTimeout(() => {
    showHandles.value = false;
  }, 1000);
}

// 重命名相关
const showRenameModal = ref(false);
const newLabel = ref('');

function handleRename() {
  newLabel.value = props.data.nodeLabel || $t('ai.workflow_node.unnamed_node');
  showRenameModal.value = true;
}

function confirmRename() {
  if (!newLabel.value.trim()) {
    showRenameModal.value = false;
    return;
  }
  const node = workflowStore.nodes.find(n => n.id === props.id);
  if (node) {
    workflowStore.updateNode(props.id, { ...props.data, nodeLabel: newLabel.value });
  }
  showRenameModal.value = false;
}

function handleAiConfigUpdate(aiConfig: Workflow.AiConfig) {
  const currentConfig = props.data.config || {};
  workflowStore.updateNode(props.id, { config: { ...currentConfig, ...aiConfig } });
}
</script>

<template>
  <template v-if="isInDrawer">
    <div class="nodrag w-full text-3 c-gray-5 dark:c-gray-4" v-bind="$attrs">
      <slot
        :show-handles="false"
        :drawer-mode="true"
        :canvas-drawer-mode="false"
        :has-source-connection="hasSourceConnection"
        :is-handle-connected="isHandleConnected"
        :param-bindings="paramBindings"
        :input-params="inputParams"
        :output-params="outputParams"
        :check-handle-highlight="checkHandleHighlight"
        :get-handle-style="getHandleStyle"
      />
    </div>
    <NCollapse v-if="isAiNode" v-bind="collapseProps([], ['ai-config'])" class="pt-3">
      <template #arrow>
        <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
      </template>
      <AiConfigPanel :node-data="data" :node-id="id" @update-ai-config="handleAiConfigUpdate" />
    </NCollapse>
    <NCollapse v-if="isDialogNode" v-bind="collapseProps([], ['dialog-config'])" class="pt-3">
      <template #arrow>
        <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
      </template>
      <DialogConfigPanel :node-id="id" :node-data="data" />
    </NCollapse>
    <NCollapse
      v-if="inputParams.length > 0 || outputParams.length > 0 || allowCustomInput || allowCustomOutput"
      v-bind="collapseProps([], ['params'])"
      class="pb-2 pt-3"
    >
      <template #arrow>
        <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
      </template>
      <NCollapseItem :title="$t('ai.workflow_node.node_param')" name="params">
        <ParamBindingPanel
          v-model:bindings="paramBindings"
          v-model:custom-input-params="customInputParams"
          v-model:custom-output-params="customOutputParams"
          :node-id="id"
          :node-data="data"
          :input-params="inputParams"
          :output-params="outputParams"
          :allow-custom-input="allowCustomInput"
          :allow-custom-output="allowCustomOutput"
        />
      </NCollapseItem>
    </NCollapse>
  </template>

  <div
    v-else
    class="workflow-node-wrapper"
    :class="{ 'drawer-mode': isDrawerMode }"
    v-bind="$attrs"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 浮动操作栏：节点右上角外部，hover 或 selected 时显示 -->
    <Transition name="floating-actions">
      <div
        v-if="showFloatingActions && !['START', 'APP_INFO', 'END'].includes(data.nodeType)"
        class="node-floating-actions nodrag"
        @click.stop
      >
        <!-- 描述信息（原头部 ! 图标移至此处） -->
        <NTooltip v-if="data.description" trigger="hover" placement="top">
          <template #trigger>
            <span class="floating-action-btn">
              <SvgIcon local-icon="mdi-information-outline" class="text-3.5 c-gray-4" />
            </span>
          </template>
          {{ data.description }}
        </NTooltip>
        <!-- 更多操作 -->
        <NDropdown
          :options="menuOptions"
          trigger="click"
          placement="bottom-end"
          @select="handleMenuSelect"
          @update:show="v => (isMenuOpen = v)"
        >
          <span class="floating-action-btn">
            <SvgIcon local-icon="mdi-dots-horizontal" class="text-3.5 c-gray-6" />
          </span>
        </NDropdown>
      </div>
    </Transition>

    <!-- 节点卡片 -->
    <div
      class="workflow-node min-w-45 cursor-pointer rounded-2 bg-white shadow-sm dark:bg-dark-2 hover:shadow-lg"
      :class="[statusClass, { 'handles-visible': showHandles || selected }]"
      :style="outlineStyle"
      @click="handleClick"
    >
      <!-- 节点头部 -->
      <div
        class="relative flex cursor-move items-center gap-2 rounded-t-2 px-4 py-2 text-3.5 c-gray-8 font-600 dark:c-gray-1"
        :style="{ background: headerGradient }"
      >
        <!-- 输入连接点 (左侧，对齐标题中央) -->
        <Handle
          v-if="data.nodeType !== 'START' && data.nodeType !== 'APP_INFO'"
          :position="Position.Left"
          type="target"
          :connectable-start="false"
          :connectable-end="true"
          class="custom-handle custom-handle-target header-handle"
          :class="[{ highlighted: shouldHighlightTargetHandle }, { connected: hasTargetConnection }]"
          :style="getHandleStyle(shouldHighlightTargetHandle)"
        />
        <div
          class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-1 -ml-2"
          :style="{ backgroundColor: iconBackgroundColor, color: data.nodeColor }"
        >
          <SvgIcon v-if="data.nodeIcon" :local-icon="data.nodeIcon" />
          <SvgIcon v-else local-icon="mdi-file-document-outline" />
        </div>
        <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-4 font-bold">
          {{ data.nodeLabel }}
        </span>
        <!-- 折叠按钮（内嵌模式下保留） -->
        <span
          v-if="!isDrawerMode"
          class="mr-4 h-5 w-5 flex cursor-pointer items-center justify-center rounded bg-transparent transition-colors hover:bg-gray-2 dark:hover:bg-dark-3"
          @click="toggleCollapse"
        >
          <SvgIcon :local-icon="collapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="text-4 c-gray-5" />
        </span>

        <!-- 输出连接点 (右侧，对齐标题中央) -->
        <Handle
          v-if="
            !hideSourceHandle && !['END', 'APP_INFO', 'INTENT_CLASSIFIER', 'CONDITION', 'LOOP'].includes(data.nodeType)
          "
          :position="Position.Right"
          type="source"
          class="custom-handle custom-handle-source header-handle"
          :class="[
            { 'handles-visible': showHandles || selected },
            { highlighted: shouldHighlightSourceHandle },
            { connected: hasSourceConnection }
          ]"
          :style="getHandleStyle(shouldHighlightSourceHandle)"
          @click="handleSourceHandleClick"
        />
      </div>

      <!-- 节点主体 -->
      <div class="pb-3 pl-2 pr-2">
        <!-- 抽屉模式：有摘要时展示，无摘要时不渲染任何内容 -->
        <template v-if="isDrawerMode">
          <div
            v-if="summaryItems && summaryItems.length > 0"
            class="mt-1.5 cursor-pointer rounded-1 bg-gray-1 px-2 py-1 text-3 transition-colors dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-4"
            @click="openDrawer"
          >
            <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <div
                v-for="item in summaryItems"
                :key="item.label"
                class="flex items-center gap-1 truncate leading-relaxed"
              >
                <span class="flex-shrink-0 c-gray-4">{{ item.label }}:</span>
                <span class="truncate c-gray-7 font-500 dark:c-gray-2">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <!-- 画布抽屉模式仅对有自定义 Handle 的节点渲染 slot，以保持 Handle 可连线 -->
          <div
            v-if="$slots.default && ['INTENT_CLASSIFIER', 'CONDITION', 'LOOP'].includes(data.nodeType)"
            class="nodrag"
          >
            <slot
              :show-handles="showHandles"
              :drawer-mode="false"
              :canvas-drawer-mode="true"
              :has-source-connection="hasSourceConnection"
              :is-handle-connected="isHandleConnected"
              :param-bindings="paramBindings"
              :input-params="inputParams"
              :output-params="outputParams"
              :check-handle-highlight="checkHandleHighlight"
              :get-handle-style="getHandleStyle"
            />
          </div>
        </template>

        <!-- 内嵌模式：节点内容插槽 -->
        <template v-else>
          <div
            v-if="!collapsed && $slots.default"
            class="nodrag mt-2 b-gray-2 b-solid pt-2 text-3 c-gray-5 dark:b-dark-3 dark:c-gray-4"
          >
            <slot
              :show-handles="showHandles"
              :drawer-mode="false"
              :canvas-drawer-mode="false"
              :has-source-connection="hasSourceConnection"
              :is-handle-connected="isHandleConnected"
              :param-bindings="paramBindings"
              :input-params="inputParams"
              :output-params="outputParams"
              :check-handle-highlight="checkHandleHighlight"
              :get-handle-style="getHandleStyle"
            />
          </div>
          <div v-if="!collapsed" class="nodrag mt-2 text-3 c-gray-5 dark:c-gray-4">
            <NCollapse v-if="isAiNode" v-bind="collapseProps([], ['ai-config'])" class="pt-3">
              <template #arrow>
                <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
              </template>
              <AiConfigPanel :node-data="data" :node-id="id" @update-ai-config="handleAiConfigUpdate" />
            </NCollapse>
            <NCollapse v-if="isDialogNode" v-bind="collapseProps([], ['dialog-config'])" class="pt-3">
              <template #arrow>
                <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
              </template>
              <DialogConfigPanel :node-id="id" :node-data="data" />
            </NCollapse>
            <NCollapse
              v-if="inputParams.length > 0 || outputParams.length > 0 || allowCustomInput || allowCustomOutput"
              v-bind="collapseProps([], ['params'])"
              class="pb-2 pt-3"
            >
              <template #arrow>
                <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
              </template>
              <NCollapseItem :title="$t('ai.workflow_node.node_param')" name="params">
                <ParamBindingPanel
                  v-model:bindings="paramBindings"
                  v-model:custom-input-params="customInputParams"
                  v-model:custom-output-params="customOutputParams"
                  :node-id="id"
                  :node-data="data"
                  :input-params="inputParams"
                  :output-params="outputParams"
                  :allow-custom-input="allowCustomInput"
                  :allow-custom-output="allowCustomOutput"
                />
              </NCollapseItem>
            </NCollapse>
          </div>
        </template>

        <!-- 状态指示器 -->
        <div
          v-if="data.status && data.status !== 'idle'"
          class="absolute h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-md -right-2 -top-2 dark:bg-dark-2"
        >
          <div v-if="data.status === 'running'" class="i-mdi:loading animate-spin c-blue-5" />
          <div v-else-if="data.status === 'success'" class="i-mdi:check-circle c-green-5" />
          <div v-else-if="data.status === 'error'" class="i-mdi:alert-circle c-red-5" />
        </div>

        <!-- 重命名弹窗 -->
        <NModal
          v-model:show="showRenameModal"
          preset="dialog"
          :title="$t('ai.workflow_node.rename_node')"
          positive-text="确认"
          :negative-text="$t('common.cancel')"
          @positive-click="confirmRename"
          @negative-click="showRenameModal = false"
          @click.stop
        >
          <div class="py-4" @click.stop>
            <NInput
              v-model:value="newLabel"
              :placeholder="$t('ai.workflow_template.please_input_node_name')"
              autofocus
              @keyup.enter="confirmRename"
            />
          </div>
        </NModal>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* wrapper 用于定位浮动操作栏，需要 overflow visible */
.workflow-node-wrapper {
  position: relative;
}

/* 浮动操作栏：节点右上角外部 */
.node-floating-actions {
  position: absolute;
  top: -36px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 20;
}

:global(.dark) .node-floating-actions {
  background: #2d2d3f;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.floating-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.floating-action-btn:hover {
  background: #f3f4f6;
}

:global(.dark) .floating-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 浮动操作栏出现动画 */
.floating-actions-enter-active,
.floating-actions-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.floating-actions-enter-from,
.floating-actions-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* 节点卡片过渡 */
.workflow-node {
  transition:
    outline 0.2s ease,
    box-shadow 0.2s ease !important;
}

/* 抽屉模式下节点宽度调宽 */
.workflow-node-wrapper.drawer-mode .workflow-node {
  max-width: 280px !important;
}

/* 抽屉模式下各节点 scoped min-width 覆盖 */
.workflow-node-wrapper.drawer-mode :deep(.workflow-node) {
  min-width: 200px !important;
  max-width: 280px !important;
}

.workflow-node * {
  transition: all 0.2s ease;
}

:deep(.n-base-selection-label),
:deep(.n-base-selection-input),
:deep(.n-base-selection-placeholder) {
  font-size: 11px !important;
}

:deep(.custom-handle) {
  transition: all 0.2s;
}

/* Handle 定位到标题行中央 */
/* header 高度约 40px，中心在 20px */
:deep(.header-handle) {
  top: 50% !important;
}

/* 恢复分支类 Handle 的默认垂直居中 */
:deep(.branch-row-handle .custom-handle) {
  top: 50% !important;
}

.vue-flow__handle {
  min-width: 2px;
}
</style>

<style>
.n-base-select-option {
  font-size: 11px !important;
}
</style>
