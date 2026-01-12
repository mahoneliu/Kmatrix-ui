<script setup lang="ts">
import { computed, defineAsyncComponent, h, onMounted, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NDropdown } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { Handle, Position } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getNodeInputParams, getNodeOutputParams } from '@/utils/workflow/node-params';
import SvgIcon from '@/components/custom/svg-icon.vue';

const ParamBindingPanel = defineAsyncComponent(() => import('@/components/Flow/ParamBindingPanel.vue'));

interface Props extends NodeProps {
  id: string;
  data: Workflow.NodeData;
  selected: boolean;
  showParamBinding?: boolean; // 是否显示参数绑定面板,默认true
}

const props = withDefaults(defineProps<Props>(), {
  showParamBinding: true
});

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
  // 转换为简化格式
  return params.map(p => ({
    key: p.key,
    label: p.label,
    type: p.type
  }));
});

// 初始化参数绑定
onMounted(() => {
  paramBindings.value = props.data.paramBindings || [];
});

// 监听参数绑定变化,同步到 store
watch(
  paramBindings,
  newBindings => {
    const node = workflowStore.nodes.find(n => n.id === props.id);
    if (node) {
      workflowStore.updateNode(props.id, {
        ...props.data,
        paramBindings: newBindings
      });
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
</script>

<template>
  <div
    class="workflow-node min-w-45 cursor-pointer rounded-2 bg-white p-3 shadow-sm dark:bg-dark-2 hover:shadow-lg"
    :class="[statusClass, { 'handles-visible': showHandles || selected }]"
    :style="{
      outline: selected ? `2px solid ${data.nodeColor}` : `1px solid ${data.nodeColor}`,
      outlineOffset: '-1px'
    }"
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
    <div class="flex items-center gap-2 text-3.5 c-gray-8 font-600 dark:c-gray-1">
      <SvgIcon v-if="data.icon" :icon="data.icon" class="h-5 w-5" />
      <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ data.label }}</span>
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
        trigger="click"
        placement="bottom-end"
        @select="handleMenuSelect"
      >
        <button
          class="h-5 w-5 flex items-center justify-center rounded bg-white transition-colors dark:bg-dark-3 hover:bg-gray-1 dark:hover:bg-dark-4"
          @click.stop
        >
          <SvgIcon icon="mdi:dots-horizontal" class="text-4 c-gray-5" />
        </button>
      </NDropdown>
      <!-- 折叠按钮 -->
      <button
        v-if="$slots.default"
        class="h-5 w-5 flex items-center justify-center rounded bg-white transition-colors dark:bg-dark-3 hover:bg-gray-1 dark:hover:bg-dark-4"
        @click="toggleCollapse"
      >
        <SvgIcon :icon="collapsed ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="text-4 c-gray-5" />
      </button>
    </div>

    <!-- 节点内容插槽 -->
    <div
      v-if="!collapsed && $slots.default"
      class="nodrag mt-2 b-t b-gray-2 b-solid pt-2 text-3 c-gray-5 dark:b-dark-3 dark:c-gray-4"
    >
      <NCollapse>
        <!-- 业务配置插槽 -->
        <slot
          :show-handles="showHandles"
          :has-source-connection="hasSourceConnection"
          :is-handle-connected="isHandleConnected"
          :param-bindings="paramBindings"
          :input-params="inputParams"
          :output-params="outputParams"
        />

        <!-- 统一的参数绑定面板 -->
        <NCollapseItem
          v-if="showParamBinding && (inputParams.length > 0 || outputParams.length > 0)"
          title="参数绑定"
          name="params"
        >
          <ParamBindingPanel
            v-model:bindings="paramBindings"
            :node-id="id"
            :input-params="inputParams"
            :output-params="outputParams"
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
