<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  type DropdownOption,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDropdown,
  NGrid,
  NGridItem,
  NInput,
  NPagination,
  NScrollbar,
  NSpace,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { deleteApp, fetchAppList } from '@/service/api/ai/app';
import AppOperateModal from './modules/app-operate-modal.vue';
import TemplateSelectModal from './modules/template-select-modal.vue';

const { t } = useI18n();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const modalVisible = ref(false);
const templateModalVisible = ref(false);
const appType = ref<'1' | '2'>('1');

const searchParams = ref<Api.AI.Admin.AppSearchParams>({
  pageNum: 1,
  pageSize: 20,
  appName: '',
  status: undefined
});

const appList = ref<Api.AI.Admin.App[]>([]);
const loading = ref(false);
const total = ref(0);

async function getData() {
  loading.value = true;
  try {
    const { data } = await fetchAppList(searchParams.value);
    if (data && data.rows) {
      appList.value = data.rows;
      total.value = data.total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function handleAdd(type: '1' | '2') {
  if (type === '1') {
    templateModalVisible.value = true;
    return;
  }
  appType.value = type;
  modalVisible.value = true;
}

async function handleDelete(item: Api.AI.Admin.App) {
  if (!item.appId) return;
  const appId = item.appId;
  dialog.warning({
    title: t('ai.app_manager.confirm_delete_title'),
    content: t('ai.app_manager.confirm_delete_content', { name: item.appName }),
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await deleteApp([appId]);
      if (!error) {
        message.success(t('common.deleteSuccess'));
        getData();
      }
    }
  });
}

function handleChat(item: Api.AI.Admin.App) {
  if (!item.appId) return;
  router.push({
    name: 'ai_chat',
    query: { appId: item.appId.toString() }
  });
}

function handleSettings(item: Api.AI.Admin.App) {
  if (!item.appId) return;
  // 调用统一跳转逻辑
  jumpToAppSettings(item.appId, item.appType);
}

// 点击卡片跳转到详情页
function handleCardClick(item: Api.AI.Admin.App) {
  if (!item.appId) return;
  router.push({
    name: 'ai_app-detail',
    query: { appId: item.appId.toString() }
  });
}

function jumpToAppSettings(appId?: CommonType.IdType, type?: string) {
  if (!appId) return;
  // 如果是新建的应用,自动打开工作流编排页面；
  // 如果是简单对话知识库RAG应用,打开编辑弹窗，加载表单页面设置固定工作流模板

  router.push({
    name: type === '2' ? 'ai_workflow' : 'ai_simple_rag',
    query: { appId: appId.toString() }
  });
}

function onModalClose(createdAppId?: CommonType.IdType, type?: string) {
  modalVisible.value = false;
  if (createdAppId) {
    jumpToAppSettings(createdAppId, type);
  } else {
    // 如果是编辑的应用,刷新列表
    getData();
  }
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDropdownOptions(item: Api.AI.Admin.App) {
  const options: DropdownOption[] = [];

  if (item.appType === '2' || (item.sourceTemplateId && item.sourceTemplateScope !== '0')) {
    options.push({
      label: t('ai.app_manager.workflow_config'),
      key: 'settings',
      icon: () => h(SvgIcon, { localIcon: 'carbon-settings' })
    });
  }

  if (item.status === '1') {
    options.push({
      label: t('ai.app_manager.go_to_chat'),
      key: 'chat',
      icon: () => h(SvgIcon, { localIcon: 'carbon-chat' })
    });
  }

  options.push(
    { type: 'divider', key: 'd1' },
    {
      label: t('common.delete'),
      key: 'delete',
      icon: () => h(SvgIcon, { localIcon: 'carbon-trash-can', class: 'text-error' }),
      labelProps: { class: 'text-error' }
    }
  );

  return options;
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 可折叠的搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.appName"
              clearable
              :placeholder="$t('ai.app_manager.search_placeholder')"
              @keyup.enter="getData"
            />
            <NButton type="primary" @click="getData">
              <template #icon>
                <icon-ic-round-search />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 应用列表区域 -->
    <NCard
      :bordered="false"
      size="small"
      :title="$t('ai.app_manager.title')"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NDropdown
          :options="[
            {
              label: $t('ai.app_manager.custom_workflow'),
              key: '2',
              icon: () => h(SvgIcon, { localIcon: 'carbon-flow' })
            },
            { type: 'divider', key: 'd1' },
            {
              label: $t('ai.app_manager.create_from_template'),
              key: '1',
              icon: () => h(SvgIcon, { localIcon: 'carbon-chat' })
            }
          ]"
          trigger="click"
          @select="key => handleAdd(key as '1' | '2')"
        >
          <NButton type="primary" ghost size="small">
            <template #icon>
              <SvgIcon local-icon="carbon-add" />
            </template>
            {{ $t('ai.app_manager.create_app') }}
          </NButton>
        </NDropdown>
      </template>

      <NScrollbar class="h-full" content-class="p-4">
        <NGrid :cols="3" responsive="screen" x-gap="16" y-gap="16">
          <NGridItem v-for="item in appList" :key="item.appId">
            <NCard
              :bordered="false"
              class="group relative h-full cursor-pointer rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
              content-class="pb-2"
              hoverable
              @click="handleCardClick(item)"
            >
              <!-- 右上角应用类型标签 -->
              <div class="absolute right-3 top-3 z-10">
                <NTag :bordered="false" :type="item.appType === '2' ? 'success' : 'info'" size="small">
                  {{
                    item.appType === '2' ? $t('ai.app_manager.custom_workflow') : $t('ai.app_manager.fixed_template')
                  }}
                </NTag>
              </div>

              <template #header>
                <div class="flex items-center gap-3 pr-20">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                    <SvgIcon v-if="!item.icon" local-icon="mdi-application" />
                    <SvgIcon v-else :icon="item.icon" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-base font-bold">{{ item.appName }}</div>
                    <div class="text-xs text-gray-400">{{ $t('ai.app_manager.creator') }}: {{ item.createByName }}</div>
                  </div>
                </div>
              </template>

              <div class="line-clamp-2 mb-8 min-h-14 text-sm text-gray-500">
                {{ item.description || $t('ai.app_manager.no_description') }}
              </div>

              <!-- 底部状态、时间和反馈信息 -->
              <div class="mt-auto flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1">
                    <SvgIcon
                      :icon="item.status === '1' ? 'carbon:checkmark-filled' : 'carbon:error-outline'"
                      :class="item.status === '1' ? 'text-success' : ''"
                    />
                    <span :class="item.status === '1' ? 'text-success' : 'text-warning'">
                      {{
                        item.status === '1'
                          ? $t('ai.app_manager.status_published')
                          : $t('ai.app_manager.status_unpublished')
                      }}
                    </span>
                  </div>
                  <span class="text-gray-400">|</span>
                  <span class="text-gray-400">{{ formatDate(item.updateTime || item.createTime) }}</span>
                </div>
              </div>

              <!-- 右下角操作菜单 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="getDropdownOptions(item)"
                  @select="
                    key => {
                      if (key === 'settings') handleSettings(item);
                      else if (key === 'chat') handleChat(item);
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
      </NScrollbar>

      <div v-if="appList.length > 0" class="flex justify-end border-t border-gray-100 p-4 dark:border-gray-800">
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

    <AppOperateModal v-model:visible="modalVisible" :app-type="appType" @success="id => onModalClose(id, appType)" />
    <TemplateSelectModal v-model:visible="templateModalVisible" @success="() => getData()" />
  </div>
</template>

<style scoped></style>
