<script setup lang="ts">
import { ControlButton, Controls } from '@vue-flow/controls';
import { SvgIcon } from '@sa/materials';

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
</script>

<template>
  <Controls
    :show-zoom="false"
    :show-fit-view="false"
    :show-interactive="false"
    class="shadow-sm !rounded-5px !border-none !bg-[#fbfbfb] dark:!bg-dark-2"
  >
    <ControlButton
      title="放大"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onZoomIn"
    >
      <SvgIcon local-icon="mdi-magnify-plus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="缩小"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onZoomOut"
    >
      <SvgIcon local-icon="mdi-magnify-minus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="适应视图"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onFitView"
    >
      <SvgIcon local-icon="mdi-fit-to-screen-outline" class="toolbar-icon" />
    </ControlButton>
    <div
      class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />
    <ControlButton
      title="折叠所有节点"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onCollapseAll"
    >
      <SvgIcon local-icon="mdi-unfold-less-horizontal" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="展开所有节点"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onExpandAll"
    >
      <SvgIcon local-icon="mdi-unfold-more-horizontal" class="toolbar-icon" />
    </ControlButton>
    <div
      class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)] dark:!bg-white/10"
    />
    <ControlButton
      title="优雅布局"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onAutoLayout"
    >
      <SvgIcon local-icon="mdi-auto-fix" class="toolbar-icon" />
    </ControlButton>
    <ControlButton
      title="折叠并优雅布局"
      class="!b-0 !bg-transparent hover:!bg-[#cdd7ea] dark:!text-white dark:hover:!bg-white/10"
      @click="onCollapseAndLayout"
    >
      <SvgIcon local-icon="mdi-format-align-justify" class="toolbar-icon" />
    </ControlButton>
  </Controls>
</template>
