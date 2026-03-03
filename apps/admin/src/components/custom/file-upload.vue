<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { UploadFileInfo, UploadProps } from 'naive-ui';
import { fetchBatchDeleteOss } from '@/service/api/system/oss';
import { getToken } from '@/store/modules/auth/shared';
import { getServiceBaseURL } from '@/utils/service';
import { AcceptType } from '@/enum/business';
import { $t } from '@/locales';

defineOptions({
  name: 'FileUpload'
});

interface Props {
  action?: string;
  data?: Record<string, any>;
  defaultUpload?: boolean;
  showTip?: boolean;
  max?: number;
  accept?: string;
  fileSize?: number;
  uploadType?: 'file' | 'image';
}

const props = withDefaults(defineProps<Props>(), {
  action: `/resource/oss/upload`,
  data: undefined,
  defaultUpload: true,
  showTip: true,
  max: 5,
  accept: undefined,
  fileSize: 5,
  uploadType: 'file'
});

const accept = computed(() => {
  if (props.accept) {
    return props.accept;
  }
  return props.uploadType === 'file' ? AcceptType.File : AcceptType.Image;
});

const attrs: UploadProps = useAttrs();

let fileNum = 0;
const fileList = defineModel<UploadFileInfo[]>('fileList', {
  default: () => []
});

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const headers: Record<string, string> = {
  Authorization: `Bearer ${getToken()}`,
  clientid: import.meta.env.VITE_APP_CLIENT_ID!
};

function beforeUpload(options: { file: UploadFileInfo; fileList: UploadFileInfo[] }) {
  fileNum += 1;
  const { file } = options;

  // 校检文件类型
  if (accept.value) {
    const fileName = file.name.split('.');
    const fileExt = `.${fileName[fileName.length - 1]}`;
    const isTypeOk = accept.value.split(',')?.includes(fileExt);
    if (!isTypeOk) {
      window.$message?.error(
        `${$t('common.importFail')}, ${$t('common.importFormat')} ${accept.value}${$t('common.importEnd')}!`
      );
      return false;
    }
  }
  // 校检文件名是否包含特殊字符
  if (file.name.includes(',')) {
    window.$message?.error($t('common.fileNameError'));
    return false;
  }
  // 校检文件大小
  if (props.fileSize && file.file?.size) {
    const isLt = file.file?.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      window.$message?.error(`${$t('common.importSize')} ${props.fileSize} MB!`);
      return false;
    }
  }
  return true;
}

function isErrorState(xhr: XMLHttpRequest) {
  const responseText = xhr?.responseText;
  const response = JSON.parse(responseText);
  return response.code !== 200;
}

function handleFinish(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  fileNum -= 1;
  const { file, event } = options;
  // @ts-expect-error Ignore type errors
  const responseText = event?.target?.responseText;
  const response = JSON.parse(responseText);
  const oss: Api.System.Oss = response.data;
  fileList.value.find(item => item.id === file.id)!.id = String(oss.ossId);
  file.id = String(oss.ossId);
  file.url = oss.url;
  file.name = oss.fileName;
  if (fileNum === 0) {
    window.$message?.success($t('common.importSuccess'));
  }
  return file;
}

function handleError(options: { file: UploadFileInfo; event?: ProgressEvent }) {
  const { event } = options;
  // @ts-expect-error Ignore type errors
  const responseText = event?.target?.responseText;
  const msg = JSON.parse(responseText).msg;
  window.$message?.error(msg || $t('common.importFail'));
}

async function handleRemove(file: UploadFileInfo) {
  if (file.status !== 'finished') {
    return false;
  }
  const { error } = await fetchBatchDeleteOss([file.id]);
  if (error) return false;
  window.$message?.success($t('common.deleteSuccess'));
  return true;
}
</script>

<template>
  <div class="w-full flex-col">
    <NUpload
      v-bind="attrs"
      v-model:file-list="fileList"
      :action="`${baseURL}${action}`"
      :data="data"
      :headers="headers"
      :max="max"
      :accept="accept"
      :multiple="max > 1"
      directory-dnd
      :default-upload="defaultUpload"
      :list-type="uploadType === 'image' ? 'image-card' : 'text'"
      :is-error-state="isErrorState"
      @finish="handleFinish"
      @error="handleError"
      @before-upload="beforeUpload"
      @remove="({ file }) => handleRemove(file)"
    >
      <NUploadDragger v-if="uploadType === 'file'">
        <div class="mb-12px flex-center">
          <SvgIcon local-icon="material-symbols-unarchive-outline" class="text-58px color-#d8d8db dark:color-#a1a1a2" />
        </div>
        <NText class="text-16px">{{ $t('common.uploadTip') }}</NText>
        <NP v-if="showTip" depth="3" class="mt-8px text-center">
          {{ $t('common.importTip') }}
          <template v-if="fileSize">
            {{ $t('common.importSize') }}
            <b class="text-red-500">{{ fileSize }}MB</b>
          </template>
          <template v-if="accept">
            ，{{ $t('common.importFormat') }}
            <b class="text-red-500">{{ accept.replaceAll(',', '/') }}</b>
          </template>
          {{ $t('common.importEnd') }}
        </NP>
      </NUploadDragger>
    </NUpload>
    <NP v-if="showTip && uploadType === 'image'" depth="3" class="mt-12px">
      {{ $t('common.importTip') }}
      <template v-if="fileSize">
        {{ $t('common.importSize') }}
        <b class="text-red-500">{{ fileSize }}MB</b>
      </template>
      <template v-if="accept">
        ，{{ $t('common.importFormat') }}
        <b class="text-red-500">{{ accept.replaceAll(',', '/') }}</b>
      </template>
      {{ $t('common.importEnd') }}
    </NP>
  </div>
</template>

<style scoped></style>
