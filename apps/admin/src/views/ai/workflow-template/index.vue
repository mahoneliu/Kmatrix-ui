<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDropdown,
  NGrid,
  NGridItem,
  NInput,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  type TemplateCategory,
  type WorkflowTemplate,
  createAppFromTemplate,
  deleteTemplate,
  fetchTemplateCategories,
  fetchTemplateList
} from '@/service/api/ai/admin/workflow-template';

const router = useRouter();
const message = useMessage();

// 分类选项
const categoryOptions = ref<TemplateCategory[]>([]);

// 搜索参数
const searchParams = ref({
  pageNum: 1,
  pageSize: 20,
  templateName: '',
  category: undefined as string | undefined,
  scopeType: undefined as '0' | '1' | undefined
});

const templateList = ref<WorkflowTemplate[]>([]);
const loading = ref(false);

// 创建应用弹窗
const showCreateModal = ref(false);
const createAppName = ref('');
const selectedTemplateId = ref<number | null>(null);

async function loadCategories() {
  try {
    const res = await fetchTemplateCategories();
    if (res.data) {
      categoryOptions.value = res.data;
    }
  } catch {
    message.error('加载分类失败');
  }
}

async function getData() {
  loading.value = true;
  try {
    const res = await fetchTemplateList(searchParams.value);
    if (res.data?.rows) {
      templateList.value = res.data.rows;
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  searchParams.value.pageNum = 1;
  getData();
}

function handleReset() {
  searchParams.value = {
    pageNum: 1,
    pageSize: 20,
    templateName: '',
    category: undefined,
    scopeType: undefined
  };
  getData();
}

// 显示创建应用弹窗
function showCreateAppModal(item: WorkflowTemplate) {
  selectedTemplateId.value = item.templateId;
  createAppName.value = `基于${item.templateName}`;
  showCreateModal.value = true;
}

// 通过模板创建应用
async function handleCreateApp() {
  if (!selectedTemplateId.value || !createAppName.value.trim()) {
    message.warning('请输入应用名称');
    return;
  }
  try {
    const res = await createAppFromTemplate(selectedTemplateId.value, createAppName.value.trim());
    if (res.data) {
      message.success('创建成功');
      showCreateModal.value = false;
      // 跳转到应用编辑页
      router.push({
        name: 'ai_app-detail',
        query: { appId: res.data.toString() }
      });
    }
  } catch (e: any) {
    message.error(e.message || '创建失败');
  }
}

// 删除模板
async function handleDelete(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning('系统模板不允许删除');
    return;
  }
  try {
    await deleteTemplate([item.templateId]);
    message.success('删除成功');
    getData();
  } catch (e: any) {
    message.error(e.message || '删除失败');
  }
}

// 编辑模板
function handleEdit(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning('系统模板不允许编辑');
    return;
  }
  // eslint-disable-next-line no-warning-comments
  // TODO: 跳转到模板编辑页
  message.info('功能开发中');
}

// 获取分类标签
function getCategoryLabel(category: string | undefined) {
  if (!category) return '未分类';
  const found = categoryOptions.value.find(c => c.value === category);
  return found ? found.label : category;
}

// 格式化日期
function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

onMounted(() => {
  loadCategories();
  getData();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem title="搜索" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.templateName"
              placeholder="模板名称"
              clearable
              class="w-[200px]"
              @keyup.enter="handleSearch"
            />
            <NSelect
              v-model:value="searchParams.category"
              :options="categoryOptions"
              placeholder="分类"
              clearable
              class="w-[150px]"
            />
            <NSelect
              v-model:value="searchParams.scopeType"
              :options="[
                { label: '系统模板', value: '0' },
                { label: '用户模板', value: '1' }
              ]"
              placeholder="类型"
              clearable
              class="w-[120px]"
            />
            <NButton type="primary" @click="handleSearch">搜索</NButton>
            <NButton @click="handleReset">重置</NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 模板列表 -->
    <NCard
      :bordered="false"
      size="small"
      title="工作流模板"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NButton type="primary" ghost size="small" @click="message.info('功能开发中')">
          <template #icon>
            <SvgIcon icon="carbon:add" />
          </template>
          新建模板
        </NButton>
      </template>

      <NScrollbar class="h-full" content-class="p-4">
        <NGrid :cols="3" responsive="screen" x-gap="16" y-gap="16">
          <NGridItem v-for="item in templateList" :key="item.templateId">
            <NCard
              :bordered="false"
              class="group relative h-full cursor-pointer rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
              content-class="pb-2"
              hoverable
            >
              <!-- 右上角类型标签 -->
              <div class="absolute right-3 top-3 z-10">
                <NTag :bordered="false" :type="item.scopeType === '0' ? 'success' : 'info'" size="small">
                  {{ item.scopeType === '0' ? '系统' : '自建' }}
                </NTag>
              </div>

              <!-- 标题和图标 -->
              <template #header>
                <div class="mr-16 flex items-center gap-2">
                  <SvgIcon :icon="item.icon || 'mdi:file-document-outline'" class="text-xl text-primary" />
                  <span class="font-medium">{{ item.templateName }}</span>
                </div>
              </template>

              <!-- 描述 -->
              <div class="line-clamp-2 mb-6 min-h-12 text-sm text-gray-500">
                {{ item.description || '暂无描述' }}
              </div>

              <!-- 底部信息 -->
              <div class="flex items-center justify-between text-xs text-gray-400">
                <div class="flex items-center gap-2">
                  <NTag :bordered="false" size="small" type="default">
                    {{ getCategoryLabel(item.category) }}
                  </NTag>
                  <span>使用 {{ item.useCount || 0 }} 次</span>
                </div>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>

              <!-- 操作按钮 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    { label: '使用此模板', key: 'use', icon: () => h(SvgIcon, { icon: 'carbon:add-filled' }) },
                    {
                      label: '编辑',
                      key: 'edit',
                      icon: () => h(SvgIcon, { icon: 'carbon:edit' }),
                      disabled: item.scopeType === '0'
                    },
                    {
                      label: '删除',
                      key: 'delete',
                      icon: () => h(SvgIcon, { icon: 'carbon:trash-can' }),
                      disabled: item.scopeType === '0'
                    }
                  ]"
                  @select="
                    (key: string) => {
                      if (key === 'use') showCreateAppModal(item);
                      else if (key === 'edit') handleEdit(item);
                      else if (key === 'delete') handleDelete(item);
                    }
                  "
                >
                  <NButton text size="small" @click.stop>
                    <template #icon>
                      <SvgIcon icon="carbon:overflow-menu-horizontal" />
                    </template>
                  </NButton>
                </NDropdown>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>

        <!-- 空状态 -->
        <div
          v-if="templateList.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <SvgIcon icon="carbon:document-blank" class="mb-4 text-6xl" />
          <span>暂无模板</span>
        </div>
      </NScrollbar>
    </NCard>

    <!-- 创建应用弹窗 -->
    <NModal
      v-model:show="showCreateModal"
      preset="dialog"
      title="通过模板创建应用"
      positive-text="创建"
      negative-text="取消"
      @positive-click="handleCreateApp"
    >
      <NInput v-model:value="createAppName" placeholder="请输入应用名称" />
    </NModal>
  </div>
</template>
