import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import {
  batchDeleteChunks,
  batchDisableChunks,
  batchEnableChunks,
  batchGenerateQuestionsByChunks
} from '@/service/api/ai/knowledge';

interface UseBatchOperationOptions {
  onBatchComplete: () => Promise<void>;
  onGenerate?: () => void;
}

export function useBatchOperation(options: UseBatchOperationOptions) {
  const { onBatchComplete, onGenerate } = options;
  const message = useMessage();
  const { t } = useI18n();

  const isBatchMode = ref(false);
  const selectedChunkIds = ref<string[]>([]);
  const batchOperating = ref(false);

  const batchActionOptions = computed(() => [
    { label: t('ai.chunk_manager.batch_enable'), key: 'enable' },
    { label: t('ai.chunk_manager.batch_disable'), key: 'disable' },
    { label: t('ai.chunk_manager.ai_generate_question'), key: 'generate' },
    { type: 'divider', key: 'd1' },
    { label: t('ai.chunk_manager.batch_delete'), key: 'delete' }
  ]);

  function enterBatchMode() {
    isBatchMode.value = true;
    selectedChunkIds.value = [];
  }

  function exitBatchMode() {
    isBatchMode.value = false;
    selectedChunkIds.value = [];
  }

  function toggleChunkSelection(chunkId: string) {
    const index = selectedChunkIds.value.indexOf(chunkId);
    if (index === -1) {
      selectedChunkIds.value.push(chunkId);
    } else {
      selectedChunkIds.value.splice(index, 1);
    }
  }

  function isChunkSelected(chunkId: string) {
    return selectedChunkIds.value.includes(chunkId);
  }

  async function handleBatchAction(key: string) {
    if (selectedChunkIds.value.length === 0) {
      message.warning(t('ai.chunk_manager.select_chunk_prompt'));
      return;
    }

    if (key === 'generate' && onGenerate) {
      onGenerate();
      return;
    }

    batchOperating.value = true;
    const msg = message.loading(t('ai.chunk_manager.operating'), { duration: 0 });

    try {
      switch (key) {
        case 'enable': {
          const { error } = await batchEnableChunks(selectedChunkIds.value);
          if (!error) message.success(t('ai.chunk_manager.batch_enable_success'));
          break;
        }
        case 'disable': {
          const { error } = await batchDisableChunks(selectedChunkIds.value);
          if (!error) message.success(t('ai.chunk_manager.batch_disable_success'));
          break;
        }
        case 'generate': {
          const { error } = await batchGenerateQuestionsByChunks(selectedChunkIds.value);
          if (!error) message.success(t('ai.chunk_manager.batch_generate_success'));
          break;
        }
        case 'delete': {
          const { error } = await batchDeleteChunks(selectedChunkIds.value);
          if (!error) message.success(t('common.deleteSuccess'));
          break;
        }
        default:
          break;
      }
      exitBatchMode();
      await onBatchComplete();
    } catch {
      message.error(t('ai.chunk_manager.op_fail'));
    } finally {
      msg.destroy();
      batchOperating.value = false;
    }
  }

  return {
    isBatchMode,
    selectedChunkIds,
    batchOperating,
    batchActionOptions,
    enterBatchMode,
    exitBatchMode,
    toggleChunkSelection,
    isChunkSelected,
    handleBatchAction
  };
}
