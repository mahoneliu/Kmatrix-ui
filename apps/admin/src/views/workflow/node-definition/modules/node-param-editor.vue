<script setup lang="ts">
import { computed } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'NodeParamEditor'
});

interface Props {
  /** 参数列表 */
  modelValue?: Api.AI.Workflow.NodeParamDefinition[];
  /** 参数类型标题 (输入参数/输出参数) */
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  title: $t('ai.node_definition.parameters')
});

interface Emits {
  (e: 'update:modelValue', value: Api.AI.Workflow.NodeParamDefinition[]): void;
}

const emit = defineEmits<Emits>();

const params = computed({
  get: () => props.modelValue || [],
  set: val => emit('update:modelValue', val)
});

// 参数类型选项
const paramTypeOptions = [
  { label: $t('ai.node_definition.type_string'), value: 'string' },
  { label: $t('ai.node_definition.type_number'), value: 'number' },
  { label: $t('ai.node_definition.type_boolean'), value: 'boolean' },
  { label: $t('ai.node_definition.type_object'), value: 'object' },
  { label: $t('ai.node_definition.type_array'), value: 'array' }
];

// 添加新参数
function addParam() {
  const newParam: Api.AI.Workflow.NodeParamDefinition = {
    key: '',
    label: '',
    type: 'string',
    required: false,
    defaultValue: '',
    description: ''
  };
  params.value = [...params.value, newParam];
}

// 删除参数
function removeParam(index: number) {
  params.value = params.value.filter((_, i) => i !== index);
}

// 上移参数
function moveUp(index: number) {
  if (index === 0) return;
  const newParams = [...params.value];
  [newParams[index - 1], newParams[index]] = [newParams[index], newParams[index - 1]];
  params.value = newParams;
}

// 下移参数
function moveDown(index: number) {
  if (index === params.value.length - 1) return;
  const newParams = [...params.value];
  [newParams[index], newParams[index + 1]] = [newParams[index + 1], newParams[index]];
  params.value = newParams;
}
</script>

<template>
  <div class="node-param-editor">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-sm font-medium">{{ title }}</span>
      <NButton size="small" @click="addParam">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('ai.node_definition.add_parameter') }}
      </NButton>
    </div>

    <div v-if="params.length === 0" class="py-4 text-center text-gray-400">
      {{ $t('ai.node_definition.no_parameter_click_add') }}
    </div>

    <NCollapse v-else :default-expanded-names="[0]" class="space-y-2">
      <NCollapseItem v-for="(param, index) in params" :key="index" :name="index">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">
              {{ $t('ai.node_definition.parameter_index', { index: index + 1 }) }}
            </span>
            <span v-if="param.key" class="text-xs text-gray-500">{{ param.key }}</span>
            <NTag v-if="param.required" size="small" type="error" :bordered="false">
              {{ $t('ai.node_definition.required') }}
            </NTag>
          </div>
        </template>
        <template #header-extra>
          <NSpace :size="4" @click.stop>
            <NButton size="tiny" quaternary :disabled="index === 0" @click="moveUp(index)">
              <template #icon>
                <icon-ic-round-keyboard-arrow-up class="text-icon" />
              </template>
            </NButton>
            <NButton size="tiny" quaternary :disabled="index === params.length - 1" @click="moveDown(index)">
              <template #icon>
                <icon-ic-round-keyboard-arrow-down class="text-icon" />
              </template>
            </NButton>
            <NButton size="tiny" quaternary type="error" @click="removeParam(index)">
              <template #icon>
                <icon-ic-round-delete class="text-icon" />
              </template>
            </NButton>
          </NSpace>
        </template>

        <NSpace vertical :size="12" class="pt-2">
          <NGrid :cols="2" :x-gap="12">
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">{{ $t('ai.node_definition.param_key_name') }}</div>
              <NInput
                v-model:value="param.key"
                size="small"
                :placeholder="$t('ai.node_definition.param_key_placeholder')"
              />
            </NGridItem>
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">{{ $t('ai.node_definition.param_label') }}</div>
              <NInput
                v-model:value="param.label"
                size="small"
                :placeholder="$t('ai.node_definition.param_label_placeholder')"
              />
            </NGridItem>
          </NGrid>

          <NGrid :cols="2" :x-gap="12">
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">{{ $t('ai.node_definition.param_type') }}</div>
              <NSelect v-model:value="param.type" size="small" :options="paramTypeOptions" />
            </NGridItem>
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">{{ $t('ai.node_definition.default_value') }}</div>
              <NInput
                v-model:value="param.defaultValue"
                size="small"
                :placeholder="$t('ai.node_definition.optional')"
              />
            </NGridItem>
          </NGrid>

          <div>
            <div class="mb-1 text-xs text-gray-500">{{ $t('common.description') }}</div>
            <NInput
              v-model:value="param.description"
              size="small"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              :placeholder="$t('ai.node_definition.param_desc_placeholder')"
            />
          </div>

          <div>
            <NCheckbox v-model:checked="param.required" size="small">
              {{ $t('ai.node_definition.required_parameter') }}
            </NCheckbox>
          </div>
        </NSpace>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<style scoped>
.node-param-editor {
  width: 100%;
}
</style>
