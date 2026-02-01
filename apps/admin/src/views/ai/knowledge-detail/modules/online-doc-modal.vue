<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui';

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

const rules = {
  title: [{ required: true, message: '请输入文档标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文档内容', trigger: 'blur' }]
};
</script>

<template>
  <NModal :show="visible" @update:show="emit('update:visible', $event)">
    <NCard
      :title="document ? '编辑在线文档' : '新建在线文档'"
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
        <NFormItem label="标题" path="title">
          <NInput v-model:value="formData.title" placeholder="请输入文档标题" />
        </NFormItem>

        <NFormItem label="内容" path="content">
          <NInput
            v-model:value="formData.content"
            type="textarea"
            placeholder="请输入文档内容 (支持富文本)"
            :rows="15"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">取消</NButton>
          <NButton type="primary" @click="handleSave">保存</NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
