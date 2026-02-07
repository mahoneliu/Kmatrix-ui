<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NCard, NH3, NUpload, type UploadFileInfo, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { uploadTempFile } from '@/service/api/ai/knowledge';

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 路由参数
const kbId = computed(() => route.query.kbId as string);
const datasetId = computed(() => route.query.datasetId as string);

// 文件列表
const fileList = ref<UploadFileInfo[]>([]);
const uploading = ref(false);

// 自定义上传处理
async function handleUpload() {
  if (fileList.value.length === 0) {
    message.warning('请先选择文件');
    return;
  }

  uploading.value = true;
  try {
    // 上传第一个文件的临时版本
    const file = fileList.value[0].file;
    if (!file) {
      message.error('文件无效');
      return;
    }

    const { data } = await uploadTempFile(datasetId.value, file);

    if (!data) {
      message.error('上传失败,未返回临时文件信息');
      return;
    }

    // 跳转到 step2 页面，传递临时文件信息
    await router.push({
      name: 'ai_document-upload_step2',
      query: {
        kbId: kbId.value,
        datasetId: datasetId.value,
        tempFileId: data.id.toString(),
        filename: data.originalFilename
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

function handleBeforeUpload(_data: { file: UploadFileInfo }) {
  // 限制只能上传一个文件
  if (fileList.value.length >= 1) {
    message.warning('当前仅支持单个文件上传');
    return false;
  }
  return true;
}
</script>

<template>
  <div class="h-full overflow-y-auto p-4">
    <NCard class="mx-auto max-w-4xl">
      <template #header>
        <div class="flex items-center gap-2">
          <SvgIcon icon="carbon:document-add" class="text-xl" />
          <NH3 class="m-0">上传文件 - 选择文件</NH3>
        </div>
      </template>

      <div class="space-y-6">
        <!-- 文件上传区域 -->
        <NUpload
          v-model:file-list="fileList"
          :max="1"
          :before-upload="handleBeforeUpload"
          :default-upload="false"
          directory-dnd
        >
          <div
            class="h-64 flex cursor-pointer items-center justify-center border-2 border-gray-300 rounded border-dashed transition-colors hover:border-primary"
          >
            <div class="text-center">
              <SvgIcon icon="carbon:cloud-upload" class="mx-auto text-6xl text-gray-400" />
              <p class="mt-4 text-base text-gray-600">点击或拖拽文件到此处上传</p>
              <p class="mt-2 text-sm text-gray-400">支持 TXT, PDF, DOCX, MD 等常见格式</p>
            </div>
          </div>
        </NUpload>

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
