<script lang="ts" setup>
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NDropdown,
  NEmpty,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  NSwitch,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  addChunk,
  addQuestion,
  deleteChunk,
  deleteQuestion,
  disableChunk,
  enableChunk,
  fetchChunksByPage,
  fetchDocumentDetail,
  fetchQuestionsByChunkId,
  fetchQuestionsByDocumentId,
  generateQuestions,
  updateChunk
} from '@/service/api/ai/knowledge';

defineOptions({
  name: 'AiChunkManager'
});

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 从 query 参数获取 documentId
const documentId = computed(() => route.query.documentId as string | undefined);
const documentName = ref('');

const loading = ref(false);
const chunks = ref<Api.AI.KB.DocumentChunk[]>([]);

// 分页相关
const pageNum = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);
const loadingMore = ref(false);
const total = ref(0); // 总数

// 选中的分块
const selectedChunkId = ref<string | null>(null);
const selectedChunk = computed(() => {
  if (!selectedChunkId.value) return null;
  return chunks.value.find(c => String(c.id) === selectedChunkId.value) || null;
});

// Questions for selected chunk
const questions = ref<Api.AI.KB.Question[]>([]);
const loadingQuestions = ref(false);

// Edit Modal
const showEditModal = ref(false);
const editTitleValue = ref('');
const editContentValue = ref('');
const savingChunk = ref(false);
const isEditing = ref(false);

// Add Question in modal
const newQuestionContent = ref<string | null>(null);
const generatingQuestions = ref(false);
const documentQuestions = ref<Api.AI.KB.Question[]>([]);
const documentQuestionOptions = computed(() => {
  return documentQuestions.value.map(q => ({
    label: q.content,
    value: q.content
  }));
});

// Add Chunk
const showAddChunkModal = ref(false);
const newChunkTitle = ref('');
const newChunkContent = ref('');
const addingChunk = ref(false);

onMounted(async () => {
  if (documentId.value) {
    // 加载文档信息
    try {
      const { data } = await fetchDocumentDetail(documentId.value);
      documentName.value = data?.originalFilename || '';
    } catch {
      // ignore
    }
    await loadChunks();
  }
});

watch(documentId, async val => {
  if (val) {
    // 重置分页状态
    pageNum.value = 1;
    hasMore.value = true;
    chunks.value = [];
    await loadChunks();
  } else {
    chunks.value = [];
    selectedChunkId.value = null;
    questions.value = [];
  }
});

watch(selectedChunkId, val => {
  if (val) {
    loadQuestions(val);
  } else {
    questions.value = [];
  }
});

async function loadChunks() {
  if (!documentId.value || loading.value) return;
  loading.value = true;
  try {
    const { data } = await fetchChunksByPage({
      documentId: documentId.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });

    if (data) {
      chunks.value = data.rows || [];
      total.value = data.total || 0;
      const totalPages = Math.ceil(data.total / pageSize.value);
      hasMore.value = pageNum.value < totalPages;
    }

    // 自动选中第一个分块
    if (chunks.value.length > 0 && !selectedChunkId.value) {
      selectedChunkId.value = String(chunks.value[0].id);
    }
  } finally {
    loading.value = false;
  }
}

async function loadMoreChunks() {
  if (!documentId.value || loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  try {
    pageNum.value += 1;
    const { data } = await fetchChunksByPage({
      documentId: documentId.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });

    if (data && data.rows) {
      chunks.value.push(...data.rows);
      const totalPages = Math.ceil(data.total / pageSize.value);
      hasMore.value = pageNum.value < totalPages;
    }
  } finally {
    loadingMore.value = false;
  }
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  // 距离底部 50px 时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadMoreChunks();
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

async function loadDocumentQuestions() {
  if (!documentId.value) return;
  const { data } = await fetchQuestionsByDocumentId(documentId.value);
  documentQuestions.value = data || [];
}

function handleSelectChunk(chunkId: string) {
  selectedChunkId.value = chunkId;
}

// Open Edit Modal
function openEditModal() {
  if (!selectedChunk.value) return;
  editTitleValue.value = selectedChunk.value.title || '';
  editContentValue.value = selectedChunk.value.content || '';
  isEditing.value = false;
  showEditModal.value = true;
  loadDocumentQuestions();
}

function startEditing() {
  if (!selectedChunk.value) return;
  editTitleValue.value = selectedChunk.value.title || '';
  editContentValue.value = selectedChunk.value.content || '';
  isEditing.value = true;
}

// Save Chunk (Title + Content)
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
    await loadChunks();
  } catch {
    message.error('保存失败');
  } finally {
    savingChunk.value = false;
  }
}

// Toggle Chunk Enable/Disable
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
    await loadChunks();
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
    await loadChunks();
  } catch {
    message.error('删除失败');
  }
}

// Question Logic
async function handleAddQuestion(val: string) {
  // val is passed from @update:value
  const content = val || newQuestionContent.value;
  if (!selectedChunkId.value || !content?.trim()) return;
  try {
    await addQuestion(selectedChunkId.value, content.trim());
    message.success('添加成功');
    newQuestionContent.value = null;
    await loadQuestions(selectedChunkId.value);
    // Refresh document questions as we added a new one
    await loadDocumentQuestions();
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
  if (!documentId.value || !newChunkContent.value.trim()) return;
  addingChunk.value = true;
  try {
    await addChunk({
      documentId: documentId.value,
      title: newChunkTitle.value.trim() || undefined,
      content: newChunkContent.value.trim()
    });
    message.success('添加成功');
    showAddChunkModal.value = false;

    // 重新加载第一页
    pageNum.value = 1;
    hasMore.value = true;
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

function goBack() {
  router.back();
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 页面头部 -->
    <NCard size="small" class="mb-4">
      <div class="flex items-center gap-4">
        <NButton text @click="goBack">
          <template #icon>
            <SvgIcon icon="mdi:arrow-left" />
          </template>
        </NButton>
        <div>
          <!-- <div class="text-lg font-medium">分块管理</div> -->
          <div v-if="documentName" class="text-sm text-gray-500">{{ documentName }}</div>
        </div>
      </div>
    </NCard>

    <!-- 主体内容 -->
    <NCard class="flex-1 overflow-hidden">
      <div class="h-full flex gap-4 overflow-hidden">
        <!-- 左侧:分块列表 -->
        <div class="w-480px flex flex-col border-r border-gray-200 pr-4">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium">分块 ({{ total }})</span>
            <NButton size="small" type="primary" ghost @click="openAddChunkModal">
              <template #icon>
                <icon-material-symbols-add />
              </template>
            </NButton>
          </div>

          <div v-if="loading" class="h-600px flex-center">
            <NSpin size="small" />
          </div>

          <NEmpty v-else-if="chunks.length === 0" description="暂无分块" class="mt-10" />

          <div v-else class="chunk-list-container" @scroll="handleScroll">
            <div
              v-for="(chunk, index) in chunks"
              :key="String(chunk.id)"
              class="mb-0 cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
              :class="{
                'bg-primary/10 border-1 border-primary': selectedChunkId === String(chunk.id),
                'border-1 border-transparent': selectedChunkId !== String(chunk.id)
              }"
              @click="handleSelectChunk(String(chunk.id))"
            >
              <div class="mb-1 flex items-center gap-2">
                <NTag size="small" :bordered="false">{{ index + 1 }}</NTag>
                <span class="flex-1 truncate text-sm font-medium">
                  {{ chunk.title || `分块 ${index + 1}` }}
                </span>
              </div>
              <div class="line-clamp-2 text-xs text-gray-400">
                {{ chunk.content }}
              </div>
            </div>

            <!-- 加载更多提示 -->
            <div v-if="loadingMore" class="py-3 text-center text-sm text-gray-400">
              <NSpin size="small" />
              <span class="ml-2">加载中...</span>
            </div>
            <div v-else-if="!hasMore && chunks.length > 0" class="py-3 text-center text-sm text-gray-400">
              已加载全部分块
            </div>
          </div>
        </div>

        <!-- 右侧:分块详情 -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <NEmpty v-if="!selectedChunk" description="请选择一个分块" class="mt-20" />

          <div v-else class="flex flex-col flex-1 overflow-auto pr-2">
            <!-- 分块详情卡片 -->
            <NCard
              size="small"
              class="chunk-detail-card cursor-pointer transition-shadow hover:shadow-md"
              @click="openEditModal"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-base font-medium">
                    {{ selectedChunk.title || `分块 ${chunks.indexOf(selectedChunk) + 1}` }}
                  </span>

                  <!-- 悬浮操作栏 -->
                  <div class="flex items-center gap-2" @click.stop>
                    <!-- 启用/禁用开关 -->
                    <NSwitch
                      :value="selectedChunk.enabled === 1"
                      size="small"
                      @update:value="handleToggleChunkStatus"
                    />

                    <!-- 编辑按钮 -->
                    <NButton size="small" text @click="openEditModal">
                      <template #icon>
                        <icon-material-symbols-drive-file-rename-outline-outline />
                      </template>
                    </NButton>

                    <!-- 更多菜单 -->
                    <NDropdown
                      :options="[
                        {
                          label: 'AI 生成问题',
                          key: 'generate',
                          icon: () => h(SvgIcon, { icon: 'mdi:magic-staff' })
                        },
                        {
                          label: '删除分块',
                          key: 'delete',
                          icon: () => h(SvgIcon, { icon: 'mdi:delete-outline' })
                        }
                      ]"
                      @select="
                        key => {
                          if (key === 'generate') handleGenerateQuestions();
                          else if (key === 'delete' && selectedChunk) handleDeleteChunk(String(selectedChunk.id));
                        }
                      "
                    >
                      <NButton size="small" text>
                        <template #icon>
                          <icon-material-symbols-more-vert />
                        </template>
                      </NButton>
                    </NDropdown>
                  </div>
                </div>
              </template>

              <!-- 分块内容 -->
              <div class="max-h-400px overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-4 text-sm">
                {{ selectedChunk.content }}
              </div>
            </NCard>
          </div>
        </div>
      </div>
    </NCard>

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

    <!-- 编辑分块弹窗 -->
    <NModal
      v-model:show="showEditModal"
      preset="card"
      :title="isEditing ? '编辑分块' : '分块详情'"
      class="w-1200px"
      :closable="true"
    >
      <div class="h-800px flex flex-col">
        <!-- Divider (Top) -->
        <div class="mb-4 h-px flex-shrink-0 bg-gray-200" />

        <!-- Bottom Section: Split View -->
        <div class="min-h-0 flex flex-1 gap-6 overflow-hidden">
          <!-- Left: Title + Content -->
          <div class="flex flex-col flex-1 overflow-hidden">
            <!-- Title Section -->
            <div class="mb-4 flex-shrink-0">
              <template v-if="!isEditing">
                <div class="mb-2 text-sm text-gray-600 font-medium">分块标题</div>
                <div class="select-text px-1 text-base text-gray-800 font-bold">
                  {{ selectedChunk?.title || '无标题' }}
                </div>
              </template>
              <template v-else>
                <div class="mb-2 text-sm text-gray-600 font-medium">分块标题</div>
                <NInput v-model:value="editTitleValue" placeholder="请输入标题" :maxlength="256" show-count />
              </template>
            </div>

            <!-- Content Section -->
            <div class="min-h-0 flex flex-col flex-1">
              <div class="mb-2 text-sm text-gray-600 font-medium">分块内容</div>

              <template v-if="!isEditing">
                <div
                  class="flex-1 select-text overflow-auto whitespace-pre-wrap border border-gray-100 rounded bg-gray-50 p-4 text-sm leading-relaxed"
                >
                  {{ selectedChunk?.content }}
                </div>
              </template>
              <template v-else>
                <NInput
                  v-model:value="editContentValue"
                  type="textarea"
                  placeholder="请输入分块内容"
                  :maxlength="1000"
                  show-count
                  class="flex-1"
                  :input-props="{ style: 'height: 100%' }"
                />
              </template>
            </div>
          </div>

          <!-- Right: Questions -->
          <div class="w-400px flex flex-col border-l border-gray-100 pl-6">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-medium">关联问题</span>
            </div>

            <!-- Add Question Input -->
            <div class="mb-4">
              <NSelect
                v-model:value="newQuestionContent"
                filterable
                tag
                clearable
                placeholder="新增：输入->回车，或者选择已有问题"
                :options="documentQuestionOptions"
                @update:value="handleAddQuestion"
              />
            </div>

            <div v-if="loadingQuestions" class="flex-center py-8">
              <NSpin size="small" />
            </div>

            <div v-else class="flex flex-col flex-1 gap-3 overflow-auto">
              <!-- Question List -->
              <div v-if="questions.length > 0" class="flex flex-col gap-2">
                <div
                  v-for="q in questions"
                  :key="String(q.id)"
                  class="group flex items-start gap-2 rounded bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                >
                  <div class="flex-1 text-sm">
                    {{ q.content }}
                  </div>
                  <NButton
                    size="tiny"
                    text
                    type="error"
                    class="opacity-0 transition-opacity group-hover:opacity-100"
                    @click="handleDeleteQuestion(q.id)"
                  >
                    <template #icon>
                      <icon-material-symbols-close />
                    </template>
                  </NButton>
                </div>
              </div>

              <NEmpty v-else description="暂无关联问题" size="small" class="mt-8" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="center">
          <template v-if="!isEditing">
            <NButton @click="showEditModal = false">关闭</NButton>
            <NButton type="primary" @click="startEditing">编辑</NButton>
          </template>
          <template v-else>
            <NButton @click="isEditing = false">取消</NButton>
            <NButton type="primary" :loading="savingChunk" @click="handleSaveChunk">保存</NButton>
          </template>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.h-600px {
  height: 600px;
}

.chunk-list-container {
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}
</style>
