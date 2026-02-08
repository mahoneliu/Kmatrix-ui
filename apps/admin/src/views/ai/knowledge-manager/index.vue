<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDropdown,
  NEmpty,
  NGrid,
  NGridItem,
  NInput,
  NScrollbar,
  NSpace,
  NStatistic,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { deleteKnowledgeBase, fetchKnowledgeBaseList, fetchKnowledgeBaseStatistics } from '@/service/api/ai/knowledge';
import KnowledgeBaseModal from './modules/kb-modal.vue';
import RetrievalSandbox from './modules/retrieval-sandbox.vue';

const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const modalVisible = ref(false);
const editingKb = ref<Api.AI.KB.KnowledgeBase | null>(null);
const sandboxVisible = ref(false);

const searchParams = ref<Api.AI.KB.KnowledgeBaseSearchParams>({
  pageNo: 1,
  pageSize: 20,
  name: ''
});

const kbList = ref<Api.AI.KB.KnowledgeBase[]>([]);
const loading = ref(false);

// 统计信息
const statistics = ref<Api.AI.KB.Statistics>({
  totalKbs: 0,
  totalDatasets: 0,
  totalDocuments: 0,
  totalChunks: 0,
  processingDocs: 0,
  errorDocs: 0
});

async function loadStatistics() {
  try {
    const { data } = await fetchKnowledgeBaseStatistics();
    if (data) {
      statistics.value = data;
    }
  } catch {
    // ignore
  }
}

async function getData() {
  loading.value = true;
  try {
    const { data } = await fetchKnowledgeBaseList(searchParams.value);
    if (data && data.rows) {
      kbList.value = data.rows;
    }
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editingKb.value = null;
  modalVisible.value = true;
}

function handleEdit(item: Api.AI.KB.KnowledgeBase) {
  editingKb.value = item;
  modalVisible.value = true;
}

async function handleDelete(item: Api.AI.KB.KnowledgeBase) {
  if (!item.id) return;

  dialog.warning({
    title: '确认删除',
    content: `确定要删除知识库"${item.name}"吗？所有关联的数据集和文档都将被删除！`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteKnowledgeBase([item.id!]);
        message.success('删除成功');
        getData();
        loadStatistics();
      } catch {
        // error handled by interceptor
      }
    }
  });
}

function handleManage(item: Api.AI.KB.KnowledgeBase) {
  if (!item.id) return;
  router.push({
    name: 'ai_knowledge-detail',
    query: { kbId: item.id.toString() }
  });
}

function onModalClose(success: boolean) {
  modalVisible.value = false;
  if (success) {
    getData();
    loadStatistics();
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStatusColor(status?: string) {
  return status === 'ACTIVE' ? 'success' : 'warning';
}

onMounted(() => {
  getData();
  loadStatistics();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 统计面板 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NGrid :cols="6" responsive="screen" x-gap="16" y-gap="16">
        <NGridItem>
          <NStatistic label="知识库" :value="statistics.totalKbs">
            <template #prefix>
              <SvgIcon local-icon="mdi-book-open-page-variant" class="text-primary" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="数据集" :value="statistics.totalDatasets">
            <template #prefix>
              <SvgIcon local-icon="mdi-folder" class="text-info" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="文档" :value="statistics.totalDocuments">
            <template #prefix>
              <SvgIcon local-icon="mdi-file-document" class="text-success" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="切片" :value="statistics.totalChunks">
            <template #prefix>
              <SvgIcon local-icon="mdi-puzzle" class="text-warning" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="处理中" :value="statistics.processingDocs">
            <template #prefix>
              <SvgIcon local-icon="mdi-progress-clock" class="text-info" />
            </template>
          </NStatistic>
        </NGridItem>
        <NGridItem>
          <NStatistic label="失败" :value="statistics.errorDocs">
            <template #prefix>
              <SvgIcon local-icon="mdi-alert-circle" class="text-error" />
            </template>
          </NStatistic>
        </NGridItem>
      </NGrid>
    </NCard>

    <!-- 搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem title="搜索" name="search">
          <NSpace>
            <NInput v-model:value="searchParams.name" clearable placeholder="请输入知识库名称" @keyup.enter="getData" />
            <NButton type="primary" @click="getData">
              <template #icon>
                <SvgIcon local-icon="mdi-magnify" />
              </template>
              搜索
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 知识库列表 -->
    <NCard
      :bordered="false"
      size="small"
      title="知识库列表"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NSpace>
          <NButton type="info" ghost size="small" @click="sandboxVisible = true">
            <template #icon>
              <SvgIcon local-icon="mdi-flask" />
            </template>
            检索测试
          </NButton>
          <NButton type="primary" ghost size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon local-icon="mdi-plus" />
            </template>
            新建知识库
          </NButton>
        </NSpace>
      </template>

      <NScrollbar v-if="kbList.length > 0" class="h-full" content-class="p-4">
        <NGrid :cols="3" responsive="screen" x-gap="16" y-gap="16">
          <NGridItem v-for="item in kbList" :key="item.id">
            <NCard
              :bordered="false"
              class="group relative h-full cursor-pointer rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
              content-class="pb-2"
              hoverable
              @click="handleManage(item)"
            >
              <!-- 状态标签 -->
              <div class="absolute right-3 top-3 z-10">
                <NTag :bordered="false" :type="getStatusColor(item.status)" size="small">
                  {{ item.status === 'ACTIVE' ? '活跃' : '已归档' }}
                </NTag>
              </div>

              <template #header>
                <div class="flex items-center gap-3 pr-20">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                    <SvgIcon local-icon="mdi-book-open-page-variant" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-base font-bold">{{ item.name }}</div>
                    <!--
 <div class="text-xs text-gray-400">
                      {{ getPermissionLabel(item.permissionLevel) }}
                    </div> 
-->
                  </div>
                </div>
              </template>

              <div class="line-clamp-2 mb-4 min-h-10 text-sm text-gray-500">
                {{ item.description || '暂无描述' }}
              </div>

              <!-- 统计信息 -->
              <div class="flex items-center gap-4 text-xs text-gray-400">
                <div class="flex items-center gap-1">
                  <SvgIcon local-icon="mdi-folder-outline" />
                  <span>{{ item.datasetCount || 0 }} 数据集</span>
                </div>
                <div class="flex items-center gap-1">
                  <SvgIcon local-icon="mdi-file-document-outline" />
                  <span>{{ item.documentCount || 0 }} 文档</span>
                </div>
              </div>

              <!-- 时间 -->
              <div class="mt-2 text-xs text-gray-400">
                {{ formatDate(item.updateTime || item.createTime || '') }}
              </div>

              <!-- 操作菜单 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    { label: '管理', key: 'manage', icon: () => h(SvgIcon, { localIcon: 'mdi-cog' }) },
                    { label: '编辑', key: 'edit', icon: () => h(SvgIcon, { localIcon: 'mdi-pencil' }) },
                    { type: 'divider' },
                    {
                      label: '删除',
                      key: 'delete',
                      icon: () => h(SvgIcon, { localIcon: 'mdi-delete', class: 'text-error' }),
                      labelProps: { class: 'text-error' }
                    }
                  ]"
                  trigger="hover"
                  @select="
                    key => {
                      if (key === 'manage') handleManage(item);
                      else if (key === 'edit') handleEdit(item);
                      else if (key === 'delete') handleDelete(item);
                    }
                  "
                >
                  <NButton class="text-gray-500 hover:text-primary" quaternary size="small" @click.stop>
                    <template #icon>
                      <SvgIcon local-icon="mdi-dots-horizontal" />
                    </template>
                  </NButton>
                </NDropdown>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </NScrollbar>

      <NEmpty v-else description="暂无知识库，点击右上角新建" class="h-full flex-center" />
    </NCard>

    <KnowledgeBaseModal
      v-model:visible="modalVisible"
      :data="editingKb"
      @success="onModalClose(true)"
      @cancel="onModalClose(false)"
    />

    <RetrievalSandbox v-model:visible="sandboxVisible" />
  </div>
</template>

<style scoped></style>
