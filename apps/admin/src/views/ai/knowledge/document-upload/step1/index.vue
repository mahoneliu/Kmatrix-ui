<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NAlert, NButton, NCard, NH5, NUpload, NUploadDragger, type UploadFileInfo, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { uploadTempFiles } from '@/service/api/ai/knowledge';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const message = useMessage();

// 路由参数
const kbId = computed(() => route.query.kbId as string);
const datasetId = computed(() => route.query.datasetId as string);

// 文件列表
const fileList = ref<UploadFileInfo[]>([]);
const uploading = ref(false);

// 文件夹上传input引用
const folderInputRef = ref<HTMLInputElement>();

// 自定义上传处理
async function handleUpload() {
  if (fileList.value.length === 0) {
    message.warning(t('ai.document_upload.step1.select_file_warning'));
    return;
  }

  uploading.value = true;
  try {
    // 提取所有文件
    const files = fileList.value
      .map(item => item.file)
      .filter((file): file is File => file !== null && file !== undefined);

    if (files.length === 0) {
      message.error(t('ai.document_upload.step1.no_valid_files'));
      return;
    }

    // 批量上传临时文件
    const { data } = await uploadTempFiles(datasetId.value, files);

    if (!data || data.length === 0) {
      message.error(t('ai.document_upload.step1.upload_failed_no_data'));
      return;
    }

    // 跳转到 step2 页面,传递所有临时文件信息
    await router.push({
      name: 'ai_document-upload_step2',
      query: {
        kbId: kbId.value,
        datasetId: datasetId.value,
        tempFiles: JSON.stringify(data.map(f => ({ id: f.id, filename: f.originalFilename })))
      }
    });
  } catch (error: any) {
    message.error(t('ai.document_upload.step1.upload_error', { error: error.message || '未知错误' }));
  } finally {
    uploading.value = false;
  }
}

// 返回
function handleBack() {
  router.back();
}

// 文件夹上传点击处理
function handleFolderUploadClick(event: Event) {
  (event as MouseEvent).stopPropagation();
  folderInputRef.value?.click();
}

// 文件夹选择处理
function handleFolderSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    return;
  }

  // 将文件转换为 UploadFileInfo 格式
  const newFiles: UploadFileInfo[] = Array.from(files).map((file, index) => ({
    id: `folder-${Date.now()}-${index}`,
    name: file.name,
    status: 'pending',
    file
  }));

  // 添加到文件列表
  fileList.value = [...fileList.value, ...newFiles];

  // 清空input以允许重复选择同一文件夹
  target.value = '';

  message.success(t('ai.document_upload.step1.files_selected_success', { count: files.length }));
}

// 格式化文件大小
function formatFileSize(bytes?: number) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// 移除文件
function handleRemoveFile(fileId: string) {
  fileList.value = fileList.value.filter(f => f.id !== fileId);
}
</script>

<template>
  <div class="h-full overflow-y-auto p-4">
    <NCard class="mx-auto mt-4 max-w-5xl">
      <template #header>
        <div class="flex items-center gap-2">
          <SvgIcon local-icon="carbon-document-add" class="text-2xl" />
          <NH5 class="m-0">{{ $t('ai.document_upload.step1.title') }}</NH5>
        </div>
      </template>
      <NAlert type="info" class="mb-3" closable>
        1、{{ $t('ai.document_upload.step1.tip1') }}
        <br />
        2、{{ $t('ai.document_upload.step1.tip2') }}
      </NAlert>
      <div class="space-y-6">
        <!-- 文件上传区域 -->
        <NUpload v-model:file-list="fileList" :default-upload="false" multiple :show-file-list="false">
          <NUploadDragger>
            <div class="flex flex-col items-center gap-2">
              <SvgIcon local-icon="mdi-cloud-upload-outline" class="text-4xl text-primary" />
              <div class="flex items-center gap-2">
                <p class="text-normal font-normal">{{ $t('ai.document_upload.step1.upload_dragger_text') }}</p>
                <NButton text type="primary" @click="handleFolderUploadClick">
                  <template #icon>
                    <SvgIcon local-icon="carbon-folder-add" />
                  </template>
                  {{ $t('ai.document_upload.step1.upload_folder_btn') }}
                </NButton>
              </div>
              <p class="text-sm text-gray-500">{{ $t('ai.document_upload.step1.upload_limit_tip') }}</p>
            </div>
          </NUploadDragger>
        </NUpload>

        <!-- 隐藏的文件夹选择input -->
        <input
          ref="folderInputRef"
          type="file"
          webkitdirectory
          directory
          multiple
          class="hidden"
          @change="handleFolderSelect"
        />

        <!-- 已选文件列表 -->
        <div v-if="fileList.length > 0" class="mt-4">
          <div class="mb-2 text-sm font-medium">
            {{ $t('ai.document_upload.step1.selected_files_count', { count: fileList.length }) }}
          </div>
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div
              v-for="file in fileList"
              :key="file.id"
              class="flex items-center justify-between rounded bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100"
            >
              <div class="flex items-center gap-2 overflow-hidden">
                <SvgIcon local-icon="mdi-file-document-outline" class="flex-shrink-0 text-lg text-gray-400" />
                <span class="truncate text-sm">{{ file.name }}</span>
                <span class="flex-shrink-0 text-xs text-gray-400">{{ formatFileSize(file.file?.size) }}</span>
              </div>
              <NButton text size="small" @click="handleRemoveFile(file.id)">
                <template #icon>
                  <SvgIcon local-icon="mdi-close" />
                </template>
              </NButton>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between">
          <NButton @click="handleBack">
            <template #icon>
              <SvgIcon local-icon="carbon-arrow-left" />
            </template>
            {{ $t('common.back') }}
          </NButton>

          <NButton type="primary" :loading="uploading" :disabled="fileList.length === 0" @click="handleUpload">
            <template #icon>
              <SvgIcon local-icon="carbon-arrow-right" />
            </template>
            {{ $t('ai.document_upload.step1.next_step') }}
          </NButton>
        </div>
      </div>
    </NCard>
  </div>
</template>
