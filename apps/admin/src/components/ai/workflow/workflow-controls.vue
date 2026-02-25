<script setup lang="ts">
import { ControlButton, Controls } from '@vue-flow/controls';
import { SvgIcon } from '@sa/materials';
import { useWorkflowHistory } from '@/composables/ai/workflow/use-workflow-history';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onAutoLayout: () => void;
  onCollapseAndLayout: () => void;
}

defineProps<Props>();

// 初始化历史管理
const { undo, redo, canUndo, canRedo, historyStack, currentIndex, jumpToHistory } = useWorkflowHistory();

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

// 跳转到历史记录
const handleJumpToHistory = (index: number) => {
  jumpToHistory(index);
};
</script>

<template>
  <Controls
    :show-zoom="false"
    :show-fit-view="false"
    :show-interactive="true"
    class="shadow-sm !rounded-5px !border-none !bg-[#fbfbfb] dark:!bg-dark-2"
  >
    <ControlButton
      title="放大"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onZoomIn"
    >
      <SvgIcon local-icon="mdi-magnify-plus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="缩小"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onZoomOut"
    >
      <SvgIcon local-icon="mdi-magnify-minus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="适应视图"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onFitView"
    >
      <SvgIcon local-icon="mdi-fit-to-screen-outline" class="toolbar-icon" />
    </ControlButton>
    <div
      class="b-whitesmoke my-1px h-1px w-full b-1 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />
    <ControlButton
      title="折叠所有节点"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onCollapseAll"
    >
      <SvgIcon local-icon="mdi-unfold-less-horizontal" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="展开所有节点"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onExpandAll"
    >
      <SvgIcon local-icon="mdi-unfold-more-horizontal" class="toolbar-icon" />
    </ControlButton>
    <div
      class="b-whitesmoke my-1px h-1px w-full b-1 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />
    <ControlButton
      title="优雅布局"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onAutoLayout"
    >
      <SvgIcon local-icon="mdi-auto-fix" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="折叠并优雅布局"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="onCollapseAndLayout"
    >
      <SvgIcon local-icon="mdi-format-align-justify" class="toolbar-icon" />
    </ControlButton>

    <!-- 分隔线 -->
    <div
      class="b-whitesmoke my-1px h-1px w-full b-1 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />
    <!-- 撤销/重做 -->
    <ControlButton
      title="撤销 (Ctrl+Z)"
      :disabled="!canUndo"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="handleUndo"
    >
      <SvgIcon local-icon="mdi-undo-variant" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="重做 (Ctrl+Y)"
      :disabled="!canRedo"
      class="!b-0 !bg-transparent hover:!bg-[#f3f4f6] dark:!text-white dark:hover:!bg-white/10"
      @click="handleRedo"
    >
      <SvgIcon local-icon="mdi-redo-variant" class="toolbar-icon" />
    </ControlButton>
    <!-- 分隔线 -->
    <!-- <div class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)]" /> -->

    <!-- 操作历史 -->
    <NPopover trigger="hover" placement="right-end" :show-arrow="false" class="!rounded-8px !p-0">
      <template #trigger>
        <ControlButton
          title="操作历史"
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
          <span class="text-sm font-bold">操作历史</span>
          <span class="text-xs text-gray-400">共 {{ historyStack.length }} 条</span>
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
                  ? '当前状态'
                  : historyStack.length - 1 - index < currentIndex
                    ? '已执行'
                    : '可重做'
              }}
            </div>
          </div>
        </div>
      </div>
    </NPopover>
  </Controls>
</template>
