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
  useMessage
} from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { addDataset, updateDataset } from '@/service/api/ai/knowledge';

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

const isEdit = computed(() => Boolean(props.data?.id));
const isSystem = computed(() => Boolean(props.data?.isSystem));

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

const typeOptions = [
  { label: '文件上传', value: 'FILE' },
  { label: '网页爬取', value: 'WEB' },
  { label: '手动录入', value: 'MANUAL' }
];

const processTypeOptions = [
  { label: '通用文件 (PDF/Word/TXT)', value: 'GENERIC_FILE' },
  { label: 'QA问答对 (Excel/CSV)', value: 'QA_PAIR' },
  { label: '在线文档', value: 'ONLINE_DOC' },
  { label: '网页链接', value: 'WEB_LINK' }
];

const sourceTypeOptions = [
  { label: '上传文件', value: 'FILE_UPLOAD' },
  { label: '文本输入', value: 'TEXT_INPUT' },
  { label: '网页爬取', value: 'WEB_CRAWL' }
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入数据集名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择数据集类型', trigger: 'blur' }],
  processType: [{ required: true, message: '请选择处理方式', trigger: 'blur' }]
};

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.data) {
        formData.value = {
          id: props.data.id,
          kbId: props.data.kbId,
          name: props.data.name,
          type: props.data.type || 'FILE',
          processType: props.data.processType || 'GENERIC_FILE',
          sourceType: props.data.sourceType || 'FILE_UPLOAD',
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
      message.success('更新成功');
    } else {
      await addDataset(formData.value);
      message.success('创建成功');
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
    :title="isEdit ? '编辑数据集' : '新建数据集'"
    class="w-500px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NAlert v-if="isSystem" type="info" class="mb-4">系统预设数据集，部分设置不可修改</NAlert>

    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="100">
      <NFormItem label="名称" path="name">
        <NInput v-model:value="formData.name" placeholder="请输入数据集名称" maxlength="50" :disabled="isSystem" />
      </NFormItem>
      <NFormItem label="类型" path="type">
        <NSelect v-model:value="formData.type" :options="typeOptions" placeholder="选择数据集类型" :disabled="isEdit" />
      </NFormItem>
      <NFormItem label="处理方式" path="processType">
        <NSelect
          v-model:value="formData.processType"
          :options="processTypeOptions"
          placeholder="选择处理方式"
          :disabled="isSystem"
        />
      </NFormItem>
      <NFormItem label="来源类型" path="sourceType">
        <NSelect
          v-model:value="formData.sourceType"
          :options="sourceTypeOptions"
          placeholder="选择数据来源类型"
          :disabled="isSystem"
        />
      </NFormItem>

      <NCollapse>
        <NCollapseItem title="分块设置" name="chunk">
          <NFormItem label="最小分块" path="minChunkSize">
            <NInputNumber
              v-model:value="formData.minChunkSize"
              :min="10"
              :max="1000"
              placeholder="最小 Token 数"
              class="w-full"
            />
          </NFormItem>
          <NFormItem label="最大分块" path="maxChunkSize">
            <NInputNumber
              v-model:value="formData.maxChunkSize"
              :min="50"
              :max="2000"
              placeholder="最大 Token 数"
              class="w-full"
            />
          </NFormItem>
          <NFormItem label="重叠大小" path="chunkOverlap">
            <NInputNumber
              v-model:value="formData.chunkOverlap"
              :min="0"
              :max="500"
              placeholder="重叠 Token 数"
              class="w-full"
            />
          </NFormItem>
          <NFormItem label="子块大小(可选)" path="childChunkSize">
            <NInputNumber
              v-model:value="formData.childChunkSize"
              :min="50"
              :max="1000"
              placeholder="留空即使用系统默认大小"
              clearable
              class="w-full"
            />
          </NFormItem>
          <NFormItem label="子块重叠(可选)" path="childChunkOverlap">
            <NInputNumber
              v-model:value="formData.childChunkOverlap"
              :min="0"
              :max="200"
              placeholder="留空即使用系统默认大小"
              clearable
              class="w-full"
            />
          </NFormItem>
        </NCollapseItem>
      </NCollapse>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleCancel">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
