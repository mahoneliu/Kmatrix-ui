<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NH5, NUpload, NUploadDragger, type UploadFileInfo, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { uploadTempFiles } from '@/service/api/ai/knowledge';

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
    message.warning('请先选择文件');
    return;
  }

  uploading.value = true;
  try {
    // 提取所有文件
    const files = fileList.value
      .map(item => item.file)
      .filter((file): file is File => file !== null && file !== undefined);

    if (files.length === 0) {
      message.error('没有有效的文件');
      return;
    }

    // 批量上传临时文件
    const { data } = await uploadTempFiles(datasetId.value, files);

    if (!data || data.length === 0) {
      message.error('上传失败,未返回临时文件信息');
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
    message.error(`文件上传失败: ${error.message || '未知错误'}`);
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

  message.success(`已选择 ${files.length} 个文件`);
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
          <SvgIcon icon="carbon:document-add" class="text-2xl" />
          <NH5 class="m-0">上传文件 - 选择文件</NH5>
        </div>
      </template>
      <NAlert type="info" class="mb-3" closable>
        1、文件上传前，建议规范文件的分段标识
        <br />
        2、每次最多上传 50 个文件, 每个文件不超过 100 MB
      </NAlert>
      <div class="space-y-6">
        <!-- 文件上传区域 -->
        <NUpload v-model:file-list="fileList" :default-upload="false" multiple :show-file-list="false">
          <NUploadDragger>
            <div class="flex flex-col items-center gap-2">
              <SvgIcon icon="mdi:cloud-upload-outline" class="text-4xl text-primary" />
              <div class="flex items-center gap-2">
                <p class="text-normal font-normal">点击或拖拽文件到此处上传或</p>
                <NButton text type="primary" @click="handleFolderUploadClick">
                  <template #icon>
                    <SvgIcon icon="carbon:folder-add" />
                  </template>
                  点击上传文件夹
                </NButton>
              </div>
              <p class="text-sm text-gray-500">支持 TXT, PDF, DOCX, MD 等常见格式</p>
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
          style="display: none"
          @change="handleFolderSelect"
        />

        <!-- 已选文件列表 -->
        <div v-if="fileList.length > 0" class="mt-4">
          <div class="mb-2 text-sm font-medium">已选文件 ({{ fileList.length }})</div>
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div
              v-for="file in fileList"
              :key="file.id"
              class="flex items-center justify-between rounded bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100"
            >
              <div class="flex items-center gap-2 overflow-hidden">
                <SvgIcon icon="mdi:file-document-outline" class="flex-shrink-0 text-lg text-gray-400" />
                <span class="truncate text-sm">{{ file.name }}</span>
                <span class="flex-shrink-0 text-xs text-gray-400">{{ formatFileSize(file.file?.size) }}</span>
              </div>
              <NButton text size="small" @click="handleRemoveFile(file.id)">
                <template #icon>
                  <SvgIcon icon="mdi:close" />
                </template>
              </NButton>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between">
          <NButton @click="handleBack">
            <template #icon>
              <SvgIcon icon="carbon:arrow-left" />
            </template>
            返回
          </NButton>

          <NButton type="primary" :loading="uploading" :disabled="fileList.length === 0" @click="handleUpload">
            <template #icon>
              <SvgIcon icon="carbon:arrow-right" />
            </template>
            下一步：预览分块
          </NButton>
        </div>
      </div>
    </NCard>
  </div>
</template>
