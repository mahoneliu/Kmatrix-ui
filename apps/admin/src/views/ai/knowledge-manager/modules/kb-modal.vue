<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSpace, useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { addKnowledgeBase, updateKnowledgeBase } from '@/service/api/ai/knowledge';
import { $t } from '@/locales';

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
    { required: true, message: $t('ai.knowledge_manager.modal.nameRequired'), trigger: 'blur' },
    { max: 50, message: $t('ai.knowledge_manager.modal.nameMaxLength'), trigger: 'blur' }
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
      message.success($t('ai.knowledge_manager.modal.updateSuccess'));
    } else {
      await addKnowledgeBase(formData.value);
      message.success($t('ai.knowledge_manager.modal.addSuccess'));
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
    :title="isEdit ? $t('ai.knowledge_manager.modal.edit') : $t('ai.knowledge_manager.createKnowledgeBase')"
    class="w-500px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
      <NFormItem :label="$t('ai.knowledge_manager.modal.name')" path="name">
        <NInput
          v-model:value="formData.name"
          :placeholder="$t('ai.knowledge_manager.modal.namePlaceholder')"
          maxlength="50"
        />
      </NFormItem>
      <NFormItem :label="$t('ai.knowledge_manager.modal.description')" path="description">
        <NInput
          v-model:value="formData.description"
          type="textarea"
          :placeholder="$t('ai.knowledge_manager.modal.descPlaceholder')"
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
        <NButton @click="handleCancel">{{ $t('ai.knowledge_manager.modal.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? $t('ai.knowledge_manager.modal.save') : $t('ai.knowledge_manager.modal.create') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
