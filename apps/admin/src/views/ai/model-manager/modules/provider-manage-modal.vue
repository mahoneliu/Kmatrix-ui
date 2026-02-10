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
  models: Array<{ key: string; type: string }>;
}>({
  providerId: null,
  providerName: '',
  models: []
});

const modelTypeOptions = [
  { label: '语言模型', value: '1' },
  { label: '向量模型', value: '2' }
];

const columns = [
  {
    title: '模型标识',
    key: 'key',
    render: (row: any, index: number) => {
      return h(NInput, {
        value: row.key,
        placeholder: '例如: gpt-4',
        onUpdateValue: (val: string) => {
          formData.value.models[index].key = val;
        }
      });
    }
  },
  {
    title: '模型类型',
    key: 'type',
    width: 150,
    render: (row: any, index: number) => {
      return h(NSelect, {
        value: row.type,
        options: modelTypeOptions,
        onUpdateValue: (val: string) => {
          formData.value.models[index].type = val;
        }
      });
    }
  },
  {
    title: '操作',
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
          default: () => '确认删除此模型?',
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                text: true
              },
              { default: () => '删除' }
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
      models: data.models ? JSON.parse(data.models) : []
    };
  }
}

function handleAddModel() {
  formData.value.models.push({ key: '', type: '1' });
}

function handleDeleteModel(index: number) {
  formData.value.models.splice(index, 1);
}

async function handleSubmit() {
  if (!formData.value.providerId) {
    message.warning('请选择供应商');
    return;
  }

  // 验证模型数据
  const hasEmpty = formData.value.models.some(m => !m.key.trim());
  if (hasEmpty) {
    message.warning('请填写所有模型标识');
    return;
  }

  loading.value = true;
  const { error } = await updateProvider({
    providerId: formData.value.providerId,
    models: JSON.stringify(formData.value.models)
  });
  loading.value = false;

  if (!error) {
    message.success('更新成功');
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
  <NModal :show="visible" preset="card" class="w-[900px]" title="供应商模型管理" @update:show="handleClose">
    <NForm label-placement="left" label-width="100">
      <NFormItem label="选择供应商">
        <NSelect v-model:value="selectedProviderId" :options="providerOptions" placeholder="请选择供应商" filterable />
      </NFormItem>

      <NFormItem v-if="formData.providerId" label="供应商名称">
        <NInput :value="formData.providerName" readonly />
      </NFormItem>

      <NFormItem v-if="formData.providerId" label="支持的模型">
        <div class="w-full">
          <div class="mb-2 flex justify-end">
            <NButton size="small" type="primary" @click="handleAddModel">
              <template #icon>
                <SvgIcon icon="carbon:add" />
              </template>
              添加模型
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
            暂无模型,点击上方按钮添加
          </div>
        </div>
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :loading="loading" :disabled="!formData.providerId" @click="handleSubmit">保存</NButton>
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
