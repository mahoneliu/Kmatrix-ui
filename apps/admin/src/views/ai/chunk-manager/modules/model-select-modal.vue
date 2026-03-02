<script setup lang="ts">
import { computed } from 'vue';
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
const defaultPrompt = t('ai.model_select_modal.default_prompt');

// 提示信息内容
const alertContent = computed(() => {
  return `
    <div class="mb-2">
      ${t('ai.model_select_modal.alert_placeholders')}
    </div>
    <div class="mb-2">
      ${t('ai.model_select_modal.alert_role')}
    </div>
    <div>${t('ai.model_select_modal.alert_adjustment')}</div>
  `;
});

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
    :alert-content="alertContent"
    :show-alert="true"
    @update:show="handleUpdateShow"
    @confirm="handleConfirm"
  />
</template>
