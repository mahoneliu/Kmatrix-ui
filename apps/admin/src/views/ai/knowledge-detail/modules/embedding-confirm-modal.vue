<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NModal, NRadio, NRadioGroup, NSpace } from 'naive-ui';
import { $t } from '@/locales';

interface Props {
  show?: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', option: 'UNEMBEDDED_ONLY' | 'ALL'): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false
});

const emit = defineEmits<Emits>();

// 选中的选项
const selectedOption = ref<'UNEMBEDDED_ONLY' | 'ALL'>('UNEMBEDDED_ONLY');

function handleCancel() {
  emit('update:show', false);
  // 重置为默认选项
  selectedOption.value = 'UNEMBEDDED_ONLY';
}

function handleConfirm() {
  emit('confirm', selectedOption.value);
  emit('update:show', false);
  // 重置为默认选项
  selectedOption.value = 'UNEMBEDDED_ONLY';
}
</script>

<template>
  <NModal
    :show="props.show"
    preset="dialog"
    :title="$t('ai.embeddingConfirmModal.selectChunk')"
    class="w-400px"
    @update:show="(val: boolean) => emit('update:show', val)"
  >
    <NRadioGroup v-model:value="selectedOption">
      <NSpace vertical>
        <NRadio value="UNEMBEDDED_ONLY">{{ $t('ai.embeddingConfirmModal.unembeddedOnly') }}</NRadio>
        <NRadio value="ALL">{{ $t('ai.embeddingConfirmModal.allChunks') }}</NRadio>
      </NSpace>
    </NRadioGroup>

    <template #action>
      <NSpace>
        <NButton @click="handleCancel">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleConfirm">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
