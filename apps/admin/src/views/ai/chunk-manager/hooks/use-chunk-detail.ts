import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import { deleteChunk, disableChunk, enableChunk, updateChunk } from '@/service/api/ai/knowledge';

interface UseChunkDetailOptions {
  chunks: Ref<Api.AI.KB.DocumentChunk[]>;
  onChunkUpdated: () => Promise<void>;
}

export function useChunkDetail(options: UseChunkDetailOptions) {
  const { chunks, onChunkUpdated } = options;
  const message = useMessage();

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
      message.error('内容不能为空');
      return;
    }

    savingChunk.value = true;
    try {
      await updateChunk({
        id: selectedChunk.value.id,
        title: editTitleValue.value.trim() || undefined,
        content: editContentValue.value.trim()
      });
      message.success('保存成功');
      isEditing.value = false;
      await onChunkUpdated();
    } catch {
      message.error('保存失败');
    } finally {
      savingChunk.value = false;
    }
  }

  async function handleToggleChunkStatus(enabled: boolean) {
    if (!selectedChunk.value) return;

    try {
      if (enabled) {
        await enableChunk(selectedChunk.value.id);
        message.success('已启用');
      } else {
        await disableChunk(selectedChunk.value.id);
        message.success('已禁用');
      }
      await onChunkUpdated();
    } catch {
      message.error('操作失败');
    }
  }

  async function handleDeleteChunk(chunkId: string) {
    try {
      await deleteChunk(chunkId);
      message.success('删除成功');
      if (selectedChunkId.value === chunkId) {
        selectedChunkId.value = null;
      }
      await onChunkUpdated();
    } catch {
      message.error('删除失败');
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
