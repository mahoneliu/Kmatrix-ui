<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NEmpty,
  NH3,
  NInput,
  NInputGroup,
  NRadio,
  NRadioGroup,
  NScrollbar,
  NSpin,
  NTag,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { previewChunks, submitChunks } from '@/service/api/ai/knowledge';

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 路由参数
const kbId = computed(() => route.query.kbId as string);
const datasetId = computed(() => route.query.datasetId as string);
const tempFileId = computed(() => route.query.tempFileId as string);
const filename = computed(() => route.query.filename as string);

// 分块配置
const chunkStrategy = ref<'AUTO' | 'CUSTOM'>('AUTO');
const customSeparators = ref<string[]>([]);

// 分块预览数据
const chunks = ref<Api.AI.KB.ChunkPreview[]>([]);
const loading = ref(false);
const submitting = ref(false);

// 生成预览
async function handleGeneratePreview() {
  if (!tempFileId.value) {
    message.error('临时文件ID无效');
    return;
  }

  loading.value = true;
  try {
    const { data } = await previewChunks({
      tempFileId: Number(tempFileId.value),
      chunkStrategy: chunkStrategy.value,
      separators: chunkStrategy.value === 'CUSTOM' ? customSeparators.value : undefined
    });

    chunks.value = data || [];
    if (chunks.value.length === 0) {
      message.warning('未生成任何分块，请检查文件内容或调整分块规则');
    } else {
      message.success(`已生成 ${chunks.value.length} 个分块`);
    }
  } catch (error: any) {
    message.error(`分块预览失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

// 提交分块
async function handleSubmit() {
  if (chunks.value.length === 0) {
    message.warning('请先生成分块预览');
    return;
  }

  submitting.value = true;
  try {
    await submitChunks({
      tempFileId: Number(tempFileId.value),
      datasetId: String(datasetId.value),
      chunks: chunks.value.map(chunk => ({
        title: chunk.title,
        content: chunk.content
      }))
    });

    message.success('文档已成功入库');

    // 返回知识库详情页
    await router.push({
      name: 'ai_knowledge-detail',
      query: { kbId: kbId.value }
    });
  } catch (error: any) {
    message.error(`提交失败: ${error.message || '未知错误'}`);
  } finally {
    submitting.value = false;
  }
}

// 返回上一步
function handleBack() {
  router.back();
}

// 初始化：自动生成预览
onMounted(() => {
  handleGeneratePreview();
});
</script>

<template>
  <div class="h-full overflow-y-auto p-4">
    <NCard class="mx-auto max-w-6xl">
      <template #header>
        <div class="flex items-center gap-2">
          <SvgIcon icon="carbon:document-add" class="text-xl" />
          <NH3 class="m-0">上传文件 - 分块预览</NH3>
          <NTag type="info" size="small">{{ filename }}</NTag>
        </div>
      </template>

      <div class="grid grid-cols-3 gap-4">
        <!-- 左侧: 分块配置 -->
        <div class="col-span-1 space-y-4">
          <div>
            <div class="mb-2 text-sm font-medium">分块策略</div>
            <NRadioGroup v-model:value="chunkStrategy" name="strategy">
              <div class="flex flex-col gap-2">
                <NRadio value="AUTO">自动分块</NRadio>
                <NRadio value="CUSTOM">高级选项</NRadio>
              </div>
            </NRadioGroup>
          </div>

          <div v-if="chunkStrategy === 'CUSTOM'">
            <div class="mb-2 text-sm font-medium">自定义分隔符</div>
            <NInputGroup>
              <NInput v-model:value="customSeparators[0]" placeholder="例如: 空格、句号、回车" class="flex-1" />
            </NInputGroup>
            <p class="mt-1 text-xs text-gray-400">目前仅支持单个分隔符</p>
          </div>

          <NButton type="primary" block :loading="loading" @click="handleGeneratePreview">
            <template #icon>
              <SvgIcon icon="carbon:play" />
            </template>
            生成预览
          </NButton>
        </div>

        <!-- 右侧: 分块列表 -->
        <div class="col-span-2">
          <div class="mb-2 text-sm font-medium">
            分块预览
            <span v-if="chunks.length > 0" class="text-gray-400">(共 {{ chunks.length }} 个)</span>
          </div>

          <NSpin :show="loading">
            <NScrollbar class="h-[500px]">
              <div v-if="chunks.length === 0" class="h-full flex items-center justify-center">
                <NEmpty description="暂无分块数据" />
              </div>

              <div v-else class="space-y-3">
                <NCard
                  v-for="chunk in chunks"
                  :key="chunk.chunkId"
                  size="small"
                  :bordered="true"
                  class="hover:shadow-md"
                >
                  <template #header>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">分块 {{ chunk.index + 1 }}</span>
                      <NTag size="small" type="info">{{ chunk.content.length }} 字符</NTag>
                    </div>
                  </template>
                  <div class="whitespace-pre-wrap text-sm text-gray-600">
                    {{ chunk.content }}
                  </div>
                </NCard>
              </div>
            </NScrollbar>
          </NSpin>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <template #footer>
        <div class="flex justify-between">
          <NButton @click="handleBack">
            <template #icon>
              <SvgIcon icon="carbon:arrow-left" />
            </template>
            上一步
          </NButton>

          <NButton type="primary" :loading="submitting" :disabled="chunks.length === 0" @click="handleSubmit">
            <template #icon>
              <SvgIcon icon="carbon:checkmark" />
            </template>
            提交入库
          </NButton>
        </div>
      </template>
    </NCard>
  </div>
</template>
