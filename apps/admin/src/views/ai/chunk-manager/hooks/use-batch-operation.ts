import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
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

  const isBatchMode = ref(false);
  const selectedChunkIds = ref<string[]>([]);
  const batchOperating = ref(false);

  const batchActionOptions = computed(() => [
    { label: '批量启用', key: 'enable' },
    { label: '批量禁用', key: 'disable' },
    { label: 'AI 生成问题', key: 'generate' },
    { type: 'divider', key: 'd1' },
    { label: '批量删除', key: 'delete' }
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
      message.warning('请先选择分块');
      return;
    }

    if (key === 'generate' && onGenerate) {
      onGenerate();
      return;
    }

    batchOperating.value = true;
    const msg = message.loading('操作进行中，请稍候...', { duration: 0 });

    try {
      switch (key) {
        case 'enable':
          await batchEnableChunks(selectedChunkIds.value);
          message.success('批量启用成功');
          break;
        case 'disable':
          await batchDisableChunks(selectedChunkIds.value);
          message.success('批量禁用成功');
          break;
        case 'generate':
          await batchGenerateQuestionsByChunks(selectedChunkIds.value);
          message.success('批量生成问题成功');
          break;
        case 'delete':
          await batchDeleteChunks(selectedChunkIds.value);
          message.success('批量删除成功');
          break;
        default:
          break;
      }
      exitBatchMode();
      await onBatchComplete();
    } catch {
      message.error('操作失败');
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
