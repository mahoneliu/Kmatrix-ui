<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDropdown,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  type TemplateCategory,
  type WorkflowTemplate,
  addTemplate,
  copyTemplate,
  createAppFromTemplate,
  deleteTemplate,
  fetchTemplateCategories,
  fetchTemplateList,
  updateTemplate
} from '@/service/api/ai/workflow-template';

const router = useRouter();
const message = useMessage();
const dialog = useDialog();

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

// 复制模板弹窗
const showCopyModal = ref(false);
const copyTemplateName = ref('');
const copySourceTemplateId = ref<number | null>(null);

// 新建/编辑模版弹窗
const showTemplateModal = ref(false);
const templateModalMode = ref<'add' | 'edit'>('add');
const templateFormSaving = ref(false);
const templateForm = ref<Partial<WorkflowTemplate>>({
  templateName: '',
  templateCode: '',
  description: '',
  localIcon: 'mdi-file-document-outline',
  category: 'custom'
});

// 图标选项
const iconOptions = [
  { label: '📄 文档', value: 'mdi-file-document-outline' },
  { label: '🤖 机器人', value: 'mdi-robot' },
  { label: '💬 对话', value: 'mdi-chat-processing' },
  { label: '🔍 搜索', value: 'mdi-magnify' },
  { label: '📊 数据', value: 'mdi-chart-bar' },
  { label: '🧠 智能', value: 'mdi-brain' },
  { label: '⚡ 自动化', value: 'mdi-lightning-bolt' },
  { label: '📝 编辑', value: 'mdi-pencil' }
];

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

// 显示复制模板弹窗
function showCopyModalHandler(item: WorkflowTemplate) {
  copySourceTemplateId.value = item.templateId;
  copyTemplateName.value = `${item.templateName}_副本`;
  showCopyModal.value = true;
}

// 复制模板
async function handleCopyTemplate() {
  if (!copySourceTemplateId.value) return;
  if (!copyTemplateName.value.trim()) {
    message.warning('请输入新模板名称');
    return;
  }
  try {
    await copyTemplate(copySourceTemplateId.value, copyTemplateName.value.trim());
    message.success('复制成功，已创建自定义模板');
    showCopyModal.value = false;
    getData();
  } catch (e: any) {
    message.error(e.message || '复制失败');
  }
}

// 跳转到工作流编排
function handleDesign(item: WorkflowTemplate) {
  router.push({
    name: 'ai_template-editor',
    query: { templateId: item.templateId.toString() }
  });
}

// 显示新建模版弹窗
function handleShowAddModal() {
  templateModalMode.value = 'add';
  templateForm.value = {
    templateName: '',
    templateCode: '',
    description: '',
    localIcon: 'mdi-file-document-outline',
    category: 'custom'
  };
  showTemplateModal.value = true;
}

// 显示编辑模版弹窗
function handleEdit(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning('系统模板不允许编辑');
    return;
  }
  templateModalMode.value = 'edit';
  templateForm.value = {
    templateId: item.templateId,
    templateName: item.templateName,
    templateCode: item.templateCode,
    description: item.description,
    localIcon: item.localIcon || item.icon?.replace(':', '-') || 'mdi-file-document-outline',
    category: item.category || 'custom'
  };
  showTemplateModal.value = true;
}

// 保存模版（新建或编辑）
async function handleSaveTemplate() {
  if (!templateForm.value.templateName?.trim()) {
    message.warning('请输入模板名称');
    return;
  }
  if (!templateForm.value.templateCode?.trim()) {
    message.warning('请输入模板编码');
    return;
  }
  templateFormSaving.value = true;
  try {
    if (templateModalMode.value === 'add') {
      const res = await addTemplate(templateForm.value);
      message.success('创建成功，即将跳转到工作流编排页面');
      showTemplateModal.value = false;
      // 跳转到模板编辑页
      if (res.data) {
        router.push({
          name: 'ai_template-editor',
          query: { templateId: res.data.toString() }
        });
      }
    } else {
      await updateTemplate(templateForm.value);
      message.success('保存成功');
      showTemplateModal.value = false;
      getData();
    }
  } catch (e: any) {
    message.error(e.message || '保存失败');
  } finally {
    templateFormSaving.value = false;
  }
}

// 删除模板（带确认）
function handleDelete(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning('系统模板不允许删除');
    return;
  }
  dialog.warning({
    title: '确认删除',
    content: `确定要删除模板「${item.templateName}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteTemplate([item.templateId]);
        message.success('删除成功');
        getData();
      } catch (e: any) {
        message.error(e.message || '删除失败');
      }
    }
  });
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
        <NButton type="primary" ghost size="small" @click="handleShowAddModal">
          <template #icon>
            <SvgIcon local-icon="carbon-add" />
          </template>
          新建模板
        </NButton>
      </template>

      <NScrollbar class="h-full" content-class="p-4">
        <NGrid cols="1 s:2 m:3 l:3 xl:4 2xl:4" responsive="screen" :x-gap="24" :y-gap="24">
          <NGridItem v-for="item in templateList" :key="item.templateId">
            <NCard
              :bordered="false"
              class="group relative h-full rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
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
                  <SvgIcon
                    :local-icon="item.localIcon || item.icon?.replace(':', '-') || 'mdi-file-document-outline'"
                    class="text-xl text-primary"
                  />
                  <span class="font-medium">{{ item.templateName }}</span>
                </div>
              </template>

              <!-- 描述 -->
              <div class="line-clamp-2 mb-5 min-h-16 text-sm text-gray-500">
                {{ item.description || '暂无描述' }}
              </div>

              <!-- 底部信息 -->
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <NTag :bordered="false" size="small" type="default">
                  {{ getCategoryLabel(item.category) }}
                </NTag>
                <span>使用 {{ item.useCount || 0 }} 次</span>
                <span class="mx-1">|</span>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>

              <!-- 操作按钮 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    { label: '使用此模板', key: 'use', icon: () => h(SvgIcon, { localIcon: 'carbon-add-filled' }) },
                    { label: '复制至自定义', key: 'copy', icon: () => h(SvgIcon, { localIcon: 'carbon-copy' }) },
                    ...(item.scopeType !== '0'
                      ? [
                          {
                            label: '工作流配置',
                            key: 'design',
                            icon: () => h(SvgIcon, { localIcon: 'carbon-settings' })
                          }
                        ]
                      : []),
                    {
                      label: '编辑',
                      key: 'edit',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-edit' }),
                      disabled: item.scopeType === '0'
                    },
                    {
                      label: '删除',
                      key: 'delete',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-trash-can' }),
                      disabled: item.scopeType === '0'
                    }
                  ]"
                  @select="
                    (key: string) => {
                      if (key === 'use') showCreateAppModal(item);
                      else if (key === 'copy') showCopyModalHandler(item);
                      else if (key === 'design') handleDesign(item);
                      else if (key === 'edit') handleEdit(item);
                      else if (key === 'delete') handleDelete(item);
                    }
                  "
                >
                  <NButton class="text-gray-500 hover:text-primary" quaternary size="small" @click.stop>
                    <template #icon>
                      <SvgIcon local-icon="carbon-overflow-menu-horizontal" />
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
          <SvgIcon local-icon="carbon-document-blank" class="mb-4 text-6xl" />
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

    <!-- 新建/编辑模版弹窗 -->
    <NModal
      v-model:show="showTemplateModal"
      preset="dialog"
      :title="templateModalMode === 'add' ? '新建模板' : '编辑模板'"
      :positive-text="templateFormSaving ? '保存中...' : '保存'"
      negative-text="取消"
      :positive-button-props="{ disabled: templateFormSaving }"
      class="w-520px"
      @positive-click="handleSaveTemplate"
    >
      <div class="flex flex-col gap-4 py-2">
        <NFormItem label="模板名称" required :show-feedback="false">
          <NInput v-model:value="templateForm.templateName" placeholder="请输入模板名称" />
        </NFormItem>
        <NFormItem label="模板编码" required :show-feedback="false">
          <NInput v-model:value="templateForm.templateCode" placeholder="唯一标识，如 knowledge_qa" />
        </NFormItem>
        <NFormItem label="分类" :show-feedback="false">
          <NSelect v-model:value="templateForm.category" :options="categoryOptions" placeholder="选择分类" />
        </NFormItem>
        <NFormItem label="图标" :show-feedback="false">
          <NSelect
            v-model:value="templateForm.localIcon"
            :options="iconOptions"
            placeholder="选择图标"
            :render-label="(option: any) => option.label"
          />
        </NFormItem>
        <NFormItem label="描述" :show-feedback="false">
          <NInput
            v-model:value="templateForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="模板描述（可选）"
          />
        </NFormItem>
      </div>
    </NModal>

    <!-- 复制模板弹窗 -->
    <NModal
      v-model:show="showCopyModal"
      preset="dialog"
      title="复制至自定义模板"
      positive-text="复制"
      negative-text="取消"
      @positive-click="handleCopyTemplate"
    >
      <NInput v-model:value="copyTemplateName" placeholder="请输入新模板名称" />
    </NModal>
  </div>
</template>
