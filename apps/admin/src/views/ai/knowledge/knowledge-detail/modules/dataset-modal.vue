<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NCollapse,
  NCollapseItem,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NText,
  useMessage
} from 'naive-ui';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import { addDataset, updateDataset } from '@/service/api/ai/knowledge';
import { fetchFileProcessApps } from '@/service/api/ai/app';
import { $t } from '@/locales';

interface Props {
  visible?: boolean;
  kbId?: string;
  data?: Api.AI.KB.Dataset | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  kbId: '',
  data: null
});

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

// 工作流应用选项
const workflowAppOptions = ref<SelectOption[]>([]);
const loadingApps = ref(false);

async function loadWorkflowApps() {
  if (loadingApps.value) return;
  loadingApps.value = true;
  try {
    const { data } = await fetchFileProcessApps();
    workflowAppOptions.value = (data?.rows || []).map(app => ({
      label: app.appName,
      value: app.appId,
      disabled: app.status !== '1' // 仅已发布应用可选
    }));
  } finally {
    loadingApps.value = false;
  }
}

const formData = ref<Partial<Api.AI.KB.Dataset>>({
  kbId: '',
  name: '',
  type: 'FILE',
  processType: 'GENERIC_FILE',
  sourceType: 'FILE_UPLOAD',
  minChunkSize: 100,
  maxChunkSize: 500,
  chunkOverlap: 50
});

const isEdit = computed(() => Boolean(props.data?.id));
const isSystem = computed(() => Boolean(props.data?.isSystem));
const isWorkflowType = computed(() => formData.value.processType === 'WORKFLOW_FILE');

const typeOptions = computed(() => [
  { label: $t('ai.knowledge_detail.datasetModal.typeOptions.FILE'), value: 'FILE' },
  { label: $t('ai.knowledge_detail.datasetModal.typeOptions.WEB'), value: 'WEB' },
  { label: $t('ai.knowledge_detail.datasetModal.typeOptions.MANUAL'), value: 'MANUAL' }
]);

const processTypeOptions = computed(() => [
  { label: $t('ai.knowledge_detail.datasetModal.processTypeOptions.GENERIC_FILE'), value: 'GENERIC_FILE' },
  { label: $t('ai.knowledge_detail.datasetModal.processTypeOptions.QA_PAIR'), value: 'QA_PAIR' },
  { label: $t('ai.knowledge_detail.datasetModal.processTypeOptions.ONLINE_DOC'), value: 'ONLINE_DOC' },
  { label: $t('ai.knowledge_detail.datasetModal.processTypeOptions.WEB_LINK'), value: 'WEB_LINK' },
  { label: $t('ai.knowledge_detail.datasetModal.processTypeOptions.WORKFLOW_FILE'), value: 'WORKFLOW_FILE' }
]);

const sourceTypeOptions = computed(() => [
  { label: $t('ai.knowledge_detail.datasetModal.sourceTypeOptions.FILE_UPLOAD'), value: 'FILE_UPLOAD' },
  { label: $t('ai.knowledge_detail.datasetModal.sourceTypeOptions.TEXT_INPUT'), value: 'TEXT_INPUT' },
  { label: $t('ai.knowledge_detail.datasetModal.sourceTypeOptions.WEB_CRAWL'), value: 'WEB_CRAWL' }
]);

const rules = computed<FormRules>(() => ({
  name: [
    { required: true, message: $t('ai.knowledge_detail.datasetModal.nameRequired'), trigger: 'blur' },
    { max: 50, message: $t('ai.knowledge_detail.datasetModal.nameMaxLength'), trigger: 'blur' }
  ],
  type: [{ required: true, message: $t('ai.knowledge_detail.datasetModal.typeRequired'), trigger: 'blur' }],
  processType: [
    { required: true, message: $t('ai.knowledge_detail.datasetModal.processTypeRequired'), trigger: 'blur' }
  ]
}));

watch(
  () => props.visible,
  val => {
    if (val) {
      loadWorkflowApps();
      if (props.data) {
        formData.value = {
          id: props.data.id,
          kbId: props.data.kbId,
          name: props.data.name,
          type: props.data.type || 'FILE',
          processType: props.data.processType || 'GENERIC_FILE',
          sourceType: props.data.sourceType || 'FILE_UPLOAD',
          workflowId: props.data.workflowId ?? null,
          maxConcurrency: props.data.maxConcurrency ?? 1,
          minChunkSize: props.data.minChunkSize ?? 100,
          maxChunkSize: props.data.maxChunkSize ?? 500,
          chunkOverlap: props.data.chunkOverlap ?? 50
        };
      } else {
        formData.value = {
          kbId: props.kbId,
          name: '',
          type: 'FILE',
          processType: 'GENERIC_FILE',
          sourceType: 'FILE_UPLOAD',
          workflowId: null,
          maxConcurrency: 1,
          minChunkSize: 100,
          maxChunkSize: 500,
          chunkOverlap: 50,
          childChunkSize: 200,
          childChunkOverlap: 20
        };
      }
    }
  }
);

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateDataset(formData.value);
      message.success($t('ai.knowledge_detail.datasetModal.updateSuccess'));
    } else {
      await addDataset(formData.value);
      message.success($t('ai.knowledge_detail.datasetModal.createSuccess'));
    }
    emit('success');
    emit('update:visible', false);
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  emit('update:visible', false);
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    :title="
      isEdit ? $t('ai.knowledge_detail.datasetModal.editDataset') : $t('ai.knowledge_detail.datasetModal.createDataset')
    "
    class="w-500px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NAlert v-if="isSystem" type="info" class="mb-4">{{ $t('ai.knowledge_detail.datasetModal.systemPreset') }}</NAlert>

    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100">
      <NFormItem :label="$t('ai.knowledge_detail.datasetModal.name')" path="name">
        <NInput
          v-model:value="formData.name"
          :placeholder="$t('ai.knowledge_detail.datasetModal.namePlaceholder')"
          maxlength="50"
          :disabled="isSystem"
        />
      </NFormItem>
      <NFormItem :label="$t('ai.knowledge_detail.datasetModal.type')" path="type">
        <NSelect
          v-model:value="formData.type"
          :options="typeOptions"
          :placeholder="$t('ai.knowledge_detail.datasetModal.typePlaceholder')"
          :disabled="isEdit"
        />
      </NFormItem>
      <NFormItem :label="$t('ai.knowledge_detail.datasetModal.processType')" path="processType">
        <NSelect
          v-model:value="formData.processType"
          :options="processTypeOptions"
          :placeholder="$t('ai.knowledge_detail.datasetModal.processTypePlaceholder')"
          :disabled="isSystem"
        />
      </NFormItem>
      <NFormItem :label="$t('ai.knowledge_detail.datasetModal.sourceType')" path="sourceType">
        <NSelect
          v-model:value="formData.sourceType"
          :options="sourceTypeOptions"
          :placeholder="$t('ai.knowledge_detail.datasetModal.sourceTypePlaceholder')"
          :disabled="isSystem"
        />
      </NFormItem>

      <!-- 工作流处理时：绑定应用 -->
      <template v-if="isWorkflowType">
        <NFormItem :label="$t('ai.knowledge_detail.datasetModal.workflowId')" path="workflowId">
          <div class="w-full flex flex-col gap-1">
            <NSelect
              v-model:value="formData.workflowId"
              :options="workflowAppOptions"
              :loading="loadingApps"
              clearable
              :placeholder="$t('ai.knowledge_detail.datasetModal.workflowIdPlaceholder')"
            />
            <NText depth="3" class="text-xs">
              {{ $t('ai.knowledge_detail.datasetModal.workflowIdTip') }}
            </NText>
          </div>
        </NFormItem>
        <NFormItem :label="$t('ai.knowledge_detail.datasetModal.maxConcurrency')" path="maxConcurrency">
          <NInputNumber
            v-model:value="formData.maxConcurrency"
            :min="1"
            :max="10"
            :placeholder="$t('ai.knowledge_detail.datasetModal.maxConcurrencyPlaceholder')"
            class="w-full"
          />
        </NFormItem>
      </template>

      <NCollapse>
        <NCollapseItem :title="$t('ai.knowledge_detail.datasetModal.chunkSetting')" name="chunk">
          <NFormItem :label="$t('ai.knowledge_detail.datasetModal.minChunkSize')" path="minChunkSize">
            <NInputNumber
              v-model:value="formData.minChunkSize"
              :min="10"
              :max="1000"
              :placeholder="$t('ai.knowledge_detail.datasetModal.minChunkSizePlaceholder')"
              class="w-full"
            />
          </NFormItem>
          <NFormItem :label="$t('ai.knowledge_detail.datasetModal.maxChunkSize')" path="maxChunkSize">
            <NInputNumber
              v-model:value="formData.maxChunkSize"
              :min="50"
              :max="2000"
              :placeholder="$t('ai.knowledge_detail.datasetModal.maxChunkSizePlaceholder')"
              class="w-full"
            />
          </NFormItem>
          <NFormItem :label="$t('ai.knowledge_detail.datasetModal.chunkOverlap')" path="chunkOverlap">
            <NInputNumber
              v-model:value="formData.chunkOverlap"
              :min="0"
              :max="500"
              :placeholder="$t('ai.knowledge_detail.datasetModal.chunkOverlapPlaceholder')"
              class="w-full"
            />
          </NFormItem>
          <NFormItem :label="$t('ai.knowledge_detail.datasetModal.childChunkSize')" path="childChunkSize">
            <NInputNumber
              v-model:value="formData.childChunkSize"
              :min="50"
              :max="1000"
              :placeholder="$t('ai.knowledge_detail.datasetModal.childChunkSizePlaceholder')"
              clearable
              class="w-full"
            />
          </NFormItem>
          <NFormItem :label="$t('ai.knowledge_detail.datasetModal.childChunkOverlap')" path="childChunkOverlap">
            <NInputNumber
              v-model:value="formData.childChunkOverlap"
              :min="0"
              :max="200"
              :placeholder="$t('ai.knowledge_detail.datasetModal.childChunkOverlapPlaceholder')"
              clearable
              class="w-full"
            />
          </NFormItem>
        </NCollapseItem>
      </NCollapse>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleCancel">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? $t('ai.knowledge_detail.datasetModal.save') : $t('ai.knowledge_detail.datasetModal.create') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
