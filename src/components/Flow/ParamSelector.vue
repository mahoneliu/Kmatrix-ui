<script setup lang="ts">
import { computed } from 'vue';
import { NSelect, NTag } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
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

// 转换为 Select 选项
const selectOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [];

  availableSources.value.forEach(source => {
    // 确保 params 存在
    if (!source.params || !Array.isArray(source.params) || source.params.length === 0) {
      return;
    }

    // 创建分组选项,使用 children 属性
    const groupOption: SelectOption = {
      type: 'group',
      label: source.sourceName,
      key: `group-${source.sourceKey}`,
      children: source.params.map(param => {
        const value = source.type === 'global' ? `global::${param.key}` : `node::${source.sourceKey}::${param.key}`;

        return {
          label: `${param.label} (${param.type})`,
          value,
          disabled: false
        };
      })
    };

    options.push(groupOption);
  });

  return options;
});

// 当前选中值
const selectedValue = computed({
  get() {
    if (!props.binding) return null;

    if (props.binding.sourceType === 'global') {
      return `global::${props.binding.sourceKey}`;
    }
    return `node::${props.binding.sourceKey}::${props.binding.sourceParam}`;
  },
  set(value: string | null) {
    if (!value) {
      emit('update:binding', undefined);
      return;
    }

    const parts = value.split('::');
    if (parts[0] === 'global') {
      emit('update:binding', {
        paramKey: props.paramDef.key,
        sourceType: 'global',
        sourceKey: parts[1]
      });
    } else if (parts[0] === 'node') {
      emit('update:binding', {
        paramKey: props.paramDef.key,
        sourceType: 'node',
        sourceKey: parts[1],
        sourceParam: parts[2]
      });
    }
  }
});

// 显示文本
const displayText = computed(() => {
  if (!props.binding) return '未绑定';
  return getParamBindingDisplayText(props.binding, workflowStore.nodes);
});
</script>

<template>
  <div class="param-selector">
    <NSelect
      v-model:value="selectedValue"
      :options="selectOptions"
      :placeholder="`选择 ${paramDef.label} 的来源`"
      clearable
      filterable
      size="small"
    >
      <template #empty>
        <div class="py-2 text-center text-xs c-gray-4">暂无可用参数来源</div>
      </template>
    </NSelect>

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
