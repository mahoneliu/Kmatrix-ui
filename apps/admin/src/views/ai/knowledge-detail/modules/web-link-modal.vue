<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NModal, NSpace, NTabPane, NTabs } from 'naive-ui';

interface Props {
  visible?: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'submit', data: { urls: string[] }): void;
}

withDefaults(defineProps<Props>(), {
  visible: false
});

const emit = defineEmits<Emits>();

const formRef = ref();
const activeTab = ref('single');
const singleUrl = ref('');
const batchUrls = ref('');

const handleClose = () => {
  emit('update:visible', false);
  singleUrl.value = '';
  batchUrls.value = '';
  activeTab.value = 'single';
};

const handleSubmit = () => {
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      let urls: string[] = [];

      if (activeTab.value === 'single') {
        urls = [singleUrl.value];
      } else {
        // 批量导入: 按行分割
        urls = batchUrls.value
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }

      if (urls.length > 0) {
        emit('submit', { urls });
        handleClose();
      }
    }
  });
};

const rules = {
  singleUrl: [
    { required: true, message: '请输入网页链接', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: '请输入有效的 URL (以 http:// 或 https:// 开头)',
      trigger: 'blur'
    }
  ],
  batchUrls: [{ required: true, message: '请输入网页链接 (每行一个)', trigger: 'blur' }]
};
</script>

<template>
  <NModal :show="visible" @update:show="emit('update:visible', $event)">
    <NCard title="添加网页链接" :bordered="false" size="huge" role="dialog" aria-modal="true" class="w-[700px]">
      <template #header-extra>
        <NButton quaternary circle @click="handleClose">
          <template #icon>
            <icon-mdi-close />
          </template>
        </NButton>
      </template>

      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="single" tab="单个链接">
          <NForm ref="formRef" :model="{ singleUrl }" :rules="rules" label-placement="left" label-width="80">
            <NFormItem label="URL" path="singleUrl">
              <NInput v-model:value="singleUrl" placeholder="https://example.com" clearable />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="batch" tab="批量导入">
          <NForm ref="formRef" :model="{ batchUrls }" :rules="rules" label-placement="top">
            <NFormItem label="URL 列表 (每行一个)" path="batchUrls">
              <NInput
                v-model:value="batchUrls"
                type="textarea"
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                :rows="10"
              />
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">取消</NButton>
          <NButton type="primary" @click="handleSubmit">
            <template #icon>
              <icon-mdi-link-plus />
            </template>
            添加
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
