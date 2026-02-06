<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { NButton, NCard, NCheckbox, NDropdown, NInput, NList, NListItem, NModal, NSpace, NSpin, NTag } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  fetchChunksByDocumentId,
  fetchDocumentsByKbId,
  fetchQuestionLinkedChunks,
  linkQuestion,
  unlinkQuestionFromChunk
} from '@/service/api/ai/knowledge';

defineOptions({
  name: 'ChunkLinkModal'
});

interface Props {
  visible?: boolean;
  questionId?: CommonType.IdType | null;
  kbId?: CommonType.IdType;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  questionId: null,
  kbId: undefined
});

const emit = defineEmits<Emits>();

// 文档
const documents = ref<Api.AI.KB.Document[]>([]);
const selectedDocumentId = ref<CommonType.IdType | null>(null);
const loadingDocuments = ref(false);
const documentSearchKeyword = ref('');

// 分段
const chunks = ref<Api.AI.KB.DocumentChunk[]>([]);
const linkedChunkIds = ref<Set<CommonType.IdType>>(new Set());
const linkedChunks = ref<Api.AI.KB.DocumentChunk[]>([]); // 保存已关联的完整分片对象
const loadingChunks = ref(false);
const chunkSearchKeyword = ref('');

// 滚动加载分页
const displayPageSize = ref(20); // 每次显示的数量
const displayedCount = ref(20); // 当前显示的分片数量
const loadingMore = ref(false);

// 显示层级
const displayLevel = ref<'concise' | 'medium' | 'detailed'>('medium');

// 筛选后的文档列表
const filteredDocuments = computed(() => {
  if (!documentSearchKeyword.value) return documents.value;
  const keyword = documentSearchKeyword.value.toLowerCase();
  return documents.value.filter(doc => doc.originalFilename?.toLowerCase().includes(keyword));
});

// 显示层级选项
const displayLevelOptions = computed(() => {
  return [
    { label: '精简', key: 'concise' },
    { label: '中等', key: 'medium' },
    { label: '详细', key: 'detailed' }
  ].map(item => ({
    ...item,
    icon: displayLevel.value === item.key ? () => h(SvgIcon, { icon: 'mdi:check', class: 'text-primary' }) : undefined
  }));
});

// 排序后的分段列表（已关联的排在前面）
const sortedChunks = computed(() => {
  const linked: Api.AI.KB.DocumentChunk[] = [];
  const unlinked: Api.AI.KB.DocumentChunk[] = [];

  chunks.value.forEach(chunk => {
    if (linkedChunkIds.value.has(chunk.id!)) {
      linked.push(chunk);
    } else {
      unlinked.push(chunk);
    }
  });

  return [...linked, ...unlinked];
});

// 筛选后的分段列表（支持分页显示）
const filteredChunks = computed(() => {
  // 首先按选中的文档过滤
  let result = sortedChunks.value.filter(chunk => chunk.documentId === selectedDocumentId.value);

  // 然后按搜索关键词过滤
  if (chunkSearchKeyword.value) {
    const keyword = chunkSearchKeyword.value.toLowerCase();
    result = result.filter(
      chunk => chunk.title?.toLowerCase().includes(keyword) || chunk.content?.toLowerCase().includes(keyword)
    );
  }

  // 限制显示数量（实现分页）
  return result.slice(0, displayedCount.value);
});

// 计算每个文档的关联数量（基于已关联分片列表，无需加载所有分片）
const documentLinkCounts = computed(() => {
  const counts = new Map<CommonType.IdType, number>();

  linkedChunks.value.forEach(chunk => {
    if (chunk.documentId) {
      const count = counts.get(chunk.documentId) || 0;
      counts.set(chunk.documentId, count + 1);
    }
  });

  return counts;
});

// 加载文档列表(直接根据知识库ID获取)
async function loadDocuments() {
  if (!props.kbId) return;

  loadingDocuments.value = true;
  try {
    // 直接根据知识库ID获取所有文档
    const { data } = await fetchDocumentsByKbId(props.kbId);
    documents.value = data || [];

    // 默认选中第一个文档并加载其分片
    if (documents.value.length > 0 && !selectedDocumentId.value) {
      selectedDocumentId.value = documents.value[0].id!;
      await loadChunks(selectedDocumentId.value);
    }
  } catch {
    window.$message?.error('加载文档列表失败');
  } finally {
    loadingDocuments.value = false;
  }
}

// 加载已关联的分段（保存完整对象用于角标统计）
async function loadLinkedChunks() {
  if (!props.questionId) return;

  try {
    const { data } = await fetchQuestionLinkedChunks(props.questionId);
    if (data) {
      linkedChunks.value = data;
      linkedChunkIds.value = new Set(data.map(chunk => chunk.id!));
    }
  } catch {
    window.$message?.error('加载已关联分段失败');
  }
}

// 加载分段列表（按需加载）
async function loadChunks(documentId: CommonType.IdType) {
  loadingChunks.value = true;
  displayedCount.value = displayPageSize.value; // 重置显示数量
  try {
    const { data } = await fetchChunksByDocumentId(documentId);
    // 只更新当前文档的分段,保留其他文档的分段
    const otherChunks = chunks.value.filter(c => c.documentId !== documentId);
    chunks.value = [...otherChunks, ...(data || [])];
  } catch {
    window.$message?.error('加载分段列表失败');
  } finally {
    loadingChunks.value = false;
  }
}

// 选择文档（按需加载分片）
function handleSelectDocument(documentId: CommonType.IdType) {
  selectedDocumentId.value = documentId;
  // 检查是否已加载过该文档的分片
  const hasLoaded = chunks.value.some(c => c.documentId === documentId);
  if (!hasLoaded) {
    loadChunks(documentId);
  } else {
    // 如果已加载，重置显示数量
    displayedCount.value = displayPageSize.value;
  }
}

// 切换分段选中状态（立即关联/取消关联）
async function toggleChunkSelection(chunkId: CommonType.IdType) {
  if (!props.questionId) return;

  const isLinked = linkedChunkIds.value.has(chunkId);
  const chunk = chunks.value.find(c => c.id === chunkId);

  try {
    if (isLinked) {
      // 取消关联
      await unlinkQuestionFromChunk(props.questionId, chunkId);
      linkedChunkIds.value.delete(chunkId);

      // 更新已关联分片列表（用于更新角标）
      linkedChunks.value = linkedChunks.value.filter(c => c.id !== chunkId);

      window.$message?.success('已取消关联');
    } else {
      // 关联
      await linkQuestion(chunkId, props.questionId);
      linkedChunkIds.value.add(chunkId);

      // 更新已关联分片列表（用于更新角标）
      if (chunk) {
        linkedChunks.value.push(chunk);
      }

      window.$message?.success('关联成功');
    }

    // 触发响应式更新
    linkedChunkIds.value = new Set(linkedChunkIds.value);

    // 通知父组件刷新
    emit('success');
  } catch {
    window.$message?.error(isLinked ? '取消关联失败' : '关联失败');
  }
}

// 关闭弹窗
function handleClose() {
  emit('update:visible', false);
}

// 滚动加载更多
function handleScroll(e: Event) {
  if (loadingMore.value || !selectedDocumentId.value) return;

  const target = e.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  // 距离底部 100px 时触发加载
  if (scrollHeight - scrollTop - clientHeight < 100) {
    const currentDocChunks = sortedChunks.value.filter(c => c.documentId === selectedDocumentId.value);
    if (displayedCount.value < currentDocChunks.length) {
      loadingMore.value = true;
      setTimeout(() => {
        displayedCount.value += displayPageSize.value;
        loadingMore.value = false;
      }, 300);
    }
  }
}

// 重置状态
function resetState() {
  selectedDocumentId.value = null;
  chunks.value = [];
  linkedChunkIds.value = new Set();
  linkedChunks.value = [];
  documentSearchKeyword.value = '';
  chunkSearchKeyword.value = '';
  displayedCount.value = displayPageSize.value;
}

// 监听弹窗显示状态
watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetState();
      loadLinkedChunks().then(() => {
        loadDocuments();
      });
    }
  }
);
</script>

<template>
  <NModal :show="visible" preset="card" title="关联分段" class="w-1000px" @update:show="handleClose">
    <!-- 标题下方的分割线 -->
    <div class="mb-16px border-b border-gray-200 -mt-16px"></div>

    <div class="h-600px flex gap-16px">
      <!-- 左侧文档列表 -->
      <div class="w-280px flex flex-col gap-12px border-r border-gray-200 pr-16px">
        <NCard title="选择文档" :bordered="false" size="small">
          <template #header-extra>
            <NTag size="small" :bordered="false">{{ documents.length }} 个</NTag>
          </template>

          <NInput v-model:value="documentSearchKeyword" placeholder="搜索文档..." clearable class="mb-12px">
            <template #prefix>
              <SvgIcon icon="mdi:magnify" />
            </template>
          </NInput>

          <div v-if="loadingDocuments" class="py-32px text-center text-gray-400">加载中...</div>
          <div v-else-if="filteredDocuments.length === 0" class="py-32px text-center text-gray-400">暂无文档</div>
          <NList v-else hoverable clickable class="max-h-450px overflow-y-auto">
            <NListItem
              v-for="doc in filteredDocuments"
              :key="doc.id"
              :class="{ 'bg-primary/10': selectedDocumentId === doc.id }"
              @click="handleSelectDocument(doc.id!)"
            >
              <div class="flex items-center justify-between gap-8px">
                <div class="flex-1 truncate text-14px">{{ doc.originalFilename }}</div>
                <NTag
                  v-if="documentLinkCounts.get(doc.id!) || 0 > 0"
                  size="small"
                  type="primary"
                  round
                  :bordered="false"
                >
                  {{ documentLinkCounts.get(doc.id!) }}
                </NTag>
              </div>
            </NListItem>
          </NList>
        </NCard>
      </div>

      <!-- 右侧分段列表 -->
      <div class="flex flex-col flex-1 gap-12px pl-16px">
        <NCard title="选择分段" :bordered="false" size="small">
          <template #header-extra>
            <NSpace :size="8">
              <NTag size="small" :bordered="false">已关联 {{ linkedChunkIds.size }} 个</NTag>
              <NTag size="small" type="info" :bordered="false">
                共 {{ chunks.filter(c => c.documentId === selectedDocumentId).length }} 个
              </NTag>
              <NDropdown
                :options="displayLevelOptions"
                @select="
                  (key: 'concise' | 'medium' | 'detailed') => {
                    displayLevel = key;
                  }
                "
              >
                <NButton size="tiny" class="mt-1px">
                  显示
                  <template #icon>
                    <SvgIcon icon="mdi:chevron-down" />
                  </template>
                </NButton>
              </NDropdown>
            </NSpace>
          </template>

          <NInput v-model:value="chunkSearchKeyword" placeholder="搜索分段标题或内容..." clearable class="mb-12px">
            <template #prefix>
              <SvgIcon icon="mdi:magnify" />
            </template>
          </NInput>

          <div v-if="!selectedDocumentId" class="py-64px text-center text-gray-400">请先选择左侧文档</div>
          <div v-else-if="loadingChunks" class="py-32px text-center text-gray-400">加载中...</div>
          <div v-else-if="filteredChunks.length === 0" class="py-32px text-center text-gray-400">暂无分段</div>
          <div v-else class="max-h-450px flex-col-stretch gap-12px overflow-y-auto" @scroll="handleScroll">
            <NCard
              v-for="chunk in filteredChunks"
              :key="chunk.id"
              size="small"
              :bordered="true"
              hoverable
              class="cursor-pointer transition-all"
              :class="{
                'border-primary': linkedChunkIds.has(chunk.id!),
                'bg-primary/5': linkedChunkIds.has(chunk.id!)
              }"
              @click="toggleChunkSelection(chunk.id!)"
            >
              <template #header>
                <div class="flex items-center justify-between gap-8px">
                  <div class="flex flex-1 items-center gap-8px">
                    <NCheckbox :checked="linkedChunkIds.has(chunk.id!)" />
                    <span class="text-14px font-semibold">{{ chunk.title || '无标题' }}</span>
                  </div>
                  <NTag v-if="linkedChunkIds.has(chunk.id!)" size="small" type="success" :bordered="false">已关联</NTag>
                </div>
              </template>

              <div
                v-if="displayLevel !== 'concise'"
                class="text-12px text-gray-600"
                :class="{ 'line-clamp-3': displayLevel === 'medium' }"
              >
                {{ chunk.content }}
              </div>
            </NCard>

            <!-- 加载更多提示 -->
            <div v-if="loadingMore" class="py-3 text-center text-sm text-gray-400">
              <NSpin size="small" />
              <span class="ml-2">加载中...</span>
            </div>
            <div
              v-else-if="
                selectedDocumentId &&
                displayedCount < sortedChunks.filter(c => c.documentId === selectedDocumentId).length
              "
              class="py-3 text-center text-sm text-gray-400"
            >
              向下滚动加载更多
            </div>
            <div
              v-else-if="selectedDocumentId && filteredChunks.length > 0"
              class="py-3 text-center text-sm text-gray-400"
            >
              已加载全部分片
            </div>
          </div>
        </NCard>
      </div>
    </div>
  </NModal>
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
