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
  NScrollbar,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { deleteApp, fetchAppList } from '@/service/api/ai/admin/app';
import AppOperateModal from './modules/app-operate-modal.vue';

const router = useRouter();
const message = useMessage();
const modalVisible = ref(false);
const appType = ref<'1' | '2'>('1');

const searchParams = ref<Api.AI.Admin.AppSearchParams>({
  pageNo: 1,
  pageSize: 20,
  appName: '',
  status: undefined
});

const appList = ref<Api.AI.Admin.App[]>([]);
const loading = ref(false);

async function getData() {
  loading.value = true;
  try {
    const { data } = await fetchAppList(searchParams.value);
    if (data && data.rows) {
      appList.value = data.rows;
    }
  } finally {
    loading.value = false;
  }
}

function handleAdd(type: '1' | '2') {
  appType.value = type;
  modalVisible.value = true;
}

async function handleDelete(item: Api.AI.Admin.App) {
  if (!item.appId) return;
  try {
    await deleteApp([item.appId]);
    message.success('删除成功');
    getData();
  } catch {
    // error handled by request interceptor usually
  }
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

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 可折叠的搜索区域 -->
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem title="搜索" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.appName"
              clearable
              placeholder="请输入应用名称"
              @keyup.enter="getData"
            />
            <NButton type="primary" @click="getData">
              <template #icon>
                <icon-ic-round-search />
              </template>
              搜索
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <!-- 应用列表区域 -->
    <NCard
      :bordered="false"
      size="small"
      title="应用列表"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NDropdown
          :options="[
            { label: '基础对话', key: '1', icon: () => h(SvgIcon, { icon: 'carbon:chat' }) },
            { label: '工作流', key: '2', icon: () => h(SvgIcon, { icon: 'carbon:flow' }) }
          ]"
          trigger="click"
          @select="key => handleAdd(key as '1' | '2')"
        >
          <NButton type="primary" ghost size="small">
            <template #icon>
              <SvgIcon icon="carbon:add" />
            </template>
            新建应用
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
                <NTag :bordered="false" :type="item.appType === '2' ? 'warning' : 'info'" size="small">
                  {{ item.appType === '2' ? '工作流' : '简单应用' }}
                </NTag>
              </div>

              <template #header>
                <div class="flex items-center gap-3 pr-20">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                    <span v-if="!item.icon" class="i-carbon-application" />
                    <img v-else :src="item.icon" class="h-full w-full rounded-lg object-cover" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-base font-bold">{{ item.appName }}</div>
                    <div class="text-xs text-gray-400">创建者: {{ item.createByName }}</div>
                  </div>
                </div>
              </template>

              <div class="line-clamp-2 mb-8 min-h-14 text-sm text-gray-500">
                {{ item.description || '暂无描述' }}
              </div>

              <!-- 左下角状态和时间 -->
              <div class="flex items-center gap-2 text-xs">
                <div class="flex items-center gap-1">
                  <SvgIcon
                    :icon="item.status === '1' ? 'carbon:checkmark-filled' : 'carbon:error-outline'"
                    :class="item.status === '1' ? 'text-success' : ''"
                  />
                  <span :class="item.status === '1' ? 'text-success' : 'text-warning'">
                    {{ item.status === '1' ? '已发布' : '未发布' }}
                  </span>
                </div>
                <span class="text-gray-400">|</span>
                <span class="text-gray-400">{{ formatDate(item.updateTime || item.createTime) }}</span>
              </div>

              <!-- 右下角操作菜单 -->
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  :options="[
                    { label: '设置', key: 'settings', icon: () => h(SvgIcon, { icon: 'carbon:settings' }) },
                    { label: '去对话', key: 'chat', icon: () => h(SvgIcon, { icon: 'carbon:chat' }) },
                    { type: 'divider' },
                    {
                      label: '删除',
                      key: 'delete',
                      icon: () => h(SvgIcon, { icon: 'carbon:trash-can', class: 'text-error' }),
                      labelProps: { class: 'text-error' }
                    }
                  ]"
                  trigger="click"
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
                      <SvgIcon icon="carbon:overflow-menu-horizontal" />
                    </template>
                  </NButton>
                </NDropdown>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </NScrollbar>
    </NCard>

    <AppOperateModal v-model:visible="modalVisible" :app-type="appType" @success="id => onModalClose(id, appType)" />
  </div>
</template>

<style scoped></style>
