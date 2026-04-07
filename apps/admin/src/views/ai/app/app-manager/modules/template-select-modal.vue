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
import { useI18n } from 'vue-i18n';
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

const { t } = useI18n();
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
  { label: t('common.all'), value: undefined },
  { label: t('ai.app_manager.template_select.system_template'), value: '0' },
  { label: t('ai.app_manager.template_select.custom_template'), value: '1' }
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
  appName.value = t('ai.app_manager.template_select.based_on', { name: template.templateName });
  showNameModal.value = true;
}

async function handleCreate() {
  if (!selectedTemplate.value || !appName.value.trim()) {
    message.warning(t('ai.app_manager.search_placeholder'));
    return;
  }

  creating.value = true;
  try {
    const res = await createAppFromTemplate(selectedTemplate.value.templateId, appName.value.trim());
    if (res.error) return;
    if (res.data) {
      message.success(t('common.createSuccess'));
      showNameModal.value = false;
      emit('update:visible', false);
      emit('success', res.data);

      // 跳转到应用详情页
      router.push({
        name: 'ai_app_app-detail',
        query: { appId: res.data.toString() }
      });
    }
  } catch (e: any) {
    message.error(e.message || t('common.createFailed'));
  } finally {
    creating.value = false;
  }
}

function getCategoryLabel(category: string | undefined) {
  if (!category) return t('common.none');
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
    :title="$t('ai.app_manager.template_select.title')"
    class="w-900px"
    preset="card"
    @update:show="val => emit('update:visible', val)"
  >
    <!-- 搜索筛选 -->
    <NSpace class="mb-4">
      <NInput
        v-model:value="searchName"
        :placeholder="$t('ai.app_manager.template_select.search_placeholder')"
        clearable
        class="w-200px"
        @keyup.enter="handleSearch"
      />
      <NSelect
        v-model:value="selectedCategory"
        :options="categoryOptions"
        :placeholder="$t('ai.app_manager.template_select.all_categories')"
        clearable
        class="w-120px"
        @update:value="handleSearch"
      />
      <NSelect
        v-model:value="selectedScopeType"
        :options="scopeTypeOptions"
        :placeholder="$t('ai.app_manager.template_select.all_types')"
        class="w-120px"
        @update:value="handleSearch"
      />
      <NButton type="primary" @click="handleSearch">{{ $t('common.search') }}</NButton>
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
                    <NTag :bordered="false" size="small" :type="item.scopeType === '0' ? 'info' : 'success'">
                      {{
                        item.scopeType === '0'
                          ? $t('ai.app_manager.template_select.system_template')
                          : $t('ai.app_manager.template_select.custom_template')
                      }}
                    </NTag>
                    <NTag :bordered="false" size="small" type="default">
                      {{ getCategoryLabel(item.category) }}
                    </NTag>
                  </div>
                  <div class="line-clamp-2 mb-2 text-xs text-gray-500">
                    {{ item.description || $t('ai.app_manager.no_description') }}
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-400">
                      {{
                        $t('ai.app_manager.template_select.use_count', {
                          count: item.useCount || 0
                        })
                      }}
                    </span>
                    <NButton size="tiny" type="primary" @click.stop="handleSelectTemplate(item)">
                      {{ $t('ai.app_manager.template_select.use_this_template') }}
                    </NButton>
                  </div>
                </div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
        <NEmpty v-else :description="$t('ai.app_manager.template_select.no_templates')" />
      </NScrollbar>
    </NSpin>

    <!-- 应用命名弹窗 -->
    <NModal
      v-model:show="showNameModal"
      preset="dialog"
      :title="$t('ai.app_manager.template_select.set_name_title')"
      :positive-text="$t('common.confirm')"
      :negative-text="$t('common.cancel')"
      :positive-button-props="{ loading: creating }"
      @positive-click="handleCreate"
    >
      <NInput v-model:value="appName" :placeholder="$t('ai.app_manager.search_placeholder')" />
    </NModal>
  </NModal>
</template>
