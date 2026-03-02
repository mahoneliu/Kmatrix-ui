<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NModal, NSpace, NTabPane, NTabs } from 'naive-ui';
import { $t } from '@/locales';

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

const rules = computed(() => ({
  singleUrl: [
    { required: true, message: $t('ai.knowledge_detail.webLinkModal.singleUrlRequired'), trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: $t('ai.knowledge_detail.webLinkModal.singleUrlInvalid'),
      trigger: 'blur'
    }
  ],
  batchUrls: [{ required: true, message: $t('ai.knowledge_detail.webLinkModal.batchUrlsRequired'), trigger: 'blur' }]
}));
</script>

<template>
  <NModal :show="visible" @update:show="emit('update:visible', $event)">
    <NCard
      :title="$t('ai.knowledge_detail.webLinkModal.addBtn')"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="w-[700px]"
    >
      <template #header-extra>
        <NButton quaternary circle @click="handleClose">
          <template #icon>
            <icon-mdi-close />
          </template>
        </NButton>
      </template>

      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="single" :tab="$t('ai.knowledge_detail.webLinkModal.singleTab')">
          <NForm ref="formRef" :model="{ singleUrl }" :rules="rules" label-placement="left" label-width="80">
            <NFormItem :label="$t('ai.knowledge_detail.webLinkModal.url')" path="singleUrl">
              <NInput
                v-model:value="singleUrl"
                :placeholder="$t('ai.knowledge_detail.webLinkModal.urlPlaceholder')"
                clearable
              />
            </NFormItem>
          </NForm>
        </NTabPane>

        <NTabPane name="batch" :tab="$t('ai.knowledge_detail.webLinkModal.batchTab')">
          <NForm ref="formRef" :model="{ batchUrls }" :rules="rules" label-placement="top">
            <NFormItem :label="$t('ai.knowledge_detail.webLinkModal.batchUrlLabel')" path="batchUrls">
              <NInput
                v-model:value="batchUrls"
                type="textarea"
                :placeholder="$t('ai.knowledge_detail.webLinkModal.batchUrlPlaceholder')"
                :rows="10"
              />
            </NFormItem>
          </NForm>
        </NTabPane>
      </NTabs>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">
            <template #icon>
              <icon-mdi-link-plus />
            </template>
            {{ $t('ai.knowledge_detail.webLinkModal.addBtn') }}
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </NModal>
</template>
