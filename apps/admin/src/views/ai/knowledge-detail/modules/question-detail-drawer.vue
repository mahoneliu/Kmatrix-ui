<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { NButton, NCard, NDrawer, NInput, NSpace } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  fetchQuestionLinkedChunks,
  unlinkQuestionFromChunk,
  updateChunk,
  updateQuestion
} from '@/service/api/ai/knowledge';
import ButtonIcon from '@/components/custom/button-icon.vue';
import ChunkEditModal from '../../chunk-manager/modules/chunk-edit-modal.vue';
import ModelSelectModal from '../../chunk-manager/modules/model-select-modal.vue';
import { useChunkQuestions } from '../../chunk-manager/hooks/use-chunk-questions';
import ChunkLinkModal from './chunk-link-modal.vue';

defineOptions({
  name: 'QuestionDetailDrawer'
});

interface Props {
  visible?: boolean;
  questionId?: CommonType.IdType | null;
  questions?: Api.AI.KB.Question[]; // 所有问题列表
  kbId?: CommonType.IdType;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'update:selected-row', value: CommonType.IdType | null): void;
  (e: 'refresh'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  questionId: null,
  questions: () => [],
  kbId: undefined
});

const emit = defineEmits<Emits>();

// 编辑状态
const isEditing = ref(false);
const editContent = ref('');
const editInputRef = ref<InstanceType<typeof NInput> | null>(null);

// 关联分段数据
const linkedChunks = ref<Array<Api.AI.KB.DocumentChunk & { documentTitle?: string; documentId?: CommonType.IdType }>>(
  []
);
const loadingChunks = ref(false);

// 分块编辑相关
const showEditModal = ref(false);
const editingChunk = ref<Api.AI.KB.DocumentChunk | null>(null);
const currentDocumentId = ref<string | undefined>(undefined);
const selectedChunkId = computed(() => (editingChunk.value ? String(editingChunk.value.id) : null));

// 关联分段弹窗
const showLinkModal = ref(false);
const savingChunk = ref(false);

const {
  questions: chunkQuestions,
  loadingQuestions,
  generatingQuestions,
  documentQuestionOptions,
  showModelSelectModal,
  loadQuestions,
  loadDocumentQuestions,
  handleSelectQuestion,
  handleCreateQuestion,
  handleDeleteQuestion,
  handleOpenModelSelect: handleOpenGenerateModal,
  handleGenerateQuestions
} = useChunkQuestions({
  documentId: currentDocumentId,
  selectedChunkId
});

// 当前问题
const currentQuestion = computed(() => {
  return props.questions.find(q => q.id === props.questionId) || null;
});

// 当前索引
const currentIndex = computed(() => {
  return props.questions.findIndex(q => q.id === props.questionId);
});

// 是否可以上一条/下一条
const canPrevious = computed(() => currentIndex.value > 0);
const canNext = computed(() => currentIndex.value < props.questions.length - 1);

// 关闭抽屉
function handleClose() {
  emit('update:visible', false);
  isEditing.value = false;
}

// 开始编辑
function startEdit() {
  if (!currentQuestion.value) return;
  isEditing.value = true;
  editContent.value = currentQuestion.value.content || '';
  nextTick(() => {
    editInputRef.value?.focus();
  });
}

// 取消编辑
function cancelEdit() {
  isEditing.value = false;
  editContent.value = '';
}

// 保存编辑
async function saveEdit() {
  if (!currentQuestion.value || !editContent.value.trim()) {
    cancelEdit();
    return;
  }

  if (editContent.value === currentQuestion.value.content) {
    cancelEdit();
    return;
  }

  try {
    await updateQuestion(currentQuestion.value.id, editContent.value.trim());
    window.$message?.success('修改成功');
    cancelEdit();
    emit('refresh');
  } catch {
    window.$message?.error('修改失败');
  }
}

// 加载关联分段
async function loadLinkedChunks() {
  if (!props.questionId) return;

  loadingChunks.value = true;
  try {
    const { data, error } = await fetchQuestionLinkedChunks(props.questionId);
    if (!error && data) {
      linkedChunks.value = data;
    }
  } catch {
    window.$message?.error('加载关联分段失败');
  } finally {
    loadingChunks.value = false;
  }
}

// 取消关联
async function handleUnlink(chunkId: CommonType.IdType) {
  window.event?.stopPropagation();
  if (!props.questionId) return;

  window.$dialog?.warning({
    title: '确认取消关联',
    content: '确定要取消该问题与此知识分段的关联吗?',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      const { error } = await unlinkQuestionFromChunk(props.questionId!, chunkId);
      if (!error) {
        window.$message?.success('取消关联成功');
        // 重新加载关联分段
        await loadLinkedChunks();
        await loadLinkedChunks();
        emit('refresh');
      }
    }
  });
}

// 点击分块
async function handleChunkClick(
  chunk: Api.AI.KB.DocumentChunk & { documentTitle?: string; documentId?: CommonType.IdType }
) {
  editingChunk.value = chunk;
  // 确保 documentId 是 string 类型或者 undefined
  currentDocumentId.value = chunk.documentId ? String(chunk.documentId) : undefined;
  showEditModal.value = true;

  handleLoadQuestions();
}

// 加载问题
function handleLoadQuestions() {
  if (editingChunk.value?.id) {
    loadQuestions(String(editingChunk.value.id));
  }
  if (currentDocumentId.value) {
    loadDocumentQuestions();
  }
}

// 保存分块
async function handleSaveChunk(data: { title: string; content: string }) {
  if (!editingChunk.value) return;

  if (!data.content) {
    window.$message?.error('内容不能为空');
    return;
  }

  savingChunk.value = true;
  try {
    await updateChunk({
      id: editingChunk.value.id,
      title: data.title,
      content: data.content
    });
    window.$message?.success('保存成功');
    // 更新列表中的数据
    if (editingChunk.value) {
      editingChunk.value.title = data.title;
      editingChunk.value.content = data.content;
      // 同时更新关联列表中的显示，保持 optimistic UI update
      const index = linkedChunks.value.findIndex(c => c.id === editingChunk.value?.id);
      if (index > -1) {
        linkedChunks.value[index] = { ...linkedChunks.value[index], ...data };
      }
    }
    showEditModal.value = false;
  } catch {
    window.$message?.error('保存失败');
  } finally {
    savingChunk.value = false;
  }
}

// 导航到上一条
function handlePrevious() {
  if (!canPrevious.value) return;
  const prevQuestion = props.questions[currentIndex.value - 1];
  if (prevQuestion) {
    emit('update:selected-row', prevQuestion.id);
  }
}

// 导航到下一条
function handleNext() {
  if (!canNext.value) return;
  const nextQuestion = props.questions[currentIndex.value + 1];
  if (nextQuestion) {
    emit('update:selected-row', nextQuestion.id);
  }
}

// 监听问题ID变化
watch(
  () => props.questionId,
  questionId => {
    if (questionId) {
      loadLinkedChunks();
      cancelEdit();
    }
  },
  { immediate: true }
);
</script>

<template>
  <NDrawer :show="visible" :width="600" placement="right" @update:show="handleClose">
    <template #header>
      <div class="flex items-center justify-between">
        <span>问题详情</span>
        <ButtonIcon icon="mdi:close" type="default" text @click="handleClose" />
      </div>
    </template>

    <div v-if="currentQuestion" class="flex-col-stretch gap-16px">
      <!-- 问题内容区域 -->
      <NCard title="问题" :bordered="false" size="small">
        <template #header-extra>
          <ButtonIcon
            v-if="!isEditing"
            icon="mdi:pencil"
            type="primary"
            text
            tooltip-content="编辑"
            @click="startEdit"
          />
        </template>

        <div v-if="!isEditing" class="whitespace-pre-wrap">
          {{ currentQuestion.content }}
        </div>
        <div v-else class="flex items-center gap-8px">
          <NInput
            ref="editInputRef"
            v-model:value="editContent"
            type="text"
            placeholder="请输入问题内容"
            class="flex-1"
          />
          <NButton size="small" @click="cancelEdit">取消</NButton>
          <NButton size="small" type="primary" @click="saveEdit">保存</NButton>
        </div>

        <!-- 问题元信息 -->
        <div class="mt-16px flex items-center gap-12px text-12px text-gray-500">
          <span>来源: {{ currentQuestion.sourceType === 'MANUAL' ? '手动添加' : 'AI生成' }}</span>
          <span>创建时间: {{ currentQuestion.createTime }}</span>
        </div>
      </NCard>

      <!-- 关联分段区域 -->
      <NCard :title="`关联分段 (${linkedChunks.length}个)`" :bordered="false" size="small">
        <template #header-extra>
          <div class="flex items-center gap-4px">
            <NButton type="primary" size="small" secondary @click="showLinkModal = true">
              <SvgIcon icon="mdi:plus" />
              添加关联
            </NButton>
          </div>
        </template>

        <div v-if="loadingChunks" class="py-32px text-center text-gray-400">加载中...</div>
        <div v-else-if="linkedChunks.length === 0" class="py-32px text-center text-gray-400">暂无关联分段</div>
        <div v-else class="flex-col-stretch gap-12px">
          <NCard
            v-for="chunk in linkedChunks"
            :key="chunk.id"
            size="small"
            :bordered="true"
            class="cursor-pointer transition-shadow hover:shadow-md"
            @click="handleChunkClick(chunk)"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-14px font-semibold">{{ chunk.title || '无标题' }}</span>
                <ButtonIcon
                  icon="mdi:link-variant-off"
                  type="warning"
                  text
                  tooltip-content="取消关联"
                  @click="handleUnlink(chunk.id)"
                />
              </div>
            </template>

            <div class="line-clamp-3 text-12px text-gray-600">
              {{ chunk.content }}
            </div>

            <div class="mt-8px text-12px text-gray-400">
              <span v-if="chunk.documentTitle">文档: {{ chunk.documentTitle }}</span>
            </div>
          </NCard>
        </div>
      </NCard>

      <!-- 底部导航栏 -->
      <div class="fixed bottom-0 right-0 z-1000 w-600px border-t border-gray-200 bg-white p-16px">
        <NSpace justify="space-between">
          <div class="text-14px text-gray-500">{{ currentIndex + 1 }} / {{ questions.length }}</div>
          <NSpace>
            <NButton :disabled="!canPrevious" @click="handlePrevious">
              <template #icon>
                <SvgIcon icon="mdi:chevron-left" />
              </template>
              上一条
            </NButton>
            <NButton :disabled="!canNext" @click="handleNext">
              下一条
              <template #icon>
                <SvgIcon icon="mdi:chevron-right" />
              </template>
            </NButton>
          </NSpace>
        </NSpace>
      </div>
    </div>
  </NDrawer>

  <ChunkEditModal
    v-model:show="showEditModal"
    :chunk="editingChunk"
    :questions="chunkQuestions"
    :document-question-options="documentQuestionOptions"
    :loading-questions="loadingQuestions"
    :generating-questions="generatingQuestions"
    :saving-chunk="savingChunk"
    @save="handleSaveChunk"
    @select-question="handleSelectQuestion"
    @create-question="handleCreateQuestion"
    @delete-question="handleDeleteQuestion"
    @generate-questions="handleOpenGenerateModal"
    @load-questions="handleLoadQuestions"
  />

  <ModelSelectModal v-model:show="showModelSelectModal" @confirm="handleGenerateQuestions" />

  <ChunkLinkModal v-model:visible="showLinkModal" :question-id="questionId" :kb-id="kbId" @success="loadLinkedChunks" />
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}
</style>
