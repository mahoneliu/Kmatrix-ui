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
  if (!value || !option) {
    emit('update:binding', undefined);
    return;
  }

  let sourceKey: string;
  let paramKey: string;

  // Cascader 可能返回数组或字符串
  if (Array.isArray(value)) {
    // 数组格式: [sourceKey, paramKey]
    if (value.length < 2) {
      emit('update:binding', undefined);
      return;
    }
    sourceKey = String(value[0]);
    paramKey = String(value[1]);
  } else {
    // 字符串格式: 直接是 paramKey,需要从可用参数源中查找对应的 sourceKey
    paramKey = String(value);

    // 在所有来源中查找包含这个参数的来源
    const tempSource = availableSources.value.find(source => source.params?.some(p => p.key === paramKey));

    if (!tempSource) {
      console.warn('Source not found for param:', paramKey);
      emit('update:binding', undefined);
      return;
    }

    sourceKey = tempSource.sourceKey;
  }

  // 在所有来源中查找对应的来源和参数
  const foundSource = availableSources.value.find(s => s.sourceKey === sourceKey);

  if (!foundSource) {
    console.warn('Source not found:', sourceKey);
    emit('update:binding', undefined);
    return;
  }

  const foundParam = foundSource.params?.find(p => p.key === paramKey);

  if (!foundParam) {
    console.warn('Param not found:', paramKey);
    emit('update:binding', undefined);
    return;
  }

  if (!foundSource || !foundParam) {
    emit('update:binding', undefined);
    return;
  }

  if (foundSource.type === 'global') {
    const binding: Workflow.ParamBinding = {
      paramKey: props.paramDef.key,
      sourceType: 'global',
      sourceKey: paramKey
    };
    emit('update:binding', binding);
  } else {
    const binding: Workflow.ParamBinding = {
      paramKey: props.paramDef.key,
      sourceType: 'node',
      sourceKey: foundSource.sourceKey,
      sourceParam: paramKey
    };
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
