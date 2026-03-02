<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';
import { $t } from '@/locales';

interface Props {
  visible?: boolean;
  document?: any;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: { title: string; content: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  document: null
});

const emit = defineEmits<Emits>();

const formRef = ref();
const formData = ref({
  title: '',
  content: ''
});

// 监听 document 变化,用于编辑模式
watch(
  () => props.document,
  doc => {
    if (doc) {
      formData.value.title = doc.title || '';
      formData.value.content = doc.content || '';
    } else {
      formData.value.title = '';
      formData.value.content = '';
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit('update:visible', false);
  formData.value = { title: '', content: '' };
};

const handleSave = () => {
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      emit('save', { ...formData.value });
      handleClose();
    }
  });
};

const rules = computed(() => ({
  title: [{ required: true, message: $t('ai.knowledge_detail.onlineDocModal.titleRequired'), trigger: 'blur' }],
  content: [{ required: true, message: $t('ai.knowledge_detail.onlineDocModal.contentRequired'), trigger: 'blur' }]
}));
</script>

<template>
  <NModal :show="visible" @update:show="emit('update:visible', $event)">
    <NCard
      :title="document ? $t('ai.knowledge_detail.onlineDocModal.edit') : $t('ai.knowledge_detail.onlineDocModal.add')"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="w-[800px]"
    >
      <template #header-extra>
        <NButton quaternary circle @click="handleClose">
          <template #icon>
            <icon-mdi-close />
          </template>
        </NButton>
      </template>

      <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
        <NFormItem :label="$t('ai.knowledge_detail.onlineDocModal.title')" path="title">
          <NInput
            v-model:value="formData.title"
            :placeholder="$t('ai.knowledge_detail.onlineDocModal.titlePlaceholder')"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.knowledge_detail.onlineDocModal.content')" path="content">
          <NInput
            v-model:value="formData.content"
            type="textarea"
            :placeholder="$t('ai.knowledge_detail.onlineDocModal.contentPlaceholder')"
            :rows="15"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSave">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
