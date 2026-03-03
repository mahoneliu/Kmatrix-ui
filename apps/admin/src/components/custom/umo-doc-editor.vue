<script lang="ts" setup>
import { nextTick, ref, useAttrs, watch } from 'vue';
import type { UmoEditorOptions } from '@umoteam/editor';
import { UmoEditor } from '@umoteam/editor';
import { fetchBatchDeleteOss, fetchUploadFile } from '@/service/api/system/oss';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

defineOptions({
  name: 'UmoDocEditor'
});

const attrs: UmoEditorOptions = useAttrs();
const appStore = useAppStore();
const themeStore = useThemeStore();
const umoEditorRef = ref<InstanceType<typeof UmoEditor>>();
const isSave = ref(false);

const value = defineModel<string>('value', { required: true, default: '' });

watch(
  value,
  () => {
    nextTick(() => {
      if (isSave.value) {
        isSave.value = false;
        return;
      }
      umoEditorRef.value?.setContent(value.value);
    });
  },
  {
    immediate: true
  }
);

watch(
  () => appStore.locale,
  () => {
    umoEditorRef.value?.setLocale(appStore.locale);
  }
);

async function handleSave(content: { html: string }) {
  isSave.value = true;
  value.value = content.html;
  return true;
}

async function handleFileUpload(file: File) {
  const { error, data } = await fetchUploadFile(file);
  if (error) throw new Error(error.message || $t('common.importFail'));

  return {
    id: data.ossId,
    url: data.url
  };
}

function handleFileDelete(id: CommonType.IdType) {
  window.$dialog?.warning({
    title: $t('common.confirmDeleteFile'),
    content: $t('common.deleteConfirmMsg'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      const { error } = await fetchBatchDeleteOss([id]);
      if (error) throw new Error(error.message || $t('common.fetchListFail'));
    }
  });
  return true;
}

defineExpose({
  saveContent: () => umoEditorRef.value?.saveContent()
});
</script>

<template>
  <div class="umo-editor size-full">
    <UmoEditor
      v-bind="attrs"
      ref="umoEditorRef"
      :theme="themeStore.darkMode ? 'dark' : 'light'"
      @save="handleSave"
      @file-upload="handleFileUpload"
      @file-delete="handleFileDelete"
    />
  </div>
</template>

<style>
body .flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.umo-editor .flex-center {
  display: inherit !important;
  align-items: inherit !important;
  justify-content: inherit !important;
}
</style>
