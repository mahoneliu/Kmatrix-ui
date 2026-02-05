<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NCard, NEmpty, useMessage } from 'naive-ui';
import { batchGenerateQuestionsByChunks, fetchDocumentDetail } from '@/service/api/ai/knowledge';
import { useBatchOperation, useChunkDetail, useChunkList, useChunkQuestions, useSearch } from './hooks';
import ChunkListPanel from './modules/chunk-list-panel.vue';
import ChunkDetailCard from './modules/chunk-detail-card.vue';
import ChunkEditModal from './modules/chunk-edit-modal.vue';
import ChunkAddModal from './modules/chunk-add-modal.vue';
import ModelSelectModal from './modules/model-select-modal.vue';

defineOptions({
  name: 'AiChunkManager'
});

const route = useRoute();
const message = useMessage();

// 从 query 参数获取 documentId
const documentId = computed(() => route.query.documentId as string | undefined);
const documentName = ref('');

// 使用 Hooks
const { searchField, searchKeyword } = useSearch();

const { chunks, loading, total, hasMore, loadingMore, loadChunks, handleScroll, resetPagination } = useChunkList({
  documentId,
  searchField,
  searchKeyword
});

const {
  selectedChunkId,
  selectedChunk,
  showEditModal,
  editTitleValue,
  editContentValue,
  savingChunk,
  handleSelectChunk,
  openEditModal,
  handleSaveChunk,
  handleToggleChunkStatus,
  handleDeleteChunk
} = useChunkDetail({
  chunks,
  onChunkUpdated: loadChunks
});

const {
  questions,
  loadingQuestions,
  generatingQuestions,
  documentQuestionOptions,
  showModelSelectModal,
  loadQuestions,
  loadDocumentQuestions,
  handleSelectQuestion,
  handleCreateQuestion,
  handleDeleteQuestion,
  handleOpenModelSelect,
  handleGenerateQuestions
} = useChunkQuestions({
  documentId,
  selectedChunkId
});

// 新增弹窗
const showAddChunkModal = ref(false);
const showBatchModelSelectModal = ref(false);

const {
  isBatchMode,
  selectedChunkIds,
  batchOperating,
  batchActionOptions,
  enterBatchMode,
  exitBatchMode,
  toggleChunkSelection,
  handleBatchAction
} = useBatchOperation({
  onBatchComplete: async () => {
    resetPagination();
    await loadChunks();
  },
  onGenerate: () => {
    showBatchModelSelectModal.value = true;
  }
});

const displayLevel = ref<'concise' | 'medium' | 'detailed'>('medium');

async function handleBatchGenerateConfirm(data: {
  modelId: CommonType.IdType;
  prompt: string;
  temperature: number;
  maxTokens: number;
}) {
  if (selectedChunkIds.value.length === 0) return;

  const msg = message.loading('批量生成问题中...', { duration: 0 });
  try {
    await batchGenerateQuestionsByChunks(selectedChunkIds.value, {
      modelId: data.modelId,
      prompt: data.prompt,
      temperature: data.temperature,
      maxTokens: data.maxTokens
    });
    message.success('批量生成问题成功');
    exitBatchMode();
    resetPagination();
    await loadChunks();
  } catch {
    message.error('批量生成问题失败');
  } finally {
    msg.destroy();
  }
}

// 初始化
onMounted(async () => {
  if (documentId.value) {
    try {
      const { data } = await fetchDocumentDetail(documentId.value);
      documentName.value = data?.originalFilename || '';
    } catch {
      // ignore
    }
    await loadChunks();
  }
});

// 搜索
async function handleSearch() {
  resetPagination();
  await loadChunks();
}

// 新增分块成功
async function handleAddChunkSuccess() {
  resetPagination();
  await loadChunks();
  // 选中新添加的分块（列表末尾）
  if (chunks.value.length > 0) {
    selectedChunkId.value = String(chunks.value[chunks.value.length - 1].id);
  }
}

// 保存分块（编辑弹窗）
async function handleSaveChunkFromModal(data: { title: string; content: string }) {
  if (!selectedChunk.value || !data.content) {
    message.error('内容不能为空');
    return;
  }
  editTitleValue.value = data.title;
  editContentValue.value = data.content;
  await handleSaveChunk();
}

// 加载问题（编辑弹窗）
function handleLoadQuestions() {
  if (selectedChunkId.value) {
    loadQuestions(selectedChunkId.value);
    loadDocumentQuestions();
  }
}

// 计算分块索引
const chunkIndex = computed(() => {
  if (!selectedChunk.value) return 0;
  return chunks.value.indexOf(selectedChunk.value);
});
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- 主体内容 -->
    <NCard class="flex-1 overflow-hidden" content-style="height: 100%; display: flex; flex-direction: column;">
      <div class="flex flex-1 gap-4 overflow-hidden">
        <!-- 左侧:分块列表 -->
        <ChunkListPanel
          :document-name="documentName"
          :chunks="chunks"
          :selected-chunk-id="selectedChunkId"
          :is-batch-mode="isBatchMode"
          :selected-chunk-ids="selectedChunkIds"
          :loading="loading"
          :total="total"
          :has-more="hasMore"
          :loading-more="loadingMore"
          :search-field="searchField"
          :search-keyword="searchKeyword"
          :batch-action-options="batchActionOptions"
          :batch-operating="batchOperating"
          :display-level="displayLevel"
          @update:display-level="displayLevel = $event"
          @select="handleSelectChunk"
          @toggle-selection="toggleChunkSelection"
          @scroll="handleScroll"
          @open-add-modal="showAddChunkModal = true"
          @enter-batch="enterBatchMode"
          @exit-batch="exitBatchMode"
          @batch-action="handleBatchAction"
          @update:search-field="searchField = $event"
          @update:search-keyword="searchKeyword = $event"
          @search="handleSearch"
          @open-edit-modal="openEditModal"
        />

        <!-- 右侧:分块详情 -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <NEmpty v-if="!selectedChunk" description="请选择一个分块" class="mt-20" />

          <div v-else class="min-h-0 flex flex-col flex-1 overflow-auto pr-2">
            <ChunkDetailCard
              :chunk="selectedChunk"
              :chunk-index="chunkIndex"
              @edit="openEditModal"
              @toggle-status="handleToggleChunkStatus"
              @generate-questions="handleOpenModelSelect"
              @delete="handleDeleteChunk(String(selectedChunk.id))"
            />
          </div>
        </div>
      </div>
    </NCard>

    <!-- 新建分块弹窗 -->
    <ChunkAddModal v-model:show="showAddChunkModal" :document-id="documentId" @success="handleAddChunkSuccess" />

    <!-- 编辑分块弹窗 -->
    <ChunkEditModal
      v-model:show="showEditModal"
      :chunk="selectedChunk"
      :chunk-index="chunkIndex"
      :questions="questions"
      :document-question-options="documentQuestionOptions"
      :loading-questions="loadingQuestions"
      :generating-questions="generatingQuestions"
      :saving-chunk="savingChunk"
      @save="handleSaveChunkFromModal"
      @select-question="handleSelectQuestion"
      @create-question="handleCreateQuestion"
      @delete-question="handleDeleteQuestion"
      @generate-questions="handleOpenModelSelect"
      @load-questions="handleLoadQuestions"
    />

    <!-- 模型选择弹窗 -->
    <!-- 模型选择弹窗 (单条生成) -->
    <ModelSelectModal v-model:show="showModelSelectModal" @confirm="handleGenerateQuestions" />

    <!-- 模型选择弹窗 (批量生成) -->
    <ModelSelectModal v-model:show="showBatchModelSelectModal" @confirm="handleBatchGenerateConfirm" />
  </div>
</template>
