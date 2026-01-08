<script setup lang="ts">
import { computed } from 'vue';
import { NCascader, NTag } from 'naive-ui';
import type { CascaderOption } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/workflow';
import {
  filterParamSourcesByType,
  getAvailableParamsForNode,
  getParamBindingDisplayText
} from '@/utils/workflow/param-resolver';

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

    // 创建第一级选项(参数来源)
    const sourceOption: CascaderOption = {
      label: source.sourceName,
      value: source.sourceKey,
      children: source.params.map(param => {
        // 第二级选项(具体参数)
        return {
          label: `${param.label} (${param.type})`,
          value: param.key
        };
      })
    };

    options.push(sourceOption);
  });

  return options;
});

// 当前选中值 (两级数组)
const selectedValue = computed(() => {
  if (!props.binding) return null;

  if (props.binding.sourceType === 'global') {
    return ['global', props.binding.sourceKey];
  }
  return [props.binding.sourceKey, props.binding.sourceParam || ''];
});

// 处理值变化
function handleValueChange(
  value: string | number | Array<string | number> | null,
  option: CascaderOption | null | Array<CascaderOption | null>
) {
  console.log('ParamSelector value changed:', value);
  console.log('ParamSelector option:', option);

  if (!value || !option) {
    emit('update:binding', undefined);
    return;
  }

  // option 可能是单个对象或数组,我们需要获取路径
  // 由于 Cascader 返回的是叶子节点,我们需要从 value 本身推断路径
  // 但实际上我们应该从选项结构中查找父节点

  // 简化方案:在 value 中编码完整路径
  // 由于当前 value 只是叶子节点的值,我们需要遍历 options 找到对应的父节点
  const paramKey = String(value);

  // 在所有来源中查找包含这个参数的来源
  let foundSource: Workflow.ParamSource | null = null;
  let foundParam: Workflow.ParamDefinition | null = null;

  for (const source of availableSources.value) {
    const param = source.params?.find(p => p.key === paramKey);
    if (param) {
      foundSource = source;
      foundParam = param;
      break;
    }
  }

  console.log('Found source:', foundSource);
  console.log('Found param:', foundParam);

  if (!foundSource || !foundParam) {
    emit('update:binding', undefined);
    return;
  }

  if (foundSource.type === 'global') {
    const binding = {
      paramKey: props.paramDef.key,
      sourceType: 'global' as const,
      sourceKey: paramKey
    };
    console.log('Emitting global binding:', binding);
    emit('update:binding', binding);
  } else {
    const binding = {
      paramKey: props.paramDef.key,
      sourceType: 'node' as const,
      sourceKey: foundSource.sourceKey,
      sourceParam: paramKey
    };
    console.log('Emitting node binding:', binding);
    emit('update:binding', binding);
  }
}

// 显示文本
const displayText = computed(() => {
  if (!props.binding) return '未绑定';
  return getParamBindingDisplayText(props.binding, workflowStore.nodes);
});
</script>

<template>
  <div class="param-selector">
    <NCascader
      :value="selectedValue"
      :options="cascaderOptions"
      :placeholder="`选择 ${paramDef.label} 的来源`"
      clearable
      filterable
      size="small"
      expand-trigger="hover"
      show-path
      @update:value="handleValueChange"
    >
      <template #empty>
        <div class="py-2 text-center text-xs c-gray-4">暂无可用参数来源</div>
      </template>
    </NCascader>

    <!-- 当前绑定显示 -->
    <div v-if="binding" class="mt-1 flex items-center gap-1">
      <NTag size="small" :bordered="false" type="info">
        {{ displayText }}
      </NTag>
    </div>
  </div>
</template>

<style scoped>
.param-selector {
  width: 100%;
}
</style>
