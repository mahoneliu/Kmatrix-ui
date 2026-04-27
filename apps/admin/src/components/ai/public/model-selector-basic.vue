<script setup lang="ts">
import { ref, watch } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput, NInputNumber, NModal } from 'naive-ui';
import { useAiModelStore } from '@/store/modules/ai/ai-model';
import { $t } from '@/locales';
import ModelSelector from '@/components/ai/public/model-selector.vue';
import TemperatureSlider from '@/components/ai/public/temperature-slider.vue';

defineOptions({
  name: 'ModelSelectorBasic'
});

interface Props {
  show: boolean;
  title?: string;
  defaultPrompt?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  alertContent?: string;
  showAlert?: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: $t('ai.workflow_public.model_selector'),
  defaultPrompt: '',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  alertContent: '',
  showAlert: true
});

const emit = defineEmits<Emits>();

const aiModelStore = useAiModelStore();

// 表单数据
const formData = ref({
  modelId: null as CommonType.IdType | null,
  prompt: props.defaultPrompt,
  temperature: props.defaultTemperature,
  maxTokens: props.defaultMaxTokens
});

// 是否显示参数设置
const showAdvanced = ref(false);

// 监听模型变化,自动填充默认参数
watch(
  () => formData.value.modelId,
  modelId => {
    if (!modelId) return;
    const model = aiModelStore.models.find(m => m.modelId === modelId);
    if (model && model.config) {
      try {
        const config = JSON.parse(model.config);
        if (config.temperature !== undefined) {
          formData.value.temperature = config.temperature;
        }
        if (config.maxTokens !== undefined) {
          formData.value.maxTokens = config.maxTokens;
        }
      } catch {
        // ignore
      }
    }
  }
);

// 处理确认
function handleConfirm() {
  if (!formData.value.modelId) {
    return;
  }

  emit('confirm', {
    modelId: formData.value.modelId,
    prompt: formData.value.prompt,
    temperature: formData.value.temperature,
    maxTokens: formData.value.maxTokens
  });

  emit('update:show', false);
}

// 处理取消
function handleCancel() {
  emit('update:show', false);
}

// 重置表单
function resetForm() {
  formData.value = {
    modelId: null,
    prompt: props.defaultPrompt,
    temperature: props.defaultTemperature,
    maxTokens: props.defaultMaxTokens
  };
  showAdvanced.value = false;
}

// 监听弹窗打开,自动选中兜底大语言模型
watch(
  () => props.show,
  show => {
    if (show) {
      if (!formData.value.modelId) {
        const fallback = aiModelStore.models.find(m => m.isDefault === 1 && m.modelType === '1');
        if (fallback) {
          formData.value.modelId = fallback.modelId;
        }
      }
    } else {
      resetForm();
    }
  }
);
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    class="w-650px rounded-8px"
    :mask-closable="false"
    :segmented="{ content: true, action: true }"
    @update:show="emit('update:show', $event)"
  >
    <NForm :model="formData" label-placement="top" label-width="100">
      <!-- 提示信息 -->
      <NAlert v-if="showAlert && (alertContent || $slots.alert)" type="info" class="mb-4">
        <slot name="alert">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="text-sm" v-html="alertContent"></div>
        </slot>
      </NAlert>

      <!-- AI 模型 -->
      <NFormItem :label="$t('ai.workflow_public.ai_model')" path="modelId" required>
        <div class="w-full flex items-center gap-2">
          <ModelSelector
            v-model="formData.modelId"
            class="flex-1"
            :placeholder="$t('ai.workflow_public.please_select_ai_model')"
          />
          <NButton text type="primary" @click="showAdvanced = !showAdvanced">
            <template #icon>
              <SvgIcon :local-icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
            </template>
            {{ $t('ai.workflow_public.param_settings') }}
          </NButton>
        </div>
      </NFormItem>

      <!-- 高级参数 -->
      <div v-if="showAdvanced">
        <div class="mb-4 text-sm font-medium">{{ $t('ai.workflow_public.advanced_params') }}</div>

        <NFormItem :label="$t('ai.workflow_public.temperature')" path="temperature">
          <TemperatureSlider v-model:model-value="formData.temperature" :show-label="false" />
        </NFormItem>

        <NFormItem :label="$t('ai.workflow_public.max_tokens')" path="maxTokens">
          <NInputNumber
            v-model:value="formData.maxTokens"
            :min="1"
            class="w-full"
            :placeholder="$t('ai.workflow_node.default_use_model_limit')"
          />
        </NFormItem>
      </div>

      <!-- 提示词 -->
      <NFormItem :label="$t('ai.workflow_public.prompt')" path="prompt" required>
        <NInput
          v-model:value="formData.prompt"
          type="textarea"
          :placeholder="$t('ai.workflow_template.please_input_prompt')"
          :rows="10"
          :autosize="{ minRows: 10, maxRows: 15 }"
        />
      </NFormItem>
    </NForm>

    <template #action>
      <div class="w-full flex justify-end gap-2">
        <NButton @click="handleCancel">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :disabled="!formData.modelId" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
:deep(code) {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}
</style>
