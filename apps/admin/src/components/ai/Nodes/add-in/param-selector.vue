<script setup lang="ts">
/**
 * 通用变量选择器组件
 * 使用扁平化 NSelect 风格，支持多种场景
 *
 * @author Mahone
 * @date 2026-01-23
 */
import { computed, h } from 'vue';
import { NPopover, NSelect } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { PARAM_GLOBAL_COLORS, PARAM_GLOBAL_NODE_COLORS } from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { filterParamSourcesByType, getAvailableParamsForNode } from '@/utils/ai/param-resolver';
import { getNodeIconBackground } from '@/utils/color';
import { type CompatibilityLevel, getTypeCompatibilityInfo } from '@/utils/ai/type-compatibility';

interface Props {
  /** 当前节点ID */
  nodeId: string;
  /** 参数定义（用于类型过滤，可选） */
  paramDef?: Workflow.ParamDefinition;
  /** 当前绑定配置（用于参数绑定场景） */
  binding?: Workflow.ParamBinding;
  /** 变量引用（用于条件构建器场景） */
  variableValue?: Workflow.VariableRef;
  /** 是否只显示类型匹配的参数 */
  filterByType?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  paramDef: undefined,
  binding: undefined,
  variableValue: undefined,
  filterByType: false, // 默认不进行类型过滤
  placeholder: '选择变量'
});

const emit = defineEmits<{
  'update:binding': [binding: Workflow.ParamBinding | undefined];
  'update:variableValue': [value: Workflow.VariableRef | undefined];
}>();

const workflowStore = useWorkflowStore();

// 获取可用参数来源
const availableSources = computed(() => {
  const sources = getAvailableParamsForNode(props.nodeId, workflowStore.nodes, workflowStore.edges);

  if (props.filterByType && props.paramDef?.type) {
    return filterParamSourcesByType(sources, props.paramDef.type);
  }

  return sources;
});

// 转换为分组选择器选项
const variableOptions = computed(() => {
  const options: any[] = [];

  availableSources.value.forEach(source => {
    if (!source.params?.length) return;

    // 确定图标和颜色
    let icon = 'mdi:earth';
    let color = PARAM_GLOBAL_COLORS;

    if (source.sourceKey === 'app') {
      icon = 'mdi:application';
      color = PARAM_GLOBAL_NODE_COLORS.app;
    } else if (source.sourceKey === 'interface') {
      icon = 'mdi:api';
      color = PARAM_GLOBAL_NODE_COLORS.interface;
    } else if (source.sourceKey === 'session') {
      icon = 'mdi:message-text';
      color = PARAM_GLOBAL_NODE_COLORS.session;
    } else if (source.type === 'node') {
      const node = workflowStore.nodes.find(n => n.id === source.sourceKey);
      if (node?.data?.nodeIcon) icon = node.data.nodeIcon;
      color = node?.data?.nodeColor || PARAM_GLOBAL_COLORS;
    }

    // 添加分组
    options.push({
      type: 'group',
      label: source.sourceName,
      key: `g-${source.sourceKey}`,
      icon,
      color,
      children: source.params.map(param => {
        // 检查类型兼容性
        const targetType = props.paramDef?.type;
        const compatInfo = targetType ? getTypeCompatibilityInfo(param.type, targetType) : null;

        return {
          label: `${param.label} - ${param.type}`,
          value: `${source.type}|${source.sourceKey}|${param.key}`,
          color,
          sourceType: param.type,
          compatLevel: compatInfo?.level || 'compatible',
          compatIcon: compatInfo?.icon || '',
          compatColor: compatInfo?.color || '',
          compatMessage: compatInfo?.message || '',
          disabled: compatInfo?.level === 'incompatible'
        };
      })
    });
  });

  return options;
});

// 当前选中值
const selectedValue = computed<string | null>(() => {
  // 优先使用 variableValue（条件构建器场景）
  if (props.variableValue) {
    return formatVariableRef(props.variableValue);
  }
  // 其次使用 binding（参数绑定场景）
  if (props.binding) {
    return formatBinding(props.binding);
  }
  return null;
});

// 格式化 VariableRef 为选择器值
function formatVariableRef(variable: Workflow.VariableRef): string | null {
  if (!variable.sourceKey && !variable.sourceParam) return null;
  return `${variable.sourceType}|${variable.sourceKey}|${variable.sourceParam}`;
}

// 格式化 ParamBinding 为选择器值
function formatBinding(binding: Workflow.ParamBinding): string | null {
  if (!binding.sourceKey && !binding.sourceParam) return null;
  return `${binding.sourceType}|${binding.sourceKey}|${binding.sourceParam || ''}`;
}

// 解析选择器值为 VariableRef
function parseVariableRef(value: string): Workflow.VariableRef | null {
  if (!value) return null;
  const parts = value.split('|');
  if (parts.length !== 3) return null;

  const [sourceType, sourceKey, sourceParam] = parts;

  return {
    sourceType: sourceType as 'global' | 'node',
    sourceKey,
    sourceParam
  };
}

// 解析选择器值为 ParamBinding
function parseBinding(value: string, paramKey: string): Workflow.ParamBinding | null {
  if (!value) return null;
  const parts = value.split('|');
  if (parts.length !== 3) return null;

  const [sourceType, sourceKey, sourceParam] = parts;

  return {
    paramKey,
    sourceType: sourceType as Workflow.ParamSourceType,
    sourceKey,
    sourceParam: sourceParam || undefined
  };
}

// 渲染选项标签（带图标、颜色和类型兼容性警告）
function renderLabel(option: {
  label?: string;
  icon?: string;
  color?: string;
  compatLevel?: CompatibilityLevel;
  compatIcon?: string;
  compatColor?: string;
  compatMessage?: string;
  disabled?: boolean;
}) {
  // 分组标签（有图标）
  if (option.icon) {
    return h('div', { class: 'flex items-center gap-2' }, [
      h(
        'div',
        {
          class: 'h-5 w-5 flex flex-shrink-0 items-center justify-center rounded-1',
          style: {
            backgroundColor: getNodeIconBackground(option.color || PARAM_GLOBAL_COLORS),
            color: option.color
          }
        },
        h(SvgIcon, { icon: option.icon, class: 'text-12px' })
      ),
      h('span', { class: 'text-12px' }, option.label)
    ]);
  }

  // 选项标签（带类型兼容性信息）
  const children: any[] = [
    h(
      'span',
      {
        class: 'text-12px',
        style: option.disabled ? { opacity: 0.5, textDecoration: 'line-through' } : {}
      },
      option.label
    )
  ];

  // 添加类型兼容性警告图标
  if (option.compatIcon && option.compatLevel !== 'compatible') {
    const iconEl = h(SvgIcon, {
      icon: option.compatIcon,
      class: 'ml-1 mt-1 text-14px',
      style: { color: option.compatColor }
    });

    // 用 NPopover 包裹显示提示
    if (option.compatMessage) {
      children.push(
        h(
          NPopover,
          { trigger: 'hover', placement: 'top' },
          {
            trigger: () => iconEl,
            default: () => h('span', { class: 'text-12px' }, option.compatMessage)
          }
        )
      );
    } else {
      children.push(iconEl);
    }
  }

  return h('div', { class: 'flex items-center' }, children);
}

// 处理值变化
function handleValueChange(value: string | null) {
  if (!value) {
    emit('update:binding', undefined);
    emit('update:variableValue', undefined);
    return;
  }

  // 如果有 variableValue prop 或没有 paramDef，使用 VariableRef 模式
  if (props.variableValue !== undefined || !props.paramDef) {
    const variable = parseVariableRef(value);
    emit('update:variableValue', variable || undefined);
  }

  // 如果有 paramDef，使用 ParamBinding 模式
  if (props.paramDef) {
    const binding = parseBinding(value, props.paramDef.key);
    emit('update:binding', binding || undefined);
  }
}
</script>

<template>
  <div class="param-selector-wrapper w-full">
    <NSelect
      :value="selectedValue"
      :options="variableOptions"
      :placeholder="placeholder"
      :render-label="renderLabel"
      :menu-props="{ class: 'param-selector-menu' }"
      clearable
      filterable
      size="small"
      @update:value="handleValueChange"
    >
      <template #empty>
        <div class="py-2 text-center text-xs c-gray-4">无可用参数来源</div>
      </template>
    </NSelect>
  </div>
</template>

<style scoped>
.param-selector-wrapper :deep(.n-base-selection) {
  font-size: 11px;
}

.param-selector-wrapper :deep(.n-base-selection-label) {
  font-size: 11px !important;
}

.param-selector-wrapper :deep(.n-base-selection-input) {
  font-size: 11px !important;
}
</style>

<style>
/* 禁用下拉菜单和选项的过渡动画，让交互更快速 */
.param-selector-menu.n-base-select-menu,
.param-selector-menu .n-base-select-option,
.param-selector-menu .n-base-select-option__content {
  transition: none !important;
  animation: none !important;
}

/* 兼容可能存在的内部 transition 包装 */
.param-selector-menu .n-base-select-menu-scrollbar-content {
  transition: none !important;
}
</style>
