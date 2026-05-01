import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { deleteChunk, disableChunk, enableChunk, updateChunk } from '@/service/api/ai/knowledge';

interface UseChunkDetailOptions {
  chunks: Ref<Api.AI.KB.DocumentChunk[]>;
  onChunkUpdated: () => Promise<void>;
}

export function useChunkDetail(options: UseChunkDetailOptions) {
  const { chunks, onChunkUpdated } = options;
  const message = useMessage();
  const { t } = useI18n();

  // 选中的分块
  const selectedChunkId = ref<string | null>(null);
  const selectedChunk = computed(() => {
    if (!selectedChunkId.value) return null;
    return chunks.value.find(c => String(c.id) === selectedChunkId.value) || null;
  });

  // 编辑弹窗状态
  const showEditModal = ref(false);
  const isEditing = ref(false);
  const editTitleValue = ref('');
  const editContentValue = ref('');
  const savingChunk = ref(false);

  function handleSelectChunk(chunkId: string) {
    selectedChunkId.value = chunkId;
  }

  function openEditModal() {
    if (!selectedChunk.value) return;
    editTitleValue.value = selectedChunk.value.title || '';
    editContentValue.value = selectedChunk.value.content || '';
    isEditing.value = false;
    showEditModal.value = true;
  }

  function startEditing() {
    if (!selectedChunk.value) return;
    editTitleValue.value = selectedChunk.value.title || '';
    editContentValue.value = selectedChunk.value.content || '';
    isEditing.value = true;
  }

  async function handleSaveChunk() {
    if (!selectedChunk.value || !editContentValue.value.trim()) {
      message.error(t('ai.chunk_manager.content_empty_error'));
      return;
    }

    savingChunk.value = true;
    try {
      const { error } = await updateChunk({
        id: selectedChunk.value.id,
        title: editTitleValue.value.trim() || undefined,
        content: editContentValue.value.trim()
      });
      if (error) return;
      message.success(t('ai.chunk_manager.save_success'));
      isEditing.value = false;
      await onChunkUpdated();
    } catch {
      message.error(t('ai.chunk_manager.save_fail'));
    } finally {
      savingChunk.value = false;
    }
  }

  async function handleToggleChunkStatus(enabled: boolean) {
    if (!selectedChunk.value) return;

    try {
      if (enabled) {
        const { error } = await enableChunk(selectedChunk.value.id);
        if (!error) message.success(t('ai.chunk_manager.enabled_success'));
      } else {
        const { error } = await disableChunk(selectedChunk.value.id);
        if (!error) message.success(t('ai.chunk_manager.disabled_success'));
      }
      await onChunkUpdated();
    } catch {
      message.error(t('ai.chunk_manager.op_fail'));
    }
  }

  async function handleDeleteChunk(chunkId: string) {
    try {
      const { error } = await deleteChunk(chunkId);
      if (error) return;
      message.success(t('common.deleteSuccess'));
      if (selectedChunkId.value === chunkId) {
        selectedChunkId.value = null;
      }
      await onChunkUpdated();
    } catch {
      message.error(t('common.deleteFail'));
    }
  }

  // 自动选中第一个分块
  watch(
    () => chunks.value,
    newChunks => {
      if (newChunks.length > 0 && !selectedChunkId.value) {
        selectedChunkId.value = String(newChunks[0].id);
      }
    },
    { immediate: true }
  );

  return {
    selectedChunkId,
    selectedChunk,
    showEditModal,
    isEditing,
    editTitleValue,
    editContentValue,
    savingChunk,
    handleSelectChunk,
    openEditModal,
    startEditing,
    handleSaveChunk,
    handleToggleChunkStatus,
    handleDeleteChunk
  };
}
