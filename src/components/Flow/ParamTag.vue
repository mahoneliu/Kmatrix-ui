<script setup lang="ts">
import { computed } from 'vue';
import { useMessage } from 'naive-ui';
import { PARAM_GLOBAL_COLORS, PARAM_GLOBAL_NODE_COLORS, PARAM_TYPE_MAP } from '@/constants/workflow';
import { getTagBackground } from '@/utils/color';

interface Props {
  param: Workflow.ParamDefinition;
  /** 参数来源类型,用于显示不同颜色 */
  sourceType?: 'app' | 'interface' | 'session' | 'node' | 'global';
  /** 参数来源路径中的具体键(如 app/interface/session),用于全局参数显色 */
  sourceKey?: string;
  nodeData?: Workflow.NodeData;
  /** 强制指定颜色 */
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sourceType: 'node',
  sourceKey: undefined,
  nodeData: undefined,
  color: undefined
});

const tagColor = computed(() => {
  if (props.color) return props.color;

  // 确定查找颜色的键 (app/interface/session 等)
  const key = props.sourceKey || props.sourceType;
  if (key && PARAM_GLOBAL_NODE_COLORS[key]) {
    return PARAM_GLOBAL_NODE_COLORS[key];
  }

  if (props.sourceType === 'global') {
    return PARAM_GLOBAL_COLORS;
  }

  // 如果是节点参数,优先使用节点颜色,否则使用默认紫色
  return props.nodeData?.nodeColor || PARAM_GLOBAL_COLORS;
});
const message = useMessage();

const getParamTypeName = (type: string | undefined) => {
  if (!type) return '未知';
  return PARAM_TYPE_MAP[type] || type;
};

// 复制参数引用
async function copyParamRef(e: Event) {
  e.stopPropagation();
  const ref = `{${props.param.key}}`;

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
  <div class="w-full flex items-center justify-between text-11px">
    <NPopover trigger="hover">
      <template #trigger>
        <div
          class="clickToCopy group inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-all hover:shadow-sm"
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
        </div>
      </template>
      {{ tooltipText }}
    </NPopover>

    <div class="flex items-center gap-1">
      <!-- 分隔符 -->
      <!-- <span class="c-gray-4">·</span> -->

      <!-- 数据类型 -->
      <span class="c-gray-5">{{ getParamTypeName(param.type) }}</span>

      <!-- 分隔符 -->
      <span class="c-gray-4">·</span>

      <!-- 参数名称 -->
      <span class="c-gray-6">{{ param.label }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 添加点击反馈 */
.clickToCopy:active {
  transform: scale(0.9);
}
</style>
