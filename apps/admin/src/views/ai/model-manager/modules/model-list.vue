<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { aiModelTypeRecord, aiProviderTypeRecord } from '@/constants/business';
import { copyModel, deleteModels, fetchModels } from '@/service/api/ai/model';
import ModelModal from './model-modal.vue';

interface Props {
  providerId: CommonType.IdType | null;
  providerType: '1' | '2' | null;
}

const props = defineProps<Props>();

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const models = ref<Api.AI.Admin.Model[]>([]);
const searchText = ref('');

const filteredModels = computed(() => {
  if (!searchText.value) return models.value;
  return models.value.filter(
    (m: Api.AI.Admin.Model) =>
      m.modelName.toLowerCase().includes(searchText.value.toLowerCase()) ||
      m.modelKey.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

async function loadModels() {
  loading.value = true;
  const params: any = {};
  if (props.providerId) {
    params.providerId = props.providerId;
  } else if (props.providerType) {
    // 如果没有特定供应商ID，但有类型（公用/本地），则按类型过滤
    params.modelSource = props.providerType;
  }
  const res = await fetchModels(params);
  if (res.data && Array.isArray(res.data)) {
    // fetchModels 使用兼容函数，返回数组格式
    models.value = res.data;
  } else {
    models.value = [];
  }
  loading.value = false;
}

watch(
  () => props.providerId,
  () => {
    loadModels();
  },
  { immediate: true }
);

// 监听 providerType 变化也需要重新加载，因为切换Tab但不选供应商时 providerId 都是 null
watch(
  () => props.providerType,
  () => {
    loadModels();
  }
);

// 弹窗相关
const modalRef = ref<InstanceType<typeof ModelModal> | null>(null);

function handleAdd() {
  modalRef.value?.open('add', { providerId: props.providerId, modelSource: props.providerType });
}

function handleEdit(item: Api.AI.Admin.Model) {
  modalRef.value?.open('edit', item);
}

function handleDelete(item: Api.AI.Admin.Model) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除模型 "${item.modelName}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteModels([Number(item.modelId)]);
      if (!error) {
        message.success('删除成功');
        loadModels();
      }
    }
  });
}

async function handleCopy(item: Api.AI.Admin.Model) {
  const { error } = await copyModel(item.modelId);
  if (!error) {
    message.success('复制成功');
    loadModels();
  }
}
</script>

<template>
  <div class="h-full">
    <NCard
      :bordered="false"
      size="small"
      title="模型"
      class="h-full card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <div class="flex items-center gap-3">
          <!--
 <NInput v-model:value="searchText" placeholder="搜索模型名称或基础模型" clearable size="small" class="w-60">
            <template #prefix>
              <div class="i-carbon-search"></div>
            </template>
          </NInput>
-->
          <NButton type="primary" ghost size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon icon="carbon:add" />
            </template>
            新增模型
          </NButton>
        </div>
      </template>

      <NSpin :show="loading" class="min-h-0 flex-1">
        <NScrollbar class="h-full" content-class="p-4">
          <NEmpty v-if="filteredModels.length === 0" description="暂无模型数据" class="mt-20" />
          <NGrid v-else cols="1 s:1 m:2 l:3" x-gap="16" y-gap="16" responsive="screen">
            <NGi v-for="item in filteredModels" :key="item.modelId">
              <NCard
                :bordered="false"
                class="group relative rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] !border !border-gray-300 !border-solid dark:bg-white/5 dark:!border-gray-700"
                content-class="p-4"
              >
                <div
                  class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <NDropdown
                    trigger="click"
                    :options="[
                      { label: '编辑', key: 'edit', icon: () => h(SvgIcon, { icon: 'carbon:edit' }) },
                      { label: '复制', key: 'copy', icon: () => h(SvgIcon, { icon: 'carbon:copy' }) },
                      {
                        label: '删除',
                        key: 'delete',
                        icon: () => h(SvgIcon, { icon: 'carbon:trash-can', class: 'text-error' }),
                        labelProps: { class: 'text-error' }
                      }
                    ]"
                    @select="
                      key => {
                        if (key === 'edit') handleEdit(item);
                        else if (key === 'copy') handleCopy(item);
                        else handleDelete(item);
                      }
                    "
                  >
                    <NButton quaternary size="small" class="text-gray-500 hover:text-primary">
                      <template #icon>
                        <SvgIcon icon="carbon:overflow-menu-horizontal" />
                      </template>
                    </NButton>
                  </NDropdown>
                </div>

                <div class="flex flex-col gap-4">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex flex-1 items-center gap-3 overflow-hidden">
                      <div class="h-12 w-12 flex-center flex-shrink-0">
                        <img
                          v-if="item.providerIcon"
                          :alt="item.modelName"
                          :src="item.providerIcon"
                          class="h-full w-auto object-contain"
                        />
                        <!-- <SvgIcon v-else :icon="item.modelType === '1' ? 'carbon:chat' : 'carbon:data-blob'" class="text-primary text-2xl" /> -->
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="truncate text-base font-bold leading-tight" :title="item.modelName">
                          {{ item.modelName }}
                        </div>
                        <div class="mt-1.5 flex items-center gap-2">
                          <NTag bordered size="small" type="default">
                            {{ aiModelTypeRecord[item.modelType] }}
                          </NTag>
                          <NTag bordered size="small" type="default">
                            {{ aiProviderTypeRecord[item.modelSource] }}
                          </NTag>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 border-t border-gray-100 pt-2 text-sm dark:border-gray-800/50">
                    <div class="flex items-center justify-start gap-4">
                      <span class="flex-shrink-0 text-gray-400">基础模型</span>
                      <span :title="item.modelKey" class="truncate text-xs text-gray-600 font-mono dark:text-gray-300">
                        {{ item.modelKey }}
                      </span>
                    </div>
                    <div class="flex items-center justify-start gap-4">
                      <span class="flex-shrink-0 text-gray-400">状&emsp;态&emsp;</span>
                      <div class="flex items-center gap-1.5">
                        <div
                          :class="item.status === '0' ? 'bg-success' : 'bg-gray-400'"
                          class="h-1.5 w-1.5 rounded-full"
                        ></div>
                        <span :class="item.status === '0' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'">
                          {{ item.status === '0' ? '启用' : '禁用' }}
                        </span>
                      </div>
                    </div>
                    <div v-if="item.apiBase" class="truncate text-xs text-gray-400">
                      {{ item.apiBase }}
                    </div>
                  </div>
                </div>
              </NCard>
            </NGi>
          </NGrid>
        </NScrollbar>
      </NSpin>
    </NCard>

    <ModelModal ref="modalRef" @success="loadModels" />
  </div>
</template>

<style scoped>
.flex-1-hidden {
  flex: 1;
  overflow: hidden;
}
</style>
