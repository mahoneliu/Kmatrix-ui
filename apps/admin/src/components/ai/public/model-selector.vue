<script setup lang="ts">
import { type VNodeChild, computed, h, onMounted } from 'vue';
import { NSelect, NTag, NTooltip, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { aiModelTypeRecord } from '@/constants/business';
import { useAiModelStore } from '@/store/modules/ai/ai-model';
import { $t } from '@/locales';

// 获取模型的多模态能力支持情况
function getModelAbilities(item: any) {
  let abilities: string[] = [];
  try {
    if (typeof item.abilities === 'string' && item.abilities) {
      abilities = JSON.parse(item.abilities);
    } else if (Array.isArray(item.abilities)) {
      abilities = item.abilities;
    }
  } catch {
    abilities = [];
  }

  return {
    vision: abilities.includes('vision') || item.modelType === '5',
    audio: abilities.includes('audio') || item.modelType === '4',
    video: abilities.includes('video') || item.modelType === '6'
  };
}

const modelTypeTagMap: Record<string, import('naive-ui').TagProps['type']> = {
  '0': 'primary', // Multi-modal
  '1': 'primary', // LLM
  '2': 'success', // Embedding
  '3': 'warning', // Rerank
  '4': 'error', // Speech
  '5': 'info', // Image
  '6': 'default' // Video
};

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
  placeholder: $t('ai.workflow_public.please_select_llm_model'),
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
    message.error($t('ai.workflow_public.load_model_list_failed'));
  }
}

// 处理值变化
function handleUpdateValue(value: CommonType.IdType | null) {
  emit('update:modelValue', value);
}

onMounted(() => {
  loadModels();
});

const renderLabel = (option: any): VNodeChild => {
  if (!option.original) return option.label;

  const m = option.original as Api.AI.Admin.Model;
  const abilities = getModelAbilities(m);

  const tagsAndIcons: any[] = [];

  // 类型标签
  tagsAndIcons.push(
    h(
      NTag,
      {
        size: 'small',
        type: modelTypeTagMap[m.modelType] || 'info',
        bordered: true,
        style: 'margin-left: 8px; font-size: 10px; transform: scale(0.9); flex-shrink: 0;'
      },
      { default: () => aiModelTypeRecord[m.modelType] || m.modelType }
    )
  );

  // 能力图标
  if (abilities.vision) {
    tagsAndIcons.push(
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(SvgIcon, {
              icon: 'carbon:view',
              style: 'margin-left: 4px; font-size: 14px; color: #9ca3af; cursor: help;'
            }),
          default: () => '视觉 (Vision/Image)'
        }
      )
    );
  }
  if (abilities.audio) {
    tagsAndIcons.push(
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(SvgIcon, {
              icon: 'carbon:microphone',
              style: 'margin-left: 4px; font-size: 14px; color: #9ca3af; cursor: help;'
            }),
          default: () => '语音 (Audio/Speech)'
        }
      )
    );
  }
  if (abilities.video) {
    tagsAndIcons.push(
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(SvgIcon, {
              icon: 'carbon:video',
              style: 'margin-left: 4px; font-size: 14px; color: #9ca3af; cursor: help;'
            }),
          default: () => '视频 (Video)'
        }
      )
    );
  }

  return h('div', { style: 'display: flex; align-items: center; justify-content: space-between; width: 100%' }, [
    h(
      'span',
      { style: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;', title: option.label },
      option.label
    ),
    h('div', { style: 'display: flex; align-items: center; flex-shrink: 0;' }, tagsAndIcons)
  ]);
};
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
    :render-label="renderLabel"
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
