<script setup lang="ts">
import { computed, defineAsyncComponent, h, onMounted, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NDropdown, NInput, NModal } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getNodeInputParams, getNodeOutputParams } from '@/utils/workflow/node-params';
import { getNodeTypeInfo } from '@/utils/workflow/node-registry';
import { getNodeHeaderGradient, getNodeIconBackground } from '@/utils/color';
import SvgIcon from '@/components/custom/svg-icon.vue';

const ParamBindingPanel = defineAsyncComponent(() => import('@/components/Flow/ParamBindingPanel.vue'));

interface Props extends NodeProps {
  id: string;
  data: Workflow.NodeData;
  selected: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  nodeClick: [id: string];
  deleteNode: [id: string];
  duplicateNode: [id: string];
  sourceHandleClick: [event: MouseEvent, id: string];
}>();

const workflowStore = useWorkflowStore();

// 检查连接状态
const hasSourceConnection = computed(() => {
  return workflowStore.edges.some(e => e.source === props.id);
});

// 头部渐变背景
const headerGradient = computed(() => getNodeHeaderGradient(props.data.nodeColor));

// 图标背景颜色（带透明度）
const iconBackgroundColor = computed(() => getNodeIconBackground(props.data.nodeColor));

// 折叠状态
const collapsed = ref(false);

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
  const params = getNodeOutputParams(props.data.nodeType);
  // 转换为完整的 ParamDefinition 格式
  return params.map(p => ({
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

// 是否允许自定义参数
const allowCustomInput = computed(() => nodeConfig.value?.allowCustomInputParams === '1');
const allowCustomOutput = computed(() => nodeConfig.value?.allowCustomOutputParams === '1');

// 自定义参数
const customInputParams = ref<Workflow.ParamDefinition[]>([]);
const customOutputParams = ref<Workflow.ParamDefinition[]>([]);

// 初始化自定义参数
watch(
  () => props.data,
  newData => {
    const oldInputKeys = new Set(customInputParams.value.map(p => p.key));
    const oldOutputKeys = new Set(customOutputParams.value.map(p => p.key));

    customInputParams.value = newData.customInputParams || [];
    customOutputParams.value = newData.customOutputParams || [];

    // 检测删除的参数
    const newInputKeys = new Set(customInputParams.value.map(p => p.key));
    const newOutputKeys = new Set(customOutputParams.value.map(p => p.key));

    const deletedInputKeys = [...oldInputKeys].filter(key => !newInputKeys.has(key));
    const deletedOutputKeys = [...oldOutputKeys].filter(key => !newOutputKeys.has(key));

    // 如果有参数被删除,清理相关的参数绑定
    if (deletedInputKeys.length > 0 || deletedOutputKeys.length > 0) {
      paramBindings.value = paramBindings.value.filter(binding => {
        // 删除绑定到已删除输入参数的绑定关系
        if (deletedInputKeys.includes(binding.paramKey)) {
          return false;
        }
        // 删除来源是已删除输出参数的绑定关系
        if (
          binding.sourceType === 'node' &&
          binding.sourceKey === props.id &&
          deletedOutputKeys.includes(binding.sourceParam || '')
        ) {
          return false;
        }
        return true;
      });
    }
  },
  { immediate: true, deep: true }
);

// 监听并同步自定义参数到 Store
watch(
  [customInputParams, customOutputParams],
  ([newInputs, newOutputs]) => {
    // 只有当有实质变化时才更新，防止循环更新
    if (
      JSON.stringify(newInputs) !== JSON.stringify(props.data.customInputParams) ||
      JSON.stringify(newOutputs) !== JSON.stringify(props.data.customOutputParams)
    ) {
      const node = workflowStore.nodes.find(n => n.id === props.id);
      if (node) {
        // 直接传入需要更新的字段,避免展开 props.data 导致的覆盖问题
        workflowStore.updateNode(props.id, {
          customInputParams: newInputs,
          customOutputParams: newOutputs
        });
      }
    }
  },
  { deep: true }
);

// 初始化参数绑定
onMounted(() => {
  paramBindings.value = props.data.paramBindings || [];
});

// 监听全局折叠事件
watch(
  () => workflowStore.collapseAllNodes,
  newValue => {
    if (newValue !== null) {
      collapsed.value = newValue;
    }
  }
);

// 监听参数绑定变化,同步到 store
watch(
  paramBindings,
  newBindings => {
    const node = workflowStore.nodes.find(n => n.id === props.id);
    if (node) {
      // 只有当绑定真正变化时才更新
      if (JSON.stringify(newBindings) !== JSON.stringify(props.data.paramBindings)) {
        // 直接传入需要更新的字段,避免展开 props.data 导致的覆盖问题
        workflowStore.updateNode(props.id, {
          paramBindings: newBindings
        });
      }
    }
  },
  { deep: true }
);

// 监听外部参数绑定变化
watch(
  () => props.data.paramBindings,
  newBindings => {
    if (newBindings && JSON.stringify(newBindings) !== JSON.stringify(paramBindings.value)) {
      paramBindings.value = newBindings;
    }
  },
  { deep: true }
);

// Handle 显示状态（用于延时隐藏）
const showHandles = ref(false);
let handleHideTimer: number | null = null;

// 菜单选项
const menuOptions: DropdownOption[] = [
  {
    label: '重命名',
    key: 'rename',
    icon: () => h(SvgIcon, { icon: 'mdi:rename-box', class: 'text-18px' })
  },
  {
    label: '复制节点',
    key: 'duplicate',
    icon: () => h(SvgIcon, { icon: 'mdi:content-copy', class: 'text-18px' })
  },
  {
    label: '删除节点',
    key: 'delete',
    icon: () => h(SvgIcon, { icon: 'mdi:delete-outline', class: 'text-18px' })
  }
];

// 计算样式类
const statusClass = computed(() => {
  const classes = [];
  if (props.selected) classes.push('selected');
  return classes.join(' ');
});

// 计算边框样式
const outlineStyle = computed(() => ({
  outline: props.selected ? `1.5px solid ${props.data.nodeColor}` : '0.5px solid gray',
  outlineOffset: '-1px'
}));

function handleClick() {
  emit('nodeClick', props.id);
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

// 检查 Handle 是否连接
function isHandleConnected(handleId: string) {
  return workflowStore.edges.some(e => e.source === props.id && e.sourceHandle === handleId);
}

function handleSourceHandleClick(e: MouseEvent) {
  e.stopPropagation();
  emit('sourceHandleClick', e, props.id);
}

// 鼠标进入节点
function handleMouseEnter() {
  if (handleHideTimer) {
    clearTimeout(handleHideTimer);
    handleHideTimer = null;
  }
  showHandles.value = true;
}

// 鼠标离开节点
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
  newLabel.value = props.data.nodeLabel || '未命名节点';
  showRenameModal.value = true;
}

function confirmRename() {
  if (!newLabel.value.trim()) {
    showRenameModal.value = false;
    return;
  }

  const node = workflowStore.nodes.find(n => n.id === props.id);
  if (node) {
    workflowStore.updateNode(props.id, {
      ...props.data,
      nodeLabel: newLabel.value
    });
  }
  showRenameModal.value = false;
}
</script>

<template>
  <div
    class="workflow-node min-w-45 cursor-pointer rounded-2 bg-white shadow-sm dark:bg-dark-2 hover:shadow-lg"
    :class="[statusClass, { 'handles-visible': showHandles || selected }]"
    :style="outlineStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 输入连接点 (左侧) -->
    <Handle
      v-if="data.nodeType !== 'START' && data.nodeType !== 'APP_INFO'"
      :position="Position.Left"
      type="target"
      :connectable-start="false"
      :connectable-end="true"
      class="custom-handle custom-handle-target"
    />

    <!-- 节点头部 -->
    <div
      class="relative flex cursor-move items-center gap-2 overflow-hidden rounded-t-2 px-4 py-2 text-3.5 c-gray-8 font-600 dark:c-gray-1"
      :style="{
        background: headerGradient
      }"
    >
      <div
        class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-1"
        :style="{ backgroundColor: iconBackgroundColor, color: data.nodeColor }"
      >
        <SvgIcon v-if="data.nodeIcon" :icon="data.nodeIcon" />
        <SvgIcon v-else icon="mdi:file-document-outline" />
      </div>

      <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-4 font-bold">{{ data.nodeLabel }}</span>
      <NTooltip v-if="data.description" trigger="hover">
        <template #trigger>
          <span class="inline-flex items-center">
            <SvgIcon icon="mdi:information-outline" class="cursor-help text-4 c-gray-4" />
          </span>
        </template>
        {{ data.description }}
      </NTooltip>
      <!-- 操作菜单 -->
      <NDropdown
        v-if="!['START', 'APP_INFO', 'END'].includes(data.nodeType)"
        :options="menuOptions"
        trigger="hover"
        placement="bottom-end"
        @select="handleMenuSelect"
      >
        <span
          class="h-5 w-5 flex cursor-pointer items-center justify-center rounded bg-transparent transition-colors hover:bg-gray-2 dark:hover:bg-dark-3"
          @click.stop
        >
          <SvgIcon icon="mdi:dots-horizontal" class="text-4 c-gray-5" />
        </span>
      </NDropdown>
      <!-- 折叠按钮 -->
      <span
        v-if="$slots.default"
        class="h-5 w-5 flex cursor-pointer items-center justify-center rounded bg-transparent transition-colors hover:bg-gray-2 dark:hover:bg-dark-3"
        @click="toggleCollapse"
      >
        <SvgIcon :icon="collapsed ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="text-4 c-gray-5" />
      </span>
    </div>

    <!--头部以下的主体div-->
    <div class="pb-1 pl-4 pr-4">
      <!-- 节点内容插槽 -->
      <div
        v-if="!collapsed && $slots.default"
        class="nodrag mt-2 b-gray-2 b-solid pt-2 text-3 c-gray-5 dark:b-dark-3 dark:c-gray-4"
      >
        <!-- 业务配置插槽 -->
        <slot
          :show-handles="showHandles"
          :has-source-connection="hasSourceConnection"
          :is-handle-connected="isHandleConnected"
          :param-bindings="paramBindings"
          :input-params="inputParams"
          :output-params="outputParams"
        />

        <NCollapse class="pb-2 pt-3">
          <template #arrow>
            <SvgIcon icon="mdi:play" class="workflow-collapse-icon" />
          </template>
          <!-- 统一的参数绑定面板 -->
          <NCollapseItem
            v-if="inputParams.length > 0 || outputParams.length > 0 || allowCustomInput || allowCustomOutput"
            title="节点参数"
            name="params"
          >
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

      <!-- 状态指示器 -->
      <div
        v-if="data.status && data.status !== 'idle'"
        class="absolute h-6 w-6 flex items-center justify-center rounded-full bg-white shadow-md -right-2 -top-2 dark:bg-dark-2"
      >
        <div v-if="data.status === 'running'" class="i-mdi:loading animate-spin c-blue-5" />
        <div v-else-if="data.status === 'success'" class="i-mdi:check-circle c-green-5" />
        <div v-else-if="data.status === 'error'" class="i-mdi:alert-circle c-red-5" />
      </div>

      <!-- 输出连接点 (右侧) -->
      <Handle
        v-if="!['END', 'APP_INFO', 'INTENT_CLASSIFIER', 'CONDITION'].includes(data.nodeType)"
        :position="Position.Right"
        type="source"
        class="custom-handle custom-handle-source"
        :class="[{ 'show-plus': !hasSourceConnection }, { 'handles-visible': showHandles || selected }]"
        @click="handleSourceHandleClick"
      />
      <!-- 重命名弹窗 -->
      <NModal
        v-model:show="showRenameModal"
        preset="dialog"
        title="重命名节点"
        positive-text="确认"
        negative-text="取消"
        @positive-click="confirmRename"
        @negative-click="showRenameModal = false"
        @click.stop
      >
        <div class="py-4" @click.stop>
          <NInput v-model:value="newLabel" placeholder="请输入节点名称" autofocus @keyup.enter="confirmRename" />
        </div>
      </NModal>
    </div>
  </div>
</template>

<style scoped>
/* 禁用所有过渡动画，确保悬停效果是瞬间的 */
.workflow-node {
  transition: none !important;
}

.workflow-node * {
  transition: none !important;
}
</style>
