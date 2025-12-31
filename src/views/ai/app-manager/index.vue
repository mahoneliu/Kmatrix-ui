<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCard, NDropdown, NGrid, NGridItem, NInput, NSpace, NTag, useMessage } from 'naive-ui';
import { deleteApp, fetchAppList } from '@/service/api/ai-app';
import SvgIcon from '@/components/custom/svg-icon.vue';
import AppOperateModal from './modules/app-operate-modal.vue';

const router = useRouter();
const message = useMessage();
const modalVisible = ref(false);
const operateType = ref<'add' | 'edit'>('add');
const editingData = ref<Api.AI.App | null>(null);

const searchParams = ref<Api.AI.AppSearchParams>({
  pageNo: 1,
  pageSize: 20,
  appName: '',
  status: undefined
});

const appList = ref<Api.AI.App[]>([]);
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

function handleAdd(appType: '1' | '2' = '1') {
  operateType.value = 'add';
  editingData.value = { appType } as Api.AI.App;
  modalVisible.value = true;
}

function handleEdit(item: Api.AI.App) {
  operateType.value = 'edit';
  editingData.value = { ...item };
  modalVisible.value = true;
}

async function handleDelete(item: Api.AI.App) {
  if (!item.appId) return;
  try {
    await deleteApp([Number(item.appId)]);
    message.success('删除成功');
    getData();
  } catch {
    // error handled by request interceptor usually
  }
}

function handleChat(item: Api.AI.App) {
  if (!item.appId) return;
  router.push({
    name: 'ai_chat',
    query: { appId: item.appId.toString() }
  });
}

function handleWorkflow(item: Api.AI.App) {
  if (!item.appId) return;
  router.push({
    name: 'ai_app-manager_workflow',
    query: { appId: item.appId.toString() }
  });
}

function onModalClose() {
  modalVisible.value = false;
  getData();
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="h-full flex-col">
    <NCard :bordered="false" class="mb-4">
      <NSpace justify="space-between">
        <NSpace>
          <NInput v-model:value="searchParams.appName" clearable placeholder="请输入应用名称" @keyup.enter="getData" />
          <NButton type="primary" @click="getData">
            <template #icon>
              <icon-ic-round-search />
            </template>
            搜索
          </NButton>
        </NSpace>
        <NDropdown
          :options="[
            { label: '基础对话', key: '1', icon: () => h(SvgIcon, { icon: 'carbon:chat' }) },
            { label: '工作流', key: '2', icon: () => h(SvgIcon, { icon: 'carbon:flow' }) }
          ]"
          trigger="click"
          @select="key => handleAdd(key as '1' | '2')"
        >
          <NButton secondary type="primary">
            <div class="flex items-center gap-1">
              <SvgIcon icon="carbon:add" />
              <span>新建应用</span>
              <SvgIcon class="ml-0.5" icon="carbon:chevron-down" />
            </div>
          </NButton>
        </NDropdown>
      </NSpace>
    </NCard>

    <div class="flex-1 overflow-y-auto">
      <NGrid cols="1 640:2 1024:3 1280:4" responsive="screen" x-gap="16" y-gap="16">
        <NGridItem v-for="item in appList" :key="item.appId">
          <NCard
            :bordered="false"
            class="group h-full cursor-pointer rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 !border !border-gray-300 !border-solid dark:bg-white/5 hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.15)] dark:!border-gray-700"
            content-class="pb-12"
            hoverable
          >
            <template #header>
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
                  <span v-if="!item.icon" class="i-carbon-application" />
                  <img v-else :src="item.icon" class="h-full w-full rounded-lg object-cover" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-lg font-bold">{{ item.appName }}</div>
                  <div class="text-xs text-gray-400">
                    <NTag
                      :bordered="false"
                      :type="item.status === '1' ? 'success' : 'warning'"
                      class="mr-2"
                      size="small"
                    >
                      {{ item.status === '1' ? '已发布' : '草稿' }}
                    </NTag>
                    {{ item.appType === '2' ? '工作流' : '基础对话' }}
                  </div>
                </div>
              </div>
            </template>

            <div class="line-clamp-2 mb-4 h-14 text-sm text-gray-500">
              {{ item.description || '暂无描述' }}
            </div>

            <div
              class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
              <NDropdown
                :options="
                  [
                    { label: '设置', key: 'edit', icon: () => h(SvgIcon, { icon: 'carbon:settings' }) },
                    { label: '去对话', key: 'chat', icon: () => h(SvgIcon, { icon: 'carbon:chat' }) },
                    {
                      label: item.appType === '2' ? '编排' : null,
                      key: 'workflow',
                      icon: () => h(SvgIcon, { icon: 'carbon:workflow-automation' }),
                      show: item.appType === '2'
                    },
                    { type: 'divider', show: item.appType === '2' },
                    {
                      label: '删除',
                      key: 'delete',
                      icon: () => h(SvgIcon, { icon: 'carbon:trash-can', class: 'text-error' }),
                      labelProps: { class: 'text-error' }
                    }
                  ].filter(opt => opt.show !== false)
                "
                trigger="click"
                @select="
                  key => {
                    if (key === 'edit') handleEdit(item);
                    else if (key === 'chat') handleChat(item);
                    else if (key === 'workflow') handleWorkflow(item);
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
    </div>

    <AppOperateModal v-model:visible="modalVisible" :data="editingData" :type="operateType" @success="onModalClose" />
  </div>
</template>

<style scoped></style>
