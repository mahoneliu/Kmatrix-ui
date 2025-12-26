<script setup lang="ts">
import { computed, ref, watch, h } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { fetchModels, deleteModels } from '@/service/api/ai';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ModelModal from './model-modal.vue';

interface Props {
  providerId: number | null;
  providerType: '1' | '2' | null;
}

const props = defineProps<Props>();

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const models = ref<Api.AI.Model[]>([]);
const searchText = ref('');

const filteredModels = computed(() => {
  if (!searchText.value) return models.value;
  return models.value.filter(m => 
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
  const { data } = await fetchModels(params);
  if (data) {
    models.value = data;
  } else {
    models.value = [];
  }
  loading.value = false;
}

watch(() => props.providerId, () => {
  loadModels();
}, { immediate: true });

// 监听 providerType 变化也需要重新加载，因为切换Tab但不选供应商时 providerId 都是 null
watch(() => props.providerType, () => {
  loadModels();
});

// 弹窗相关
const modalRef = ref<InstanceType<typeof ModelModal> | null>(null);

function handleAdd() {
  modalRef.value?.open('add', { providerId: props.providerId, modelSource: props.providerType });
}

function handleEdit(item: Api.AI.Model) {
  modalRef.value?.open('edit', item);
}

function handleDelete(item: Api.AI.Model) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除模型 "${item.modelName}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteModels([item.modelId]);
      if (!error) {
        message.success('删除成功');
        loadModels();
      }
    }
  });
}
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- <NInput v-model:value="searchText" placeholder="搜索模型名称或基础模型" clearable class="w-60">
          <template #prefix>
            <div class="i-carbon-search"></div>
          </template>
        </NInput> -->
      </div>
      <NButton type="primary" @click="handleAdd">
        <template #icon>
          <SvgIcon icon="carbon:add" />
        </template>
        新增模型
      </NButton>
    </div>

    <NSpin :show="loading" class="flex-1 min-h-0">
      <NScrollbar class="h-full pr-2">
        <NEmpty v-if="filteredModels.length === 0" description="暂无模型数据" class="mt-20" />
        <NGrid v-else cols="1 s:1 m:2 l:3" x-gap="16" y-gap="16" responsive="screen">
          <NGi v-for="item in filteredModels" :key="item.modelId">
            <NCard
              hoverable
              class="rounded-md shadow-sm transition-all duration-300 hover:shadow-md border-gray-100 dark:border-gray-800"
              content-style="padding: 16px;"
            >
              <div class="flex flex-col gap-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex-center w-8 h-8 flex-shrink-0">
                      <img v-if="item.providerIcon" :src="item.providerIcon" class="w-full h-full object-contain" :alt="item.modelName" />
                      <SvgIcon v-else :icon="item.modelType === '1' ? 'carbon:chat' : 'carbon:data-blob'" class="text-primary text-2xl" />
                    </div>
                    <div>
                      <div class="font-bold text-base leading-tight">{{ item.modelName }}</div>
                      <div class="flex items-center gap-2 mt-1.5">
                        <NTag :type="item.modelType === '1' ? 'info' : 'success'" size="small" bordered>
                          {{ item.modelType === '1' ? '语言模型' : '向量模型' }}
                        </NTag>
                        <NTag :type="item.modelSource === '1' ? 'warning' : 'info'" size="small" bordered>
                          {{ item.modelSource === '1' ? '公有' : '本地' }}
                        </NTag>
                      </div>
                    </div>
                  </div>
                  <NDropdown
                    trigger="click"
                    :options="[
                      { label: '编辑', key: 'edit', icon: () => h(SvgIcon, { icon: 'carbon:edit' }) },
                      { label: '删除', key: 'delete', icon: () => h(SvgIcon, { icon: 'carbon:trash-can', class: 'text-error' }), labelProps: { class: 'text-error' } }
                    ]"
                    @select="(key) => key === 'edit' ? handleEdit(item) : handleDelete(item)"
                  >
                    <NButton quaternary size="small" class="text-gray-500 hover:text-primary">
                      <template #icon>
                        <SvgIcon icon="carbon:overflow-menu-horizontal" />
                      </template>
                    </NButton>
                  </NDropdown>
                </div>

                <div class="text-sm flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/50">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-400">基础模型</span>
                    <span class="font-mono text-xs text-gray-600 dark:text-gray-300">{{ item.modelKey }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-400">状态</span>
                    <div class="flex items-center gap-1.5">
                      <div :class="item.status === '0' ? 'bg-success' : 'bg-gray-400'" class="w-1.5 h-1.5 rounded-full"></div>
                      <span :class="item.status === '0' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'">
                        {{ item.status === '0' ? '启用' : '禁用' }}
                      </span>
                    </div>
                  </div>
                  <div class="truncate text-xs text-gray-400" v-if="item.apiBase">
                    {{ item.apiBase }}
                  </div>
                </div>
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </NScrollbar>
    </NSpin>

    <ModelModal ref="modalRef" @success="loadModels" />
  </div>
</template>

<style scoped>
.flex-1-hidden {
  flex: 1;
  overflow: hidden;
}
</style>
