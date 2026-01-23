<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NSelect, useMessage } from 'naive-ui';
import { useAiModelStore } from '@/store/modules/ai-model';

interface Props {
  modelValue?: CommonType.IdType | null;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;

  size?: 'small' | 'medium' | 'large';
}

interface Emits {
  (e: 'update:modelValue', value: CommonType.IdType | null): void;
}

withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '请选择 LLM 模型',
  clearable: true,
  disabled: false,

  size: 'small'
});

const emit = defineEmits<Emits>();
const message = useMessage();
const aiModelStore = useAiModelStore();

// 模型选项
const modelOptions = computed(() => aiModelStore.getModelOptions());

// 加载模型列表
async function loadModels() {
  try {
    await aiModelStore.loadModels();
  } catch {
    message.error('加载模型列表失败');
  }
}

// 处理值变化
function handleUpdateValue(value: CommonType.IdType | null) {
  emit('update:modelValue', value);
}

onMounted(() => {
  loadModels();
});
</script>

<template>
  <NSelect
    :value="modelValue"
    :options="modelOptions"
    :loading="aiModelStore.loading"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :size="size"
    :menu-props="{ class: 'model-selector-menu' }"
    @update:value="handleUpdateValue"
  />
</template>

<style scoped>
:deep(.n-base-selection-label),
:deep(.n-base-selection-input),
:deep(.n-base-selection-placeholder) {
  font-size: 11px !important;
}

/* 下拉菜单渲染在 body 下，不能使用 scoped */
.model-selector-menu .n-base-select-option {
  font-size: 11px !important;
}
</style>
