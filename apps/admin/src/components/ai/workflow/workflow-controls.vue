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
  <Controls :show-zoom="false" :show-fit-view="false" :show-interactive="false" class="!rounded-5px !bg-[#fbfbfb]">
    <ControlButton title="放大" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onZoomIn">
      <SvgIcon icon="mdi:magnify-plus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton title="缩小" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onZoomOut">
      <SvgIcon icon="mdi:magnify-minus-outline" class="toolbar-icon" />
    </ControlButton>
    <ControlButton title="适应视图" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onFitView">
      <SvgIcon icon="mdi:fit-to-screen-outline" class="toolbar-icon" />
    </ControlButton>
    <div class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)]" />
    <ControlButton title="折叠所有节点" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onCollapseAll">
      <SvgIcon icon="mdi:unfold-less-horizontal" class="toolbar-icon" />
    </ControlButton>
    <ControlButton title="展开所有节点" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onExpandAll">
      <SvgIcon icon="mdi:unfold-more-horizontal" class="toolbar-icon" />
    </ControlButton>
    <div class="b-whitesmoke my-1px h-1px w-full b-2 b-solid bg-[var(--vf-controls-button-border-color)]" />
    <ControlButton title="优雅布局" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onAutoLayout">
      <SvgIcon icon="mdi:auto-fix" class="toolbar-icon" />
    </ControlButton>
    <ControlButton title="折叠并优雅布局" class="!b-0 !bg-transparent hover:!bg-[#cdd7ea]" @click="onCollapseAndLayout">
      <SvgIcon icon="mdi:format-align-justify" class="toolbar-icon" />
    </ControlButton>
  </Controls>
</template>
