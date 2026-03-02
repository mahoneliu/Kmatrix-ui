<script lang="ts" setup>
import { ref } from 'vue';
import { NButton, NInput, NModal, NSpace, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { addChunk } from '@/service/api/ai/knowledge';

defineOptions({
  name: 'ChunkAddModal'
});

interface Props {
  documentId: string | undefined;
}

interface Emits {
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const show = defineModel<boolean>('show', { required: true });

const message = useMessage();

const newChunkTitle = ref('');
const newChunkContent = ref('');
const addingChunk = ref(false);

async function handleAddChunk() {
  if (!props.documentId || !newChunkContent.value.trim()) return;

  addingChunk.value = true;
  try {
    await addChunk({
      documentId: props.documentId,
      title: newChunkTitle.value.trim() || undefined,
      content: newChunkContent.value.trim()
    });
    message.success(t('common.addSuccess'));
    newChunkTitle.value = '';
    newChunkContent.value = '';
    show.value = false;
    emit('success');
  } catch {
    message.error(t('ai.chunk_manager.save_fail'));
  } finally {
    addingChunk.value = false;
  }
}
</script>

<template>
  <NModal
    v-model:show="show"
    preset="card"
    :title="t('ai.chunk_manager.add_chunk')"
    class="w-600px"
    :mask-closable="false"
  >
    <NSpace vertical :size="16">
      <NInput
        v-model:value="newChunkTitle"
        :maxlength="256"
        show-count
        :placeholder="t('ai.chunk_manager.title_optional_placeholder')"
      />
      <NInput
        v-model:value="newChunkContent"
        type="textarea"
        :maxlength="1000"
        show-count
        :rows="8"
        :placeholder="t('ai.chunk_manager.content_required_placeholder')"
      />
    </NSpace>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="show = false">{{ t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="addingChunk" :disabled="!newChunkContent.trim()" @click="handleAddChunk">
          {{ t('common.add') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
