<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
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

// Questions map: chunkId -> Question[]
const questionsMap = ref<Record<string, Api.AI.KB.Question[]>>({});
const loadingQuestions = ref<Record<string, boolean>>({});
const expandingChunkId = ref<string | null>(null);

// Edit Chunk
const editingChunk = ref<Api.AI.KB.DocumentChunk | null>(null);
const editContent = ref('');
const editModalVisible = ref(false);

// Add Question
const newQuestionContent = ref('');
// const addingQuestionChunkId = ref<string | null>(null); // Unused

watch(
  () => props.visible,
  val => {
    if (val && props.documentId) {
      loadChunks();
    } else {
      chunks.value = [];
      questionsMap.value = {};
    }
  }
);

async function loadChunks() {
  if (!props.documentId) return;
  loading.value = true;
  try {
    const { data } = await fetchChunksByDocumentId(props.documentId);
    chunks.value = data || [];
  } finally {
    loading.value = false;
  }
}

async function loadQuestions(chunkId: any) {
  if (!chunkId) return;
  const idStr = String(chunkId);
  loadingQuestions.value[idStr] = true;
  try {
    const { data } = await fetchQuestionsByChunkId(chunkId);
    questionsMap.value[idStr] = data || [];
  } finally {
    loadingQuestions.value[idStr] = false;
  }
}

// Handle Expand Chunk to see questions
function handleAccordionChange(val: string | null) {
  expandingChunkId.value = val;
  if (val) {
    loadQuestions(val);
  }
}

// Edit Chunk Logic
function handleEditChunk(chunk: Api.AI.KB.DocumentChunk) {
  editingChunk.value = chunk;
  editContent.value = chunk.content;
  editModalVisible.value = true;
}

async function submitChunkEdit() {
  if (!editingChunk.value || !editContent.value) return;
  try {
    await updateChunk({ id: editingChunk.value.id, content: editContent.value });
    message.success('更新成功');
    editModalVisible.value = false;
    loadChunks();
  } catch {
    message.error('更新失败');
  }
}

async function handleDeleteChunk(chunkId: any) {
  try {
    await deleteChunk(chunkId);
    message.success('删除成功');
    loadChunks();
  } catch {
    message.error('删除失败');
  }
}

// Question Logic
async function handleAddQuestion(chunkId: any) {
  if (!newQuestionContent.value.trim()) return;
  try {
    await addQuestion(chunkId, newQuestionContent.value);
    message.success('添加成功');
    newQuestionContent.value = '';
    loadQuestions(chunkId);
  } catch {
    message.error('添加失败');
  }
}

async function handleDeleteQuestion(q: Api.AI.KB.Question, chunkId: any) {
  try {
    await deleteQuestion(q.id);
    message.success('删除成功');
    loadQuestions(chunkId);
  } catch {
    message.error('删除失败');
  }
}

const generatingMap = ref<Record<string, boolean>>({});

async function handleGenerateQuestions(chunkId: any) {
  const idStr = String(chunkId);
  generatingMap.value[idStr] = true;
  try {
    await generateQuestions(chunkId); // Use default model
    message.success('生成成功');
    loadQuestions(chunkId);
  } catch {
    message.error('生成失败');
  } finally {
    generatingMap.value[idStr] = false;
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
    title="切片管理"
    class="h-600px w-800px flex flex-col"
    :mask-closable="false"
    @update:show="handleClose"
  >
    <div class="flex flex-col flex-1 overflow-hidden">
      <div v-if="loading" class="h-full flex-center">
        <NSpin size="large" />
      </div>
      <div v-else class="flex-1 overflow-auto p-2">
        <NEmpty v-if="chunks.length === 0" description="暂无切片数据" class="mt-10" />

        <NCollapse accordion :on-update:value="handleAccordionChange">
          <NCollapseItem
            v-for="chunk in chunks"
            :key="String(chunk.id)"
            :title="chunk.title || `切片 ${chunk.id}`"
            :name="String(chunk.id)"
          >
            <template #header-extra>
              <NSpace>
                <NButton size="tiny" secondary type="primary" @click.stop="handleEditChunk(chunk)">编辑</NButton>
                <NPopconfirm @positive-click="handleDeleteChunk(chunk.id)">
                  <template #trigger>
                    <NButton size="tiny" secondary type="error" @click.stop>删除</NButton>
                  </template>
                  确定删除此切片吗？
                </NPopconfirm>
              </NSpace>
            </template>

            <div class="mb-4 whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-700">
              {{ chunk.content }}
            </div>

            <!-- Questions Section -->
            <NCard size="small" title="关联问题" class="bg-gray-50/50">
              <template #header-extra>
                <NButton
                  size="small"
                  type="primary"
                  ghost
                  :loading="generatingMap[String(chunk.id)]"
                  @click="handleGenerateQuestions(chunk.id)"
                >
                  <template #icon><SvgIcon icon="mdi:magic-staff" /></template>
                  AI 生成问题
                </NButton>
              </template>

              <div v-if="loadingQuestions[String(chunk.id)]" class="flex justify-center py-2">
                <NSpin size="small" />
              </div>
              <div v-else>
                <NList class="mb-2">
                  <NListItem v-for="q in questionsMap[String(chunk.id)] || []" :key="String(q.id)">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 text-sm">
                        <NTag
                          v-if="q.sourceType === 'LLM'"
                          size="small"
                          type="success"
                          class="mr-1 origin-left scale-75"
                        >
                          AI
                        </NTag>
                        {{ q.content }}
                      </div>
                      <NButton size="tiny" quaternary type="error" @click="handleDeleteQuestion(q, chunk.id)">
                        <SvgIcon icon="mdi:close" />
                      </NButton>
                    </div>
                  </NListItem>
                </NList>

                <div class="flex gap-2">
                  <NInput
                    v-model:value="newQuestionContent"
                    placeholder="输入问题..."
                    size="small"
                    @keyup.enter="handleAddQuestion(chunk.id)"
                  />
                  <NButton
                    size="small"
                    type="primary"
                    :disabled="!newQuestionContent"
                    @click="handleAddQuestion(chunk.id)"
                  >
                    添加
                  </NButton>
                </div>
              </div>
            </NCard>
          </NCollapseItem>
        </NCollapse>
      </div>
    </div>

    <!-- Edit Chunk Modal -->
    <NModal v-model:show="editModalVisible" preset="card" title="编辑切片内容" class="w-600px">
      <NInput v-model:value="editContent" type="textarea" :rows="10" placeholder="请输入内容" />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="editModalVisible = false">取消</NButton>
          <NButton type="primary" @click="submitChunkEdit">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </NModal>
</template>

<style scoped>
:deep(.n-collapse-item__header) {
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
