<script setup lang="ts">
import { computed, h } from 'vue';
import { NCascader, NTooltip } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import { PARAM_SOURCE_COLORS } from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/workflow';
import { filterParamSourcesByType, getAvailableParamsForNode } from '@/utils/workflow/param-resolver';
import { getNodeIconBackground } from '@/utils/color';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props {
  /** 当前节点ID */
  nodeId: string;
  /** 参数定义 */
  paramDef: Workflow.ParamDefinition;
  /** 当前绑定配置 */
  binding?: Workflow.ParamBinding;
  /** 是否只显示类型匹配的参数 */
  filterByType?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  binding: undefined,
  filterByType: true
});

const emit = defineEmits<{
  'update:binding': [binding: Workflow.ParamBinding | undefined];
}>();

const workflowStore = useWorkflowStore();

// 获取可用参数来源
const availableSources = computed(() => {
  const sources = getAvailableParamsForNode(props.nodeId, workflowStore.nodes, workflowStore.edges);

  if (props.filterByType) {
    return filterParamSourcesByType(sources, props.paramDef.type);
  }

  return sources;
});

// 转换为 Cascader 选项 (两级联动)
const cascaderOptions = computed<CascaderOption[]>(() => {
  const options: CascaderOption[] = [];

  availableSources.value.forEach(source => {
    // 确保 params 存在
    if (!source.params || !Array.isArray(source.params) || source.params.length === 0) {
      return;
    }

    // 确定图标和颜色
    let icon = 'mdi:cube-outline'; // 默认节点图标
    let color: string;

    if (source.type === 'global') {
      icon = 'mdi:earth';
      color = PARAM_SOURCE_COLORS.global;
    } else if (source.type === 'interface') {
      icon = 'mdi:api';
      color = PARAM_SOURCE_COLORS.interface;
    } else if (source.type === 'session') {
      icon = 'mdi:message-text';
      color = PARAM_SOURCE_COLORS.session;
    } else if (source.type === 'node') {
      // 从节点数据中获取图标和颜色
      const node = workflowStore.nodes.find(n => n.id === source.sourceKey);
      if (node?.data?.nodeIcon) {
        icon = node.data.nodeIcon;
      }
      // 节点类型:优先使用节点自定义颜色,否则使用默认紫色
      color = node?.data?.nodeColor || PARAM_SOURCE_COLORS.node;
    } else {
      // 其他未知类型使用默认紫色
      color = PARAM_SOURCE_COLORS.node;
    }

    // 创建第一级选项(参数来源)
    const sourceOption: CascaderOption = {
      label: source.sourceName,
      value: source.sourceKey,
      icon, // 存储图标信息
      color, // 存储颜色信息
      children: source.params.map(param => {
        // 第二级选项(具体参数)
        // 使用复合键确保唯一性: sourceKey|paramKey
        return {
          paramName: param.label,
          paramType: param.type,
          label: `${param.key} (${param.type})`,
          value: `${source.sourceKey}|${param.key}`
        };
      })
    };

    options.push(sourceOption);
  });

  return options;
});

// 当前选中值 (复合键字符串)
const selectedValue = computed(() => {
  if (!props.binding) return null;

  if (props.binding.sourceType === 'global') {
    // Global 类型的 sourceKey 存储的是参数名
    return `global|${props.binding.sourceKey}`;
  }

  // Node 类型
  return `${props.binding.sourceKey}|${props.binding.sourceParam || ''}`;
});

// 自定义标签渲染函数
function renderLabel(option: CascaderOption) {
  // 只为第一级选项(有 icon 和 color 属性的)渲染带颜色的图标
  if (option.icon && option.color) {
    const color = option.color as string;
    return h('div', { class: 'flex items-center gap-3' }, [
      // 图标容器,样式与 BaseNode 头部图标一致
      h(
        'div',
        {
          class: 'h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-1',
          style: {
            backgroundColor: getNodeIconBackground(color), // 20% 透明度背景
            color // 图标颜色
          }
        },
        h(SvgIcon, { icon: option.icon as string })
      ),
      // 标签文字,不带颜色
      h('div', { class: 'flex-1 text-12px' }, option.label)
    ]);
  }

  // 第二级选项:如果有 paramName,显示 tooltip
  if (option.paramName) {
    return h(
      NTooltip,
      { trigger: 'hover' },
      {
        trigger: () => h('div', { class: 'flex-1 text-12px' }, option.label),
        default: () => option.paramName
      }
    );
  }

  // 其他情况直接返回文本
  return h('div', { class: 'flex-1 text-12px' }, option.label);
}

// 处理值变化
function handleValueChange(value: string | number | Array<string | number> | null) {
  if (!value) {
    emit('update:binding', undefined);
    return;
  }

  // value 应该是复合键字符串 "sourceKey|paramKey"
  const valStr = String(value);
  const separatorIndex = valStr.indexOf('|');

  if (separatorIndex === -1) {
    emit('update:binding', undefined);
    return;
  }

  const sourceKey = valStr.substring(0, separatorIndex);
  const paramKey = valStr.substring(separatorIndex + 1);

  // 在所有来源中查找对应的来源
  const foundSource = availableSources.value.find(s => s.sourceKey === sourceKey);

  if (!foundSource) {
    emit('update:binding', undefined);
    return;
  }

  if (foundSource.type === 'global') {
    const binding: Workflow.ParamBinding = {
      paramKey: props.paramDef.key,
      sourceType: 'global',
      sourceKey: paramKey // Global binding stores paramKey in sourceKey field
    };
    emit('update:binding', binding);
  } else {
    const binding: Workflow.ParamBinding = {
      paramKey: props.paramDef.key,
      sourceType: 'node',
      sourceKey,
      sourceParam: paramKey
    };
    emit('update:binding', binding);
  }
}
</script>

<template>
  <div class="param-selector-wrapper w-full">
    <NCascader
      :value="selectedValue"
      :options="cascaderOptions"
      :placeholder="`选择 ${paramDef.key} 来源`"
      :virtual-scroll="false"
      :render-label="renderLabel"
      clearable
      filterable
      size="small"
      expand-trigger="hover"
      check-strategy="child"
      :show-path="true"
      @update:value="handleValueChange"
    >
      <template #empty>
        <div class="py-2 text-center text-xs c-gray-4">无可用参数来源</div>
      </template>
    </NCascader>
  </div>
</template>

<style scoped>
.param-selector-wrapper :deep(.n-cascader) {
  font-size: 12px;
}

.param-selector-wrapper :deep(.n-base-selection-label) {
  font-size: 12px !important;
}

.param-selector-wrapper :deep(.n-base-selection-input) {
  font-size: 12px !important;
}

/* 下拉菜单选项字体大小 */
.param-selector-wrapper :deep(.n-cascader-menu) {
  font-size: 11px !important;
}

.param-selector-wrapper :deep(.n-cascader-option) {
  font-size: 11px !important;
}

.param-selector-wrapper :deep(.n-cascader-option__label) {
  font-size: 11px !important;
}
</style>
