<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchProviderDetail, fetchProviderList, updateProvider } from '@/service/api/ai/provider';
import { $t } from '@/locales';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const loading = ref(false);
const providerList = ref<Api.AI.Admin.ModelProvider[]>([]);
const selectedProviderId = ref<CommonType.IdType | null>(null);
const formData = ref<{
  providerId: CommonType.IdType | null;
  providerName: string;
  defaultEndpoint: string | null;
  siteUrl: string | null;
  models: Array<{ modelKey: string; modelType: string }>;
}>({
  providerId: null,
  providerName: '',
  defaultEndpoint: null,
  siteUrl: null,
  models: []
});

const modelTypeOptions = [
  { label: $t('ai.model_manager.language_model'), value: '1' },
  { label: $t('ai.model_manager.vector_model'), value: '2' }
];

const columns = [
  {
    title: $t('ai.model_manager.model_key'),
    key: 'modelKey',
    render: (row: any, index: number) => {
      return h(NInput, {
        value: row.modelKey,
        placeholder: $t('ai.model_manager.model_name_placeholder'),
        onUpdateValue: (val: string) => {
          formData.value.models[index].modelKey = val;
        }
      });
    }
  },
  {
    title: $t('ai.model_manager.model_type'),
    key: 'modelType',
    width: 150,
    render: (row: any, index: number) => {
      return h(NSelect, {
        value: row.modelType,
        options: modelTypeOptions,
        onUpdateValue: (val: string) => {
          formData.value.models[index].modelType = val;
        }
      });
    }
  },
  {
    title: $t('ai.model_manager.operation'),
    key: 'actions',
    width: 80,
    align: 'center' as const,
    render: (_row: any, index: number) => {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => handleDeleteModel(index)
        },
        {
          default: () => $t('ai.model_manager.delete_model_confirm_simple'),
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true
              },
              { default: () => $t('common.delete') }
            )
        }
      );
    }
  }
];

const providerOptions = computed(() => {
  return providerList.value.map(p => ({
    label: p.providerName,
    value: p.providerId
  }));
});

async function loadProviders() {
  const { data } = await fetchProviderList();
  if (data) {
    providerList.value = data;
  }
}

async function loadProviderDetail(providerId: CommonType.IdType) {
  loading.value = true;
  const { data, error } = await fetchProviderDetail(providerId);
  loading.value = false;

  if (!error && data) {
    formData.value = {
      providerId: data.providerId,
      providerName: data.providerName,
      defaultEndpoint: data.defaultEndpoint || null,
      siteUrl: data.siteUrl || null,
      models: data.models
        ? JSON.parse(data.models).map((m: any) => ({
            modelKey: m.modelKey || m.key || (typeof m === 'string' ? m : ''),
            modelType: m.modelType || m.type || '1'
          }))
        : []
    };
  }
}

function handleAddModel() {
  formData.value.models.push({ modelKey: '', modelType: '1' });
}

function handleDeleteModel(index: number) {
  formData.value.models.splice(index, 1);
}

async function handleSubmit() {
  if (!formData.value.providerId) {
    message.warning($t('ai.model_manager.select_provider'));
    return;
  }

  // 验证模型数据
  const hasEmpty = formData.value.models.some(m => !m.modelKey.trim());
  if (hasEmpty) {
    message.warning($t('ai.model_manager.fill_all_model_keys'));
    return;
  }

  loading.value = true;
  const { error } = await updateProvider({
    providerId: formData.value.providerId,
    defaultEndpoint: formData.value.defaultEndpoint,
    siteUrl: formData.value.siteUrl,
    models: JSON.stringify(formData.value.models)
  });
  loading.value = false;

  if (!error) {
    message.success($t('ai.model_manager.update_success'));
    emit('success');
    handleClose();
  }
}

function handleClose() {
  emit('update:visible', false);
  selectedProviderId.value = null;
  formData.value = {
    providerId: null,
    providerName: '',
    defaultEndpoint: null,
    siteUrl: null,
    models: []
  };
}

watch(
  () => props.visible,
  val => {
    if (val) {
      loadProviders();
    }
  }
);

watch(selectedProviderId, val => {
  if (val) {
    loadProviderDetail(val);
  }
});
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    class="w-[900px]"
    :title="$t('ai.model_manager.provider.manage')"
    @update:show="handleClose"
  >
    <NForm label-placement="left" label-width="100">
      <NFormItem :label="$t('ai.model_manager.test.current_model')">
        <NSelect
          v-model:value="selectedProviderId"
          :options="providerOptions"
          :placeholder="$t('ai.model_manager.select_provider')"
          filterable
        />
      </NFormItem>

      <NFormItem v-if="formData.providerId" :label="$t('ai.model_manager.provider_name')">
        <NInput :value="formData.providerName" readonly />
      </NFormItem>

      <NFormItem v-if="formData.providerId" :label="$t('ai.model_manager.default_endpoint')">
        <NInput v-model:value="formData.defaultEndpoint" :placeholder="$t('ai.model_manager.input_default_endpoint')" />
      </NFormItem>

      <NFormItem v-if="formData.providerId" :label="$t('ai.model_manager.site_url')">
        <NInput v-model:value="formData.siteUrl" :placeholder="$t('ai.model_manager.input_site_url')" />
      </NFormItem>

      <NFormItem v-if="formData.providerId" :label="$t('ai.model_manager.supported_models')">
        <div class="w-full">
          <div class="mb-2 flex justify-end">
            <NButton size="small" type="primary" @click="handleAddModel">
              <template #icon>
                <SvgIcon icon="carbon:add" />
              </template>
              {{ $t('ai.model_manager.add_model') }}
            </NButton>
          </div>

          <NDataTable
            :columns="columns"
            :data="formData.models"
            :pagination="false"
            :bordered="true"
            size="small"
            max-height="400"
          />

          <div v-if="formData.models.length === 0" class="py-8 text-center text-gray-400">
            {{ $t('ai.model_manager.provider.no_models_tip') }}
          </div>
        </div>
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" :disabled="!formData.providerId" @click="handleSubmit">
          {{ $t('common.save') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
:deep(.n-data-table) {
  --n-th-padding: 8px 12px;
  --n-td-padding: 8px 12px;
}
</style>
