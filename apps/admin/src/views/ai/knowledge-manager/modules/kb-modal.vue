<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSpace, useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { addKnowledgeBase, updateKnowledgeBase } from '@/service/api/ai/knowledge';

interface Props {
  visible?: boolean;
  data?: Api.AI.KB.KnowledgeBase | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
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

const formData = ref<Partial<Api.AI.KB.KnowledgeBase>>({
  name: '',
  description: '',
  permissionLevel: 'PRIVATE'
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过50个字符', trigger: 'blur' }
  ]
};

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.data) {
        formData.value = {
          id: props.data.id,
          name: props.data.name,
          description: props.data.description,
          permissionLevel: props.data.permissionLevel || 'PRIVATE'
        };
      } else {
        formData.value = {
          name: '',
          description: '',
          permissionLevel: 'PRIVATE'
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
      await updateKnowledgeBase(formData.value);
      message.success('更新成功');
    } else {
      await addKnowledgeBase(formData.value);
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
    :title="isEdit ? '编辑知识库' : '新建知识库'"
    class="w-500px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
      <NFormItem label="名称" path="name">
        <NInput v-model:value="formData.name" placeholder="请输入知识库名称" maxlength="50" />
      </NFormItem>
      <NFormItem label="描述" path="description">
        <NInput
          v-model:value="formData.description"
          type="textarea"
          placeholder="请输入知识库描述"
          :rows="3"
          maxlength="200"
        />
      </NFormItem>
      <!--
 <NFormItem label="权限" path="permissionLevel">
        <NSelect v-model:value="formData.permissionLevel" :options="permissionOptions" placeholder="选择权限级别" />
      </NFormItem> 
-->
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
