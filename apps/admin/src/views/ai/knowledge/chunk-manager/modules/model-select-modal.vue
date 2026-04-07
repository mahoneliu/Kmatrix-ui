<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ModelSelectorBasic from '@/components/ai/public/model-selector-basic.vue';

defineOptions({
  name: 'ModelSelectModal'
});

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }): void;
}

const show = defineModel<boolean>('show', { required: true });

const emit = defineEmits<Emits>();
const { t } = useI18n();

// 切片问题生成的默认提示词
const defaultPrompt = t('ai.chunk_manager.model_select_modal.default_prompt', { data: '{data}' });

function handleConfirm(data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }) {
  emit('confirm', data);
}

function handleUpdateShow(value: boolean) {
  emit('update:show', value);
}
</script>

<template>
  <ModelSelectorBasic
    :show="show"
    :title="t('ai.chunk_manager.ai_generate_question')"
    :default-prompt="defaultPrompt"
    :default-temperature="0.7"
    :default-max-tokens="2048"
    :show-alert="true"
    @update:show="handleUpdateShow"
    @confirm="handleConfirm"
  >
    <template #alert>
      <div class="mb-2">
        <I18nT keypath="ai.chunk_manager.model_select_modal.alert_placeholders" tag="span">
          <template #code>
            <code class="rounded bg-gray-100 px-1">{data}</code>
          </template>
        </I18nT>
      </div>
      <div class="mb-2">
        {{ t('ai.chunk_manager.model_select_modal.alert_role') }}
      </div>
      <div>{{ t('ai.chunk_manager.model_select_modal.alert_adjustment') }}</div>
    </template>
  </ModelSelectorBasic>
</template>
