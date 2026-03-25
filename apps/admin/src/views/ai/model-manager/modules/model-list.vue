<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { aiModelTypeRecord, aiProviderTypeRecord } from '@/constants/business';
import { copyModel, deleteModel, fetchModelList, setDefaultModel } from '@/service/api/ai/model';
import { $t } from '@/locales';
import ModelModal from './model-modal.vue';

interface Props {
  providerId: CommonType.IdType | null;
  providerType: '1' | '2' | null;
  providers: Api.AI.Admin.ModelProvider[];
}

const props = defineProps<Props>();

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const models = ref<Api.AI.Admin.Model[]>([]);
const searchText = ref('');
const searchType = ref<'name' | 'modelKey'>('name');

const searchOptions = [
  { label: $t('ai.model_manager.model_name'), value: 'name' },
  { label: $t('ai.model_manager.base_model'), value: 'modelKey' }
];

const filteredModels = computed(() => {
  if (!searchText.value) return models.value;
  const text = searchText.value.toLowerCase();
  return models.value.filter((m: Api.AI.Admin.Model) => {
    if (searchType.value === 'name') {
      return m.modelName.toLowerCase().includes(text);
    }
    if (searchType.value === 'modelKey') {
      return m.modelKey.toLowerCase().includes(text);
    }
    return false;
  });
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
  const res = await fetchModelList(params);
  if (res.data && Array.isArray(res.data)) {
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
    title: $t('ai.model_manager.confirm_delete'),
    content: `确定要删除模型 "${item.modelName}" 吗？`,
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await deleteModel(item.modelId);
      if (!error) {
        message.success($t('ai.model_manager.delete_success'));
        loadModels();
      }
    }
  });
}

async function handleCopy(item: Api.AI.Admin.Model) {
  const { error } = await copyModel(item.modelId);
  if (!error) {
    message.success($t('ai.model_manager.copy_success'));
    loadModels();
  }
}

async function handleSetDefault(item: Api.AI.Admin.Model) {
  dialog.warning({
    title: $t('ai.model_manager.set_default_model'),
    content: $t('ai.model_manager.set_default_confirm', { name: item.modelName }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await setDefaultModel(item.modelId);
      if (!error) {
        message.success($t('ai.model_manager.update_success'));
        loadModels();
      }
    }
  });
}

const modelTypeTagMap: Record<string, import('naive-ui').TagProps['type']> = {
  '1': 'primary', // LLM
  '2': 'success', // Embedding
  '3': 'warning', // Rerank
  '4': 'error', // Speech
  '5': 'info', // Image
  '6': 'default' // Video
};
</script>

<template>
  <div class="h-full">
    <NCard
      :bordered="false"
      size="small"
      :title="$t('ai.model_manager.model')"
      class="h-full card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <div class="flex items-center gap-3">
          <NInputGroup class="w-100">
            <NSelect v-model:value="searchType" :options="searchOptions" class="w-[35%]" size="small" />
            <NInput
              v-model:value="searchText"
              :placeholder="$t('ai.model_manager.search_placeholder')"
              clearable
              size="small"
              class="w-[65%]"
            >
              <template #prefix>
                <div class="i-carbon-search"></div>
              </template>
            </NInput>
          </NInputGroup>

          <NButton type="primary" ghost size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon local-icon="carbon-add" />
            </template>
            {{ $t('ai.model_manager.add_model') }}
          </NButton>
        </div>
      </template>

      <NSpin :show="loading" class="min-h-0 flex-1">
        <NScrollbar class="h-full" content-class="p-4">
          <NEmpty
            v-if="filteredModels.length === 0"
            :description="$t('ai.model_manager.no_model_data')"
            class="mt-20"
          />
          <div v-else class="model-grid">
            <NCard
              v-for="item in filteredModels"
              :key="item.modelId"
              :bordered="false"
              class="group relative h-45 rounded-lg shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] !border !border-gray-300 !border-solid dark:bg-white/5 dark:!border-gray-700"
              content-class="p-4 h-full"
            >
              <!-- 兜底模型标识 -->
              <div v-if="item.isDefault === 1" class="absolute right-0 top-0 z-10">
                <NTooltip trigger="hover">
                  <template #trigger>
                    <div class="h-6 w-6 flex-center rounded-bl-xl rounded-tr-lg bg-warning text-white shadow-sm">
                      <SvgIcon icon="carbon:star-filled" class="text-xs" />
                    </div>
                  </template>
                  {{ $t('ai.model_manager.default_model') }}
                </NTooltip>
              </div>
              <div
                class="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                <NDropdown
                  trigger="hover"
                  :options="[
                    {
                      label: $t('common.edit'),
                      key: 'edit',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-edit' })
                    },
                    {
                      label: $t('ai.model_manager.copy'),
                      key: 'copy',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-copy' })
                    },
                    ...(['1', '2', '3'].includes(item.modelType)
                      ? [
                          {
                            label: $t('ai.model_manager.set_default_model'),
                            key: 'setDefault',
                            icon: () => h(SvgIcon, { localIcon: 'carbon-star', class: 'text-warning' }),
                            disabled: item.isDefault === 1
                          }
                        ]
                      : []),
                    {
                      label: $t('common.delete'),
                      key: 'delete',
                      icon: () => h(SvgIcon, { localIcon: 'carbon-trash-can', class: 'text-error' }),
                      labelProps: { class: 'text-error' }
                    }
                  ]"
                  @select="
                    key => {
                      if (key === 'edit') handleEdit(item);
                      else if (key === 'copy') handleCopy(item);
                      else if (key === 'setDefault') handleSetDefault(item);
                      else handleDelete(item);
                    }
                  "
                >
                  <NButton quaternary size="small" class="text-gray-500 hover:text-primary">
                    <template #icon>
                      <SvgIcon local-icon="carbon-overflow-menu-horizontal" />
                    </template>
                  </NButton>
                </NDropdown>
              </div>

              <div class="h-full flex flex-col justify-between gap-3">
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
                        <NTag bordered size="small" :type="modelTypeTagMap[item.modelType] || 'info'">
                          {{ aiModelTypeRecord[item.modelType] }}
                        </NTag>
                        <NTag bordered size="small" type="default">
                          {{ aiProviderTypeRecord[item.modelSource] }}
                        </NTag>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-auto flex flex-col gap-2 border-gray-100 text-sm dark:border-gray-800/50">
                  <div v-if="item.apiBase" class="truncate text-xs text-gray-400">
                    {{ item.apiBase }}
                  </div>
                  <div class="flex items-center justify-start gap-4">
                    <span class="flex-shrink-0 text-gray-400">{{ $t('ai.model_manager.base_model') }}</span>
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
                        {{ item.status === '0' ? $t('common.enable') : $t('common.disable') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </NCard>
          </div>
        </NScrollbar>
      </NSpin>
    </NCard>

    <ModelModal ref="modalRef" :providers="props.providers" @success="loadModels" />
  </div>
</template>

<style scoped>
.flex-1-hidden {
  flex: 1;
  overflow: hidden;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}
</style>
