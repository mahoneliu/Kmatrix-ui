<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NForm, NFormItem, NInput, NModal } from 'naive-ui';
import { addApp } from '@/service/api/ai/app';

interface Props {
  visible: boolean;
  appType?: '1' | '2';
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', appId?: CommonType.IdType): void;
}
type AppFormModel = Partial<Api.AI.Admin.App>;

const props = withDefaults(defineProps<Props>(), {
  appType: '1'
});

const emit = defineEmits<Emits>();

const formRef = ref<(HTMLElement & { validate: () => Promise<void> }) | null>(null);

const formModel = ref<AppFormModel>({
  appId: undefined,
  appName: '',
  description: '',
  icon: '',
  appType: props.appType,
  status: '0',
  remark: '',
  createTime: '',
  updateTime: ''
});

const rules = {
  appName: { required: true, message: '请输入应用名称', trigger: 'blur' }
};

async function handleSubmit() {
  await formRef.value?.validate();

  const res = await addApp(formModel.value);
  const createdAppId = res.data;
  emit('success', createdAppId);
}

watch(
  () => props.visible,
  val => {
    if (val) {
      formModel.value = {
        appId: undefined,
        appName: '',
        description: '',
        appType: props.appType,
        status: '0'
      };
    }
  }
);
</script>

<template>
  <NModal
    :show="visible"
    title="新建应用"
    class="w-800px"
    preset="card"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <NFormItem label="应用名称" path="appName">
        <NInput v-model:value="formModel.appName" placeholder="请输入应用名称" />
      </NFormItem>
      <NFormItem label="应用描述" path="description">
        <NInput v-model:value="formModel.description" placeholder="请输入应用描述" type="textarea" />
      </NFormItem>
    </NForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton @click="emit('update:visible', false)">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
