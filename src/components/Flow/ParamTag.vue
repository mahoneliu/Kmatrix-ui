<script setup lang="ts">
import { computed } from 'vue';
import { useMessage } from 'naive-ui';
import { PARAM_SOURCE_COLORS } from '@/constants/workflow';
import { getTagBackground } from '@/utils/color';

interface Props {
  param: Workflow.ParamDefinition;
  /** 参数来源类型,用于显示不同颜色 */
  sourceType?: 'global' | 'interface' | 'session' | 'node';
  nodeColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  nodeColor: undefined,
  sourceType: 'node'
});

const tagColor = props.nodeColor || PARAM_SOURCE_COLORS[props.sourceType];
const message = useMessage();

// 参数类型映射
const paramTypeMap: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔值',
  object: '对象',
  array: '数组'
};

// 复制参数引用
async function copyParamRef(e: Event) {
  e.stopPropagation();
  const ref = `{{${props.param.key}}}`;

  try {
    await navigator.clipboard.writeText(ref);
    message.success(`已复制: ${ref}`);
  } catch {
    message.error('复制失败,请手动复制');
  }
}

// Tooltip 文本
const tooltipText = computed(() => `点击复制 {${props.param.key}}`);
</script>

<template>
  <NPopover trigger="hover">
    <template #trigger>
      <div
        class="group inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-11px transition-all hover:shadow-sm"
        :style="{
          backgroundColor: getTagBackground(tagColor),
          borderLeft: '1px solid ' + tagColor
        }"
        @click="copyParamRef"
      >
        <!-- 参数键名 -->
        <span class="font-600 font-mono" :style="{ color: tagColor }">
          {{ param.key }}
        </span>

        <!-- 分隔符 -->
        <span class="c-gray-4">·</span>

        <!-- 数据类型 -->
        <span class="c-gray-5">{{ paramTypeMap[param.type] || param.type }}</span>

        <!-- 分隔符 -->
        <span class="c-gray-4">·</span>

        <!-- 参数名称 -->
        <span class="c-gray-6">{{ param.label }}</span>

        <!-- 复制图标 -->
        <!-- <SvgIcon icon="mdi-content-copy" class="c-gray-5 hover:c-primary transition-colors ml-1" /> -->
      </div>
    </template>
    {{ tooltipText }}
  </NPopover>
</template>

<style scoped>
/* 添加点击反馈 */
div:active {
  transform: scale(0.98);
}
</style>
