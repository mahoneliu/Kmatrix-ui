<script lang="ts" setup>
import { ref } from 'vue';
import { NButton, NInput, NModal, NSpace, useMessage } from 'naive-ui';
import { addChunk } from '@/service/api/ai/knowledge';

defineOptions({
  name: 'ChunkAddModal'
});

interface Props {
  show: boolean;
  documentId: string | undefined;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();

const newChunkTitle = ref('');
const newChunkContent = ref('');
const addingChunk = ref(false);

function handleClose() {
  emit('update:show', false);
}

async function handleAddChunk() {
  if (!props.documentId || !newChunkContent.value.trim()) return;

  addingChunk.value = true;
  try {
    await addChunk({
      documentId: props.documentId,
      title: newChunkTitle.value.trim() || undefined,
      content: newChunkContent.value.trim()
    });
    message.success('添加成功');
    newChunkTitle.value = '';
    newChunkContent.value = '';
    emit('update:show', false);
    emit('success');
  } catch {
    message.error('添加失败');
  } finally {
    addingChunk.value = false;
  }
}
</script>

<template>
  <NModal :show="show" preset="card" title="新建分块" class="w-600px" :mask-closable="false" @update:show="handleClose">
    <NSpace vertical :size="16">
      <NInput v-model:value="newChunkTitle" :maxlength="256" show-count placeholder="分块标题（可选）" />
      <NInput
        v-model:value="newChunkContent"
        type="textarea"
        :maxlength="1000"
        show-count
        :rows="8"
        placeholder="分块内容（必填）"
      />
    </NSpace>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :loading="addingChunk" :disabled="!newChunkContent.trim()" @click="handleAddChunk">
          添加
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
