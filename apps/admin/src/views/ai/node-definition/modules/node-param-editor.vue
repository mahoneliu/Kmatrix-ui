<script setup lang="ts">
import { computed } from 'vue';

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
  title: '参数'
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
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' }
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
        添加参数
      </NButton>
    </div>

    <div v-if="params.length === 0" class="py-4 text-center text-gray-400">暂无参数,点击上方按钮添加</div>

    <NCollapse v-else :default-expanded-names="[0]" class="space-y-2">
      <NCollapseItem v-for="(param, index) in params" :key="index" :name="index">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">参数 {{ index + 1 }}</span>
            <span v-if="param.key" class="text-xs text-gray-500">{{ param.key }}</span>
            <NTag v-if="param.required" size="small" type="error" :bordered="false">必填</NTag>
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
              <div class="mb-1 text-xs text-gray-500">参数键名 *</div>
              <NInput v-model:value="param.key" size="small" placeholder="例如: userInput" />
            </NGridItem>
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">参数标签 *</div>
              <NInput v-model:value="param.label" size="small" placeholder="例如: 用户输入" />
            </NGridItem>
          </NGrid>

          <NGrid :cols="2" :x-gap="12">
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">参数类型</div>
              <NSelect v-model:value="param.type" size="small" :options="paramTypeOptions" />
            </NGridItem>
            <NGridItem>
              <div class="mb-1 text-xs text-gray-500">默认值</div>
              <NInput v-model:value="param.defaultValue" size="small" placeholder="可选" />
            </NGridItem>
          </NGrid>

          <div>
            <div class="mb-1 text-xs text-gray-500">描述</div>
            <NInput
              v-model:value="param.description"
              size="small"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              placeholder="参数说明"
            />
          </div>

          <div>
            <NCheckbox v-model:checked="param.required" size="small">必填参数</NCheckbox>
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
