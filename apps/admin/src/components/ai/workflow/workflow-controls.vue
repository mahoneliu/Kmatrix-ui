<script setup lang="ts">
import { NPopover } from 'naive-ui';
import { ControlButton, Controls } from '@vue-flow/controls';
import { SvgIcon } from '@sa/materials';
import { useWorkflowHistory } from '@/composables/ai/workflow/use-workflow-history';
import { $t } from '@/locales';
import ComponentLibraryPanel from './component-library-panel.vue';

interface Props {
  onFitView: () => void;
  onAutoLayout: () => void;
  /** 当前是否为抽屉模式 */
  drawerMode?: boolean;
  /** 切换抽屉/内嵌模式的回调 */
  onToggleDrawerMode?: () => void;
  /** 选择节点回调（组件库） */
  onSelectNode?: (nodeType: Workflow.NodeType, extraData?: Partial<Workflow.NodeData>) => void;
  /** 拖拽节点回调（组件库） */
  onDragStart?: (data: {
    type: Workflow.NodeType;
    x: number;
    y: number;
    extraData?: Partial<Workflow.NodeData>;
  }) => void;
  /** 是否处于页面全屏状态 */
  isPageFullscreen?: boolean;
  /** 切换页面全屏 */
  onTogglePageFullscreen?: () => void;
  /** 画布是否可交互（未锁定） */
  isInteractive?: boolean;
  /** 切换画布锁定状态 */
  onToggleInteractive?: () => void;
}

const props = defineProps<Props>();

// 初始化历史管理
const { undo, redo, canUndo, canRedo, historyStack, currentIndex, jumpToHistory } = useWorkflowHistory();

function toggleInteractive() {
  props.onToggleInteractive?.();
}

// 撤销
const handleUndo = () => {
  if (canUndo.value) undo();
};

// 重做
const handleRedo = () => {
  if (canRedo.value) redo();
};

// 跳转到历史记录
const handleJumpToHistory = (index: number) => {
  jumpToHistory(index);
};

// 组件库弹出层（hover 触发，无需手动控制 show 状态）

function handleLibrarySelect(nodeType: Workflow.NodeType, extraData?: Partial<Workflow.NodeData>) {
  props.onSelectNode?.(nodeType, extraData);
}

function handleLibraryDragStart(data: {
  type: Workflow.NodeType;
  x: number;
  y: number;
  extraData?: Partial<Workflow.NodeData>;
}) {
  props.onDragStart?.(data);
}
</script>

<template>
  <Controls
    :show-zoom="false"
    :show-fit-view="false"
    :show-interactive="false"
    class="shadow-sm !rounded-5px !border-none !bg-[#fbfbfb] dark:!bg-dark-2"
  >
    <!-- ── 第一组：组件库 + 抽屉切换 ── -->
    <NPopover
      trigger="hover"
      placement="right-start"
      :show-arrow="false"
      raw
      :content-style="{ padding: 0 }"
      :z-index="10000"
    >
      <template #trigger>
        <ControlButton title="组件库" class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:hover:!bg-white/10">
          <span class="library-add-btn">
            <SvgIcon local-icon="carbon-add" class="toolbar-icon" />
          </span>
        </ControlButton>
      </template>
      <ComponentLibraryPanel @select="handleLibrarySelect" @drag-start="handleLibraryDragStart" />
    </NPopover>

    <ControlButton
      :title="drawerMode ? '抽屉模式（点击切换为内嵌）' : '内嵌模式（点击切换为抽屉）'"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      :class="{ '!text-primary': drawerMode }"
      @click="onToggleDrawerMode"
    >
      <SvgIcon
        :local-icon="drawerMode ? 'mdi-dock-right' : 'mdi-view-agenda-outline'"
        class="toolbar-icon"
        :class="{ 'text-primary': drawerMode }"
      />
    </ControlButton>

    <!-- 分隔线 -->
    <div
      class="b-whitesmoke my-1px h-1px w-full b-1 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />

    <!-- ── 第二组：全屏 + 适应视图 + 优雅布局 + 锁定 ── -->
    <ControlButton
      :title="isPageFullscreen ? '退出全屏' : '全屏'"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      :class="{ '!text-primary': isPageFullscreen }"
      @click="onTogglePageFullscreen"
    >
      <SvgIcon
        :local-icon="isPageFullscreen ? 'mdi-window-restore' : 'mdi-fullscreen'"
        class="toolbar-icon"
        :class="{ 'text-primary': isPageFullscreen }"
      />
    </ControlButton>

    <ControlButton
      :title="$t('ai.workflow.fit_view')"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onFitView"
    >
      <SvgIcon local-icon="mdi-fit-to-screen-outline" class="toolbar-icon" />
    </ControlButton>

    <ControlButton
      :title="$t('ai.workflow.elegant_layout')"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onAutoLayout"
    >
      <SvgIcon local-icon="mdi-auto-fix" class="toolbar-icon" />
    </ControlButton>

    <ControlButton
      :title="isInteractive ? '锁定画布（禁止拖拽节点）' : '解锁画布'"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      :class="{ '!text-primary': !isInteractive }"
      @click="toggleInteractive"
    >
      <SvgIcon
        :local-icon="isInteractive ? 'mdi-pin-off-outline' : 'mdi-pin-outline'"
        class="toolbar-icon"
        :class="{ 'text-primary': !isInteractive }"
      />
    </ControlButton>

    <!-- 分隔线 -->
    <div
      class="b-whitesmoke my-1px h-1px w-full b-1 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />

    <!-- ── 第三组：撤销 + 重做 + 操作历史 ── -->
    <ControlButton
      :title="$t('ai.workflow.undo')"
      :disabled="!canUndo"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="handleUndo"
    >
      <SvgIcon local-icon="mdi-undo-variant" class="toolbar-icon" />
    </ControlButton>

    <ControlButton
      :title="$t('ai.workflow.redo')"
      :disabled="!canRedo"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="handleRedo"
    >
      <SvgIcon local-icon="mdi-redo-variant" class="toolbar-icon" />
    </ControlButton>

    <NPopover trigger="hover" placement="right-end" :show-arrow="false" class="!rounded-8px !p-0" :z-index="10000">
      <template #trigger>
        <ControlButton
          :title="$t('ai.workflow.operation_history')"
          class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
        >
          <SvgIcon local-icon="mdi-history" class="toolbar-icon" />
        </ControlButton>
      </template>
      <div
        class="max-h-600px max-w-600px min-w-250px flex flex-col overflow-hidden rounded-8px bg-white shadow-xl dark:bg-dark-1"
      >
        <div
          class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-dark-2"
        >
          <span class="text-sm font-bold">{{ $t('ai.workflow.operation_history') }}</span>
          <span class="text-xs text-gray-400">{{ $t('ai.workflow.total_items', { count: historyStack.length }) }}</span>
        </div>
        <div class="flex-1 overflow-y-auto py-1">
          <div
            v-for="(item, index) in [...historyStack].reverse()"
            :key="item.timestamp"
            class="group flex flex-col cursor-pointer border-l-3 px-4 py-2 transition-all"
            :class="[
              historyStack.length - 1 - index === currentIndex
                ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
            ]"
            @click="handleJumpToHistory(historyStack.length - 1 - index)"
          >
            <div class="mb-0.5 flex items-start justify-between">
              <span
                class="text-xs font-medium"
                :class="
                  historyStack.length - 1 - index === currentIndex
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                "
              >
                {{ item.label }}
              </span>
              <span class="ml-10px flex-shrink-0 whitespace-nowrap text-[10px] text-gray-400">
                {{ new Date(item.timestamp).toLocaleTimeString() }}
              </span>
            </div>
            <div class="line-clamp-1 text-[10px] text-gray-400">
              {{
                historyStack.length - 1 - index === currentIndex
                  ? $t('ai.workflow.current_status')
                  : historyStack.length - 1 - index < currentIndex
                    ? $t('ai.workflow.executed')
                    : $t('ai.workflow.can_redo')
              }}
            </div>
          </div>
        </div>
      </div>
    </NPopover>
  </Controls>
</template>

<style scoped>
/* 覆盖 @vue-flow/controls 对 svg 的 max-width/max-height 限制 */
:deep(.vue-flow__controls-button svg) {
  max-width: none !important;
  max-height: none !important;
}

/* 组件库按钮：圆形彩色背景的 + 图标 */
.library-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #f97316;
  color: #fff;
  flex-shrink: 0;
}
</style>
