<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace, useMessage } from 'naive-ui';
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

const formData = ref<Partial<Api.AI.KB.Dataset>>({
  kbId: '',
  name: '',
  type: 'FILE'
});

const typeOptions = [
  { label: '文件上传', value: 'FILE' },
  { label: '网页爬取', value: 'WEB' },
  { label: '手动录入', value: 'MANUAL' }
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入数据集名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择数据集类型', trigger: 'blur' }]
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
          type: props.data.type || 'FILE'
        };
      } else {
        formData.value = {
          kbId: props.kbId,
          name: '',
          type: 'FILE'
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
    class="w-450px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="名称" path="name">
        <NInput v-model:value="formData.name" placeholder="请输入数据集名称" maxlength="50" />
      </NFormItem>
      <NFormItem label="类型" path="type">
        <NSelect v-model:value="formData.type" :options="typeOptions" placeholder="选择数据集类型" :disabled="isEdit" />
      </NFormItem>
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
