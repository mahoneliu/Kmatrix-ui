<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
  NButton,
  NCard,
  NEmpty,
  NInput,
  NList,
  NListItem,
  NModal,
  NPopconfirm,
  NSpace,
  NSpin,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  addChunk,
  addQuestion,
  deleteChunk,
  deleteQuestion,
  fetchChunksByDocumentId,
  fetchQuestionsByChunkId,
  generateQuestions,
  updateChunk
} from '@/service/api/ai/knowledge';

interface Props {
  visible?: boolean;
  documentId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  documentId: undefined
});

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const message = useMessage();
const loading = ref(false);
const chunks = ref<Api.AI.KB.DocumentChunk[]>([]);

// 选中的分块
const selectedChunkId = ref<string | null>(null);
const selectedChunk = computed(() => {
  if (!selectedChunkId.value) return null;
  return chunks.value.find(c => String(c.id) === selectedChunkId.value) || null;
});

// Questions for selected chunk
const questions = ref<Api.AI.KB.Question[]>([]);
const loadingQuestions = ref(false);

// Edit states
const editingTitle = ref(false);
const editTitleValue = ref('');
const editingContent = ref(false);
const editContentValue = ref('');

// Add Question
const newQuestionContent = ref('');
const generatingQuestions = ref(false);

// Add Chunk
const showAddChunkModal = ref(false);
const newChunkTitle = ref('');
const newChunkContent = ref('');
const addingChunk = ref(false);

watch(
  () => props.visible,
  val => {
    if (val && props.documentId) {
      loadChunks();
    } else {
      chunks.value = [];
      selectedChunkId.value = null;
      questions.value = [];
    }
  }
);

watch(selectedChunkId, val => {
  if (val) {
    loadQuestions(val);
  } else {
    questions.value = [];
  }
});

async function loadChunks() {
  if (!props.documentId) return;
  loading.value = true;
  try {
    const { data } = await fetchChunksByDocumentId(props.documentId);
    chunks.value = data || [];
    // 自动选中第一个分块
    if (chunks.value.length > 0 && !selectedChunkId.value) {
      selectedChunkId.value = String(chunks.value[0].id);
    }
  } finally {
    loading.value = false;
  }
}

async function loadQuestions(chunkId: string) {
  loadingQuestions.value = true;
  try {
    const { data } = await fetchQuestionsByChunkId(chunkId);
    questions.value = data || [];
  } finally {
    loadingQuestions.value = false;
  }
}

function handleSelectChunk(chunkId: string) {
  selectedChunkId.value = chunkId;
  editingTitle.value = false;
  editingContent.value = false;
}

// Title Edit
function startEditTitle() {
  if (!selectedChunk.value) return;
  editTitleValue.value = selectedChunk.value.title || '';
  editingTitle.value = true;
}

async function saveTitle() {
  if (!selectedChunk.value || !editTitleValue.value.trim()) {
    editingTitle.value = false;
    return;
  }

  try {
    await updateChunk({ id: selectedChunk.value.id, title: editTitleValue.value.trim() });
    message.success('标题更新成功');
    editingTitle.value = false;
    await loadChunks();
  } catch {
    message.error('标题更新失败');
  }
}

function cancelEditTitle() {
  editingTitle.value = false;
}

// Content Edit
function startEditContent() {
  if (!selectedChunk.value) return;
  editContentValue.value = selectedChunk.value.content || '';
  editingContent.value = true;
}

async function saveContent() {
  if (!selectedChunk.value || !editContentValue.value.trim()) {
    editingContent.value = false;
    return;
  }

  try {
    await updateChunk({ id: selectedChunk.value.id, content: editContentValue.value.trim() });
    message.success('内容更新成功');
    editingContent.value = false;
    await loadChunks();
  } catch {
    message.error('内容更新失败');
  }
}

function cancelEditContent() {
  editingContent.value = false;
}

async function handleDeleteChunk(chunkId: string) {
  try {
    await deleteChunk(chunkId);
    message.success('删除成功');
    if (selectedChunkId.value === chunkId) {
      selectedChunkId.value = null;
    }
    await loadChunks();
  } catch {
    message.error('删除失败');
  }
}

// Question Logic
async function handleAddQuestion() {
  if (!selectedChunkId.value || !newQuestionContent.value.trim()) return;
  try {
    await addQuestion(selectedChunkId.value, newQuestionContent.value.trim());
    message.success('添加成功');
    newQuestionContent.value = '';
    await loadQuestions(selectedChunkId.value);
  } catch {
    message.error('添加失败');
  }
}

async function handleDeleteQuestion(questionId: string | number) {
  try {
    await deleteQuestion(questionId);
    message.success('删除成功');
    if (selectedChunkId.value) {
      await loadQuestions(selectedChunkId.value);
    }
  } catch {
    message.error('删除失败');
  }
}

async function handleGenerateQuestions() {
  if (!selectedChunkId.value) return;
  generatingQuestions.value = true;
  try {
    await generateQuestions(selectedChunkId.value);
    message.success('生成成功');
    await loadQuestions(selectedChunkId.value);
  } catch {
    message.error('生成失败');
  } finally {
    generatingQuestions.value = false;
  }
}

// Add Chunk
function openAddChunkModal() {
  newChunkTitle.value = '';
  newChunkContent.value = '';
  showAddChunkModal.value = true;
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
    showAddChunkModal.value = false;
    await loadChunks();
    // 选中新添加的分块（列表末尾）
    if (chunks.value.length > 0) {
      selectedChunkId.value = String(chunks.value[chunks.value.length - 1].id);
    }
  } catch {
    message.error('添加失败');
  } finally {
    addingChunk.value = false;
  }
}

function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    title="分块管理"
    class="h-600px w-900px"
    :mask-closable="false"
    @update:show="handleClose"
  >
    <div class="h-full flex gap-4 overflow-hidden">
      <!-- 左侧：分块列表 -->
      <div class="w-250px flex flex-col border-r border-gray-200">
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">分块列表</span>
          <NButton size="tiny" type="primary" ghost @click="openAddChunkModal">
            <template #icon>
              <icon-material-symbols-add />
            </template>
            添加
          </NButton>
        </div>

        <div v-if="loading" class="flex-center flex-1">
          <NSpin size="small" />
        </div>

        <NEmpty v-else-if="chunks.length === 0" description="暂无分块" class="mt-10" />

        <div v-else class="flex-1 overflow-auto">
          <div
            v-for="chunk in chunks"
            :key="String(chunk.id)"
            class="mb-1 cursor-pointer rounded p-2 transition-colors hover:bg-gray-100"
            :class="{
              'bg-primary/10 border border-primary': selectedChunkId === String(chunk.id),
              'border border-transparent': selectedChunkId !== String(chunk.id)
            }"
            @click="handleSelectChunk(String(chunk.id))"
          >
            <div class="truncate text-sm font-medium">
              {{ chunk.title || `分块 ${chunk.id}` }}
            </div>
            <div class="line-clamp-2 mt-1 text-xs text-gray-500">
              {{ chunk.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：分块详情 -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <NEmpty v-if="!selectedChunk" description="请选择一个分块" class="mt-20" />

        <div v-else class="flex flex-col flex-1 gap-4 overflow-auto">
          <!-- 分块标题 -->
          <NCard size="small" title="分块标题">
            <template #header-extra>
              <NSpace v-if="!editingTitle">
                <NButton size="tiny" text @click="startEditTitle">
                  <template #icon>
                    <icon-material-symbols-drive-file-rename-outline-outline />
                  </template>
                  编辑
                </NButton>
                <NPopconfirm @positive-click="handleDeleteChunk(String(selectedChunk.id))">
                  <template #trigger>
                    <NButton size="tiny" text type="error">
                      <template #icon>
                        <icon-material-symbols-delete-outline />
                      </template>
                      删除
                    </NButton>
                  </template>
                  确定删除此分块吗？
                </NPopconfirm>
              </NSpace>
              <NSpace v-else>
                <NButton size="tiny" @click="cancelEditTitle">取消</NButton>
                <NButton size="tiny" type="primary" @click="saveTitle">保存</NButton>
              </NSpace>
            </template>

            <NInput
              v-if="editingTitle"
              v-model:value="editTitleValue"
              placeholder="请输入标题"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEditTitle"
            />
            <div v-else class="text-base font-medium">
              {{ selectedChunk.title || `分块 ${selectedChunk.id}` }}
            </div>
          </NCard>

          <!-- 分块内容 -->
          <NCard size="small" title="分块内容">
            <template #header-extra>
              <NButton v-if="!editingContent" size="tiny" text @click="startEditContent">
                <template #icon>
                  <icon-material-symbols-drive-file-rename-outline-outline />
                </template>
                编辑
              </NButton>
              <NSpace v-else>
                <NButton size="tiny" @click="cancelEditContent">取消</NButton>
                <NButton size="tiny" type="primary" @click="saveContent">保存</NButton>
              </NSpace>
            </template>

            <NInput
              v-if="editingContent"
              v-model:value="editContentValue"
              type="textarea"
              :rows="8"
              placeholder="请输入内容"
            />
            <div v-else class="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">
              {{ selectedChunk.content }}
            </div>
          </NCard>

          <!-- 关联问题 -->
          <NCard size="small" title="关联问题" class="flex-1 overflow-hidden">
            <template #header-extra>
              <NButton
                size="small"
                type="primary"
                ghost
                :loading="generatingQuestions"
                @click="handleGenerateQuestions"
              >
                <template #icon>
                  <SvgIcon icon="mdi:magic-staff" />
                </template>
                AI 生成问题
              </NButton>
            </template>

            <div v-if="loadingQuestions" class="flex-center py-4">
              <NSpin size="small" />
            </div>

            <div v-else class="flex flex-col gap-2">
              <NList v-if="questions.length > 0" class="mb-2">
                <NListItem v-for="q in questions" :key="String(q.id)">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 text-sm">
                      <NTag v-if="q.sourceType === 'LLM'" size="small" type="success" class="mr-1 origin-left scale-75">
                        AI
                      </NTag>
                      {{ q.content }}
                    </div>
                    <NButton size="tiny" quaternary type="error" @click="handleDeleteQuestion(q.id)">
                      <SvgIcon icon="mdi:close" />
                    </NButton>
                  </div>
                </NListItem>
              </NList>

              <NEmpty v-else description="暂无关联问题" size="small" />

              <div class="flex gap-2">
                <NInput
                  v-model:value="newQuestionContent"
                  placeholder="输入问题..."
                  size="small"
                  @keyup.enter="handleAddQuestion"
                />
                <NButton size="small" type="primary" :disabled="!newQuestionContent.trim()" @click="handleAddQuestion">
                  添加
                </NButton>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    </div>

    <!-- 新建分块模态框 -->
    <NModal v-model:show="showAddChunkModal" preset="card" title="新建分块" class="w-600px">
      <NSpace vertical :size="16">
        <NInput v-model:value="newChunkTitle" placeholder="分块标题（可选）" />
        <NInput v-model:value="newChunkContent" type="textarea" :rows="8" placeholder="分块内容（必填）" />
      </NSpace>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showAddChunkModal = false">取消</NButton>
          <NButton type="primary" :loading="addingChunk" :disabled="!newChunkContent.trim()" @click="handleAddChunk">
            添加
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </NModal>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
