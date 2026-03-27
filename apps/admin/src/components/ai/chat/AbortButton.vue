<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

interface Props {
  /** 请求ID */
  requestId: string;
  /** 是否正在处理中 */
  isProcessing: boolean;
}

interface Emits {
  /** 中断请求事件 */
  abort: [requestId: string];
  /** 中断成功事件 */
  abortSuccess: [];
  /** 中断失败事件 */
  abortError: [error: Error];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const message = useMessage();
const loading = ref(false);

/**
 * 处理中断按钮点击
 */
const handleAbort = async () => {
  if (!props.requestId) {
    message.error(t('ai.chat.abort_failed'));
    emit('abortError', new Error('Request ID is empty'));
    return;
  }

  loading.value = true;
  try {
    emit('abort', props.requestId);
    emit('abortSuccess');
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    message.error(t('ai.chat.abort_failed'));
    emit('abortError', err);
  } finally {
    loading.value = false;
  }
};

/**
 * 计算按钮是否应该显示
 */
const isVisible = computed(() => props.isProcessing);

/**
 * 计算按钮是否禁用
 */
const isDisabled = computed(() => loading.value);
</script>

<template>
  <div v-if="isVisible" class="abort-button-container">
    <NButton type="error" :loading="loading" :disabled="isDisabled" class="abort-button" @click="handleAbort">
      <template #icon>
        <SvgIcon local-icon="mdi-stop-circle-outline" />
      </template>
      {{ $t('chat.abort') }}
    </NButton>
  </div>
</template>

<style scoped>
.abort-button-container {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
  animation: slideIn 0.3s ease-out;
}

.abort-button {
  min-width: 120px;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
