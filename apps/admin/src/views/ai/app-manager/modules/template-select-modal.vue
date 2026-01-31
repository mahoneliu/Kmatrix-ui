<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NEmpty,
  NGrid,
  NGridItem,
  NInput,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import {
  type TemplateCategory,
  type WorkflowTemplate,
  createAppFromTemplate,
  fetchTemplateCategories,
  fetchTemplateList
} from '@/service/api/ai/workflow-template';

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', appId: number): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const router = useRouter();
const message = useMessage();

// 数据状态
const loading = ref(false);
const templateList = ref<WorkflowTemplate[]>([]);
const categoryOptions = ref<TemplateCategory[]>([]);

// 搜索筛选
const searchName = ref('');
const selectedCategory = ref<string | undefined>(undefined);
const selectedScopeType = ref<'0' | '1' | undefined>(undefined);

// 类型筛选选项
const scopeTypeOptions = [
  { label: '全部', value: undefined },
  { label: '系统模版', value: '0' },
  { label: '自建模版', value: '1' }
];

// 创建应用弹窗
const showNameModal = ref(false);
const selectedTemplate = ref<WorkflowTemplate | null>(null);
const appName = ref('');
const creating = ref(false);

async function loadCategories() {
  try {
    const res = await fetchTemplateCategories();
    if (res.data) {
      categoryOptions.value = res.data;
    }
  } catch {
    // ignore
  }
}

async function loadTemplates() {
  loading.value = true;
  try {
    const res = await fetchTemplateList({
      templateName: searchName.value || undefined,
      category: selectedCategory.value,
      scopeType: selectedScopeType.value,
      isEnabled: '1',
      pageNum: 1,
      pageSize: 50
    });
    if (res.data?.rows) {
      templateList.value = res.data.rows;
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  loadTemplates();
}

function handleSelectTemplate(template: WorkflowTemplate) {
  selectedTemplate.value = template;
  appName.value = `基于${template.templateName}`;
  showNameModal.value = true;
}

async function handleCreate() {
  if (!selectedTemplate.value || !appName.value.trim()) {
    message.warning('请输入应用名称');
    return;
  }

  creating.value = true;
  try {
    const res = await createAppFromTemplate(selectedTemplate.value.templateId, appName.value.trim());
    if (res.data) {
      message.success('创建成功');
      showNameModal.value = false;
      emit('update:visible', false);
      emit('success', res.data);

      // 跳转到应用详情页
      router.push({
        name: 'ai_app-detail',
        query: { appId: res.data.toString() }
      });
    }
  } catch (e: any) {
    message.error(e.message || '创建失败');
  } finally {
    creating.value = false;
  }
}

function getCategoryLabel(category: string | undefined) {
  if (!category) return '未分类';
  const found = categoryOptions.value.find(c => c.value === category);
  return found ? found.label : category;
}

onMounted(() => {
  loadCategories();
  loadTemplates();
});
</script>

<template>
  <NModal
    :show="visible"
    title="从模版创建应用"
    class="w-900px"
    preset="card"
    @update:show="val => emit('update:visible', val)"
  >
    <!-- 搜索筛选 -->
    <NSpace class="mb-4">
      <NInput
        v-model:value="searchName"
        placeholder="搜索模版名称"
        clearable
        class="w-200px"
        @keyup.enter="handleSearch"
      />
      <NSelect
        v-model:value="selectedCategory"
        :options="categoryOptions"
        placeholder="全部分类"
        clearable
        class="w-120px"
        @update:value="handleSearch"
      />
      <NSelect
        v-model:value="selectedScopeType"
        :options="scopeTypeOptions"
        placeholder="全部类型"
        class="w-120px"
        @update:value="handleSearch"
      />
      <NButton type="primary" @click="handleSearch">搜索</NButton>
    </NSpace>

    <!-- 模版列表 -->
    <NSpin :show="loading">
      <NScrollbar class="max-h-400px">
        <NGrid v-if="templateList.length > 0" :cols="2" x-gap="12" y-gap="12">
          <NGridItem v-for="item in templateList" :key="item.templateId">
            <NCard
              :bordered="false"
              size="small"
              hoverable
              class="cursor-pointer rounded-lg transition-all !border !border-gray-200 !border-solid hover:shadow-md dark:!border-gray-700"
            >
              <div class="flex items-start gap-3">
                <div
                  class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl text-primary"
                >
                  <SvgIcon :icon="item.icon || 'mdi:file-document-outline'" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <span class="truncate font-medium">{{ item.templateName }}</span>
                    <NTag :bordered="false" size="small" :type="item.scopeType === '0' ? 'success' : 'default'">
                      {{ item.scopeType === '0' ? '系统' : '自建' }}
                    </NTag>
                    <NTag :bordered="false" size="small" type="default">
                      {{ getCategoryLabel(item.category) }}
                    </NTag>
                  </div>
                  <div class="line-clamp-2 mb-2 text-xs text-gray-500">
                    {{ item.description || '暂无描述' }}
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">已使用 {{ item.useCount || 0 }} 次</span>
                    <NButton size="tiny" type="primary" @click.stop="handleSelectTemplate(item)">使用此模版</NButton>
                  </div>
                </div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
        <NEmpty v-else description="暂无可用模版" />
      </NScrollbar>
    </NSpin>

    <!-- 应用命名弹窗 -->
    <NModal
      v-model:show="showNameModal"
      preset="dialog"
      title="设置应用名称"
      positive-text="创建"
      negative-text="取消"
      :positive-button-props="{ loading: creating }"
      @positive-click="handleCreate"
    >
      <NInput v-model:value="appName" placeholder="请输入应用名称" />
    </NModal>
  </NModal>
</template>
