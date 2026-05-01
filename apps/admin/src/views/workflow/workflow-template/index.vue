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
  NPagination,
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
import { $t } from '@/locales';

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
const total = ref(0);

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
  icon: 'mdi-file-document-outline',
  category: 'custom'
});

// 图标选项
const iconOptions = [
  { label: $t('ai.workflow_template.icon_doc'), value: 'mdi-file-document-outline' },
  { label: $t('ai.workflow_template.robot_icon'), value: 'mdi-robot' },
  { label: $t('ai.workflow_template.icon_chat'), value: 'mdi-chat-processing' },
  { label: $t('ai.workflow_template.search_icon'), value: 'mdi-magnify' },
  { label: $t('ai.workflow_template.icon_data'), value: 'mdi-chart-bar' },
  { label: $t('ai.workflow_template.intelligence_icon'), value: 'mdi-brain' },
  { label: $t('ai.workflow_template.icon_auto'), value: 'mdi-lightning-bolt' },
  { label: $t('ai.workflow_template.edit_icon'), value: 'mdi-pencil' }
];

async function loadCategories() {
  try {
    const res = await fetchTemplateCategories();
    if (res.data) {
      categoryOptions.value = res.data;
    }
  } catch {
    message.error($t('ai.workflow_template.load_category_failed'));
  }
}

async function getData() {
  loading.value = true;
  try {
    const res = await fetchTemplateList(searchParams.value);
    if (res.data?.rows) {
      templateList.value = res.data.rows;
      total.value = res.data.total || 0;
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
  createAppName.value = `${$t('ai.workflow_template.create_app_name_prefix')}${item.templateName}`;
  showCreateModal.value = true;
}

// 通过模板创建应用
async function handleCreateApp() {
  if (!selectedTemplateId.value || !createAppName.value.trim()) {
    message.warning($t('ai.workflow_template.please_input_app_name'));
    return;
  }
  try {
    const res = await createAppFromTemplate(selectedTemplateId.value, createAppName.value.trim());
    if (res.data) {
      message.success($t('ai.workflow_template.create_success'));
      showCreateModal.value = false;
      // 跳转到应用编辑页
      router.push({
        name: 'app_app-detail',
        query: { appId: res.data.toString() }
      });
    }
  } catch (e: any) {
    message.error(e.message || $t('ai.workflow_template.create_failed'));
  }
}

// 显示复制模板弹窗
function showCopyModalHandler(item: WorkflowTemplate) {
  copySourceTemplateId.value = item.templateId;
  copyTemplateName.value = `${item.templateName}${$t('ai.workflow_template.copy_name_suffix')}`;
  showCopyModal.value = true;
}

// 复制模板
async function handleCopyTemplate() {
  if (!copySourceTemplateId.value) return;
  if (!copyTemplateName.value.trim()) {
    message.warning($t('ai.workflow_template.please_input_new_template_name'));
    return;
  }
  try {
    await copyTemplate(copySourceTemplateId.value, copyTemplateName.value.trim());
    message.success($t('ai.workflow_template.copy_success_created'));
    showCopyModal.value = false;
    getData();
  } catch (e: any) {
    message.error(e.message || $t('ai.workflow_template.copy_failed'));
  }
}

// 跳转到工作流编排
function handleDesign(item: WorkflowTemplate) {
  router.push({
    name: 'workflow_template-editor',
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
    icon: 'mdi-file-document-outline',
    category: 'knowledge_qa'
  };
  showTemplateModal.value = true;
}

// 显示编辑模版弹窗
function handleEdit(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning($t('ai.workflow_template.system_template_cannot_edit'));
    return;
  }
  templateModalMode.value = 'edit';
  templateForm.value = {
    templateId: item.templateId,
    templateName: item.templateName,
    templateCode: item.templateCode,
    description: item.description,
    icon: item.icon || 'mdi-file-document-outline',
    category: item.category || 'knowledge_qa'
  };
  showTemplateModal.value = true;
}

// 保存模版（新建或编辑）
async function handleSaveTemplate() {
  if (!templateForm.value.templateName?.trim()) {
    message.warning($t('ai.workflow_template.please_input_template_name'));
    return;
  }
  if (!templateForm.value.templateCode?.trim()) {
    message.warning($t('ai.workflow_template.please_input_template_code'));
    return;
  }
  templateFormSaving.value = true;
  if (templateModalMode.value === 'add') {
    const { error, data } = await addTemplate(templateForm.value);
    if (!error) {
      message.success($t('ai.workflow_template.create_success_jump'));
      showTemplateModal.value = false;
      if (data) {
        router.push({
          name: 'workflow_template-editor',
          query: { templateId: data.toString() }
        });
      }
    }
  } else {
    const { error } = await updateTemplate(templateForm.value);
    if (!error) {
      message.success($t('ai.workflow_template.save_success'));
      showTemplateModal.value = false;
      getData();
    }
  }
  templateFormSaving.value = false;
}

// 删除模板（带确认）
function handleDelete(item: WorkflowTemplate) {
  if (item.scopeType === '0') {
    message.warning($t('ai.workflow_template.system_template_cannot_delete'));
    return;
  }
  dialog.warning({
    title: $t('common.confirmDelete'),
    content: `${$t('common.confirm')}删除模板「${item.templateName}」吗？此操作不可恢复。`,
    positiveText: $t('common.delete'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await deleteTemplate([item.templateId]);
      if (!error) {
        message.success($t('ai.workflow_template.delete_success'));
        getData();
      }
    }
  });
}

// 获取分类标签
function getCategoryLabel(category: string | undefined) {
  if (!category) return $t('ai.workflow_template.uncategorized');
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
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.templateName"
              :placeholder="$t('ai.workflow_template.template_name')"
              clearable
              class="w-[200px]"
              @keyup.enter="handleSearch"
            />
            <NSelect
              v-model:value="searchParams.category"
              :options="categoryOptions"
              :placeholder="$t('ai.workflow_template.category')"
              clearable
              class="w-[150px]"
            />
            <NSelect
              v-model:value="searchParams.scopeType"
              :options="[
                { label: $t('ai.workflow_template.system_template'), value: '0' },
                { label: $t('ai.workflow_template.user_template'), value: '1' }
              ]"
              :placeholder="$t('common.type')"
              clearable
              class="w-[120px]"
            />
            <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
            <NButton @click="handleReset">{{ $t('common.reset') }}</NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 模板列表 -->
    <NCard
      :bordered="false"
      size="small"
      :title="$t('ai.workflow_template.workflow_template')"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NButton type="primary" ghost size="small" @click="handleShowAddModal">
          <template #icon>
            <SvgIcon local-icon="carbon-add" />
          </template>
          {{ $t('ai.workflow_template.new_template') }}
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
                  {{
                    item.scopeType === '0' ? $t('ai.workflow_template.system') : $t('ai.workflow_template.user_built')
                  }}
                </NTag>
              </div>

              <!-- 标题和图标 -->
              <template #header>
                <div class="mr-16 flex items-center gap-2">
                  <SvgIcon :local-icon="item.icon || 'mdi-file-document-outline'" class="text-xl text-primary" />
                  <span class="font-medium">{{ item.templateName }}</span>
                </div>
              </template>

              <!-- 描述 -->
              <div class="line-clamp-2 mb-5 min-h-16 text-sm text-gray-500">
                {{ item.description || $t('ai.workflow_template.no_desc') }}
              </div>

              <!-- 底部信息 -->
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <NTag :bordered="false" size="small" type="default">
                  {{ getCategoryLabel(item.category) }}
                </NTag>
                <span>{{ $t('ai.workflow_template.used_count_times', { count: item.useCount || 0 }) }}</span>
                <span class="mx-1">|</span>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>

              <!-- 操作按钮 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    {
                      label: $t('ai.workflow_template.use_template'),
                      key: 'use',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-add-filled' })
                    },
                    {
                      label: $t('ai.workflow_template.copy_to_custom'),
                      key: 'copy',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-copy' })
                    },
                    ...(item.scopeType !== '0'
                      ? [
                          {
                            label: $t('ai.workflow_template.workflow_config'),
                            key: 'design',
                            icon: () => h(SvgIcon, { localIcon: 'carbon-settings' })
                          }
                        ]
                      : []),
                    {
                      label: $t('common.edit'),
                      key: 'edit',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-edit' }),
                      disabled: item.scopeType === '0'
                    },
                    {
                      label: $t('common.delete'),
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
          <span>{{ $t('ai.workflow_template.no_template') }}</span>
        </div>
      </NScrollbar>

      <!-- 分页 -->
      <div v-if="templateList.length > 0" class="flex justify-end border-t border-gray-100 p-4 dark:border-gray-800">
        <NPagination
          v-model:page="searchParams.pageNum"
          v-model:page-size="searchParams.pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
          show-quick-jumper
          @update:page="getData"
          @update:page-size="getData"
        />
      </div>
    </NCard>

    <!-- 创建应用弹窗 -->
    <NModal
      v-model:show="showCreateModal"
      preset="dialog"
      :title="$t('ai.workflow_template.create_app_from_template')"
      :positive-text="$t('ai.workflow_template.create')"
      :negative-text="$t('common.cancel')"
      @positive-click="handleCreateApp"
    >
      <NInput v-model:value="createAppName" :placeholder="$t('ai.workflow_template.please_input_app_name')" />
    </NModal>

    <!-- 新建/编辑模版弹窗 -->
    <NModal
      v-model:show="showTemplateModal"
      preset="dialog"
      :title="
        templateModalMode === 'add' ? $t('ai.workflow_template.new_template') : $t('ai.workflow_template.edit_template')
      "
      :positive-text="templateFormSaving ? $t('ai.workflow_template.saving') : $t('common.save')"
      :negative-text="$t('common.cancel')"
      :positive-button-props="{ disabled: templateFormSaving }"
      class="w-520px"
      @positive-click="handleSaveTemplate"
    >
      <div class="flex flex-col gap-4 py-2">
        <NFormItem :label="$t('ai.workflow_template.template_name')" required :show-feedback="false">
          <NInput
            v-model:value="templateForm.templateName"
            :placeholder="$t('ai.workflow_template.please_input_template_name')"
          />
        </NFormItem>
        <NFormItem :label="$t('ai.workflow_template.template_code')" required :show-feedback="false">
          <NInput
            v-model:value="templateForm.templateCode"
            :placeholder="$t('ai.workflow_template.unique_identifier')"
          />
        </NFormItem>
        <NFormItem :label="$t('ai.workflow_template.category')" :show-feedback="false">
          <NSelect
            v-model:value="templateForm.category"
            :options="categoryOptions"
            :placeholder="$t('ai.workflow_template.select_category')"
          />
        </NFormItem>
        <NFormItem :label="$t('ai.workflow_template.icon_label')" :show-feedback="false">
          <NSelect
            v-model:value="templateForm.icon"
            :options="iconOptions"
            :placeholder="$t('ai.workflow_template.select_icon')"
            :render-label="(option: any) => option.label"
          />
        </NFormItem>
        <NFormItem :label="$t('common.description')" :show-feedback="false">
          <NInput
            v-model:value="templateForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('ai.workflow_template.template_desc')"
          />
        </NFormItem>
      </div>
    </NModal>

    <!-- 复制模板弹窗 -->
    <NModal
      v-model:show="showCopyModal"
      preset="dialog"
      :title="$t('ai.workflow_template.copy_to_custom_template')"
      :positive-text="$t('common.copy')"
      :negative-text="$t('common.cancel')"
      @positive-click="handleCopyTemplate"
    >
      <NInput
        v-model:value="copyTemplateName"
        :placeholder="$t('ai.workflow_template.please_input_new_template_name')"
      />
    </NModal>
  </div>
</template>
