<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NEmpty,
  NH3,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NScrollbar,
  NSelect,
  NSlider,
  NSpin,
  NSwitch,
  NTag,
  NTooltip,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { batchPreviewChunks, previewChunks, submitChunks } from '@/service/api/ai/knowledge';

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 路由参数
const kbId = computed(() => route.query.kbId as string);
const datasetId = computed(() => route.query.datasetId as string);

// 解析批量文件参数
const tempFilesParam = computed(() => route.query.tempFiles as string);
const tempFiles = computed(() => {
  try {
    if (tempFilesParam.value) {
      const parsed = JSON.parse(tempFilesParam.value) as Array<{ id: number | string; filename: string }>;
      // 强制转换ID为数字类型,确保与Map key一致
      return parsed.map(item => ({ ...item, id: Number(item.id) }));
    }
  } catch {
    // 解析失败,忽略错误
  }
  // 兼容单文件模式
  const tempFileId = route.query.tempFileId as string;
  const filename = route.query.filename as string;
  if (tempFileId && filename) {
    return [{ id: Number(tempFileId), filename }];
  }
  return [];
});

// 当前选中的文件索引
const currentFileIndex = ref(0);
const currentTempFile = computed(() => tempFiles.value[currentFileIndex.value]);

// 分块配置
const chunkStrategy = ref<'AUTO' | 'CUSTOM'>('AUTO');
const customSeparators = ref<string[]>(['\\n']); // 默认换行符
const chunkSize = ref(500);
const chunkOverlap = ref(50);
const isAutoClean = ref(true);

// 分隔符选项
const separatorOptions = [
  { label: '双换行符 (\\n\\n)', value: '\\n\\n' },
  { label: '换行符 (\\n)', value: '\\n' },
  { label: '句号 (。)', value: '。' },
  { label: '感叹号 (！)', value: '！' },
  { label: '问号 (？)', value: '？' },
  { label: '分号 (；)', value: '；' },
  { label: '空格 ( )', value: ' ' }
];

// 搜索文件的关键字
const searchKeyword = ref('');

// 过滤后的文件列表
const filteredFiles = computed(() => {
  if (!searchKeyword.value) return tempFiles.value;
  return tempFiles.value.filter(f => f.filename.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});

// 所有文件的分块预览数据(使用Map存储,key为tempFileId)
const allChunks = ref<Map<number, Api.AI.KB.ChunkPreview[]>>(new Map());
const chunks = computed(() => {
  if (!currentTempFile.value) return [];
  return allChunks.value.get(currentTempFile.value.id) || [];
});
const loading = ref(false);
const submitting = ref(false);

// 生成预览
async function handleGeneratePreview() {
  if (!currentTempFile.value) {
    message.error('临时文件ID无效');
    return;
  }

  loading.value = true;
  try {
    const { data } = await previewChunks({
      tempFileId: currentTempFile.value.id,
      chunkStrategy: chunkStrategy.value,
      separators: chunkStrategy.value === 'CUSTOM' ? customSeparators.value : undefined,
      chunkSize: chunkStrategy.value === 'CUSTOM' ? chunkSize.value : undefined,
      overlap: chunkStrategy.value === 'CUSTOM' ? chunkOverlap.value : undefined,
      autoClean: chunkStrategy.value === 'CUSTOM' ? isAutoClean.value : undefined
    });

    // 保存到对应文件的分块数据中 - 创建新Map实例以触发响应式更新
    const newMap = new Map(allChunks.value);
    newMap.set(currentTempFile.value.id, data || []);
    allChunks.value = newMap;

    if (!data || data.length === 0) {
      message.warning('未生成任何分块,请检查文件内容或调整分块规则');
    } else {
      message.success(`已生成 ${data.length} 个分块`);
    }
  } catch (error: any) {
    message.error(`分块预览失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

// 批量生成预览
async function handleBatchPreview() {
  // 找出所有未预览的文件
  const unpreviewedFiles = tempFiles.value.filter(f => !allChunks.value.has(f.id));

  if (unpreviewedFiles.length === 0) {
    message.info('所有文件已生成预览');
    return;
  }

  loading.value = true;
  try {
    const { data } = await batchPreviewChunks({
      tempFileIds: unpreviewedFiles.map(f => f.id),
      chunkStrategy: chunkStrategy.value,
      separators: chunkStrategy.value === 'CUSTOM' ? customSeparators.value : undefined,
      chunkSize: chunkStrategy.value === 'CUSTOM' ? chunkSize.value : undefined,
      overlap: chunkStrategy.value === 'CUSTOM' ? chunkOverlap.value : undefined,
      autoClean: chunkStrategy.value === 'CUSTOM' ? isAutoClean.value : undefined
    });

    // 批量更新所有文件的分块数据
    const newMap = new Map(allChunks.value);
    Object.entries(data || {}).forEach(([tempFileId, chunkList]) => {
      newMap.set(Number(tempFileId), chunkList);
    });
    allChunks.value = newMap;

    message.success(`已为 ${unpreviewedFiles.length} 个文件生成预览`);
  } catch (error: any) {
    message.error(`批量预览失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
}

// 提交分块
async function handleSubmit() {
  // 检查是否所有文件都已生成分块
  const unprocessedFiles = tempFiles.value.filter(
    f => !allChunks.value.has(f.id) || allChunks.value.get(f.id)!.length === 0
  );

  if (unprocessedFiles.length > 0) {
    message.warning(`还有 ${unprocessedFiles.length} 个文件未生成分块预览,请先生成预览`);
    return;
  }

  submitting.value = true;
  try {
    // 依次提交每个文件的分块
    // eslint-disable-next-line no-await-in-loop
    for (const tempFile of tempFiles.value) {
      const fileChunks = allChunks.value.get(tempFile.id) || [];
      // eslint-disable-next-line no-await-in-loop
      await submitChunks({
        tempFileId: tempFile.id,
        datasetId: String(datasetId.value),
        chunks: fileChunks.map(chunk => ({
          title: chunk.title,
          content: chunk.content
        }))
      });
    }

    message.success(`成功入库 ${tempFiles.value.length} 个文档`);

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

// --------------------------------------------------------------------------------
// 编辑/删除分块逻辑
// --------------------------------------------------------------------------------
const showEditModal = ref(false);
const editingChunkIndex = ref(-1);
const editingContent = ref('');

/**
 * 点击编辑分块
 */
function handleEditChunk(chunk: Api.AI.KB.ChunkPreview) {
  if (!currentTempFile.value) return;

  // 找到当前分块在数组中的索引
  const index = chunks.value.findIndex(c => c.chunkId === chunk.chunkId);
  if (index === -1) return;

  editingChunkIndex.value = index;
  editingContent.value = chunk.content;
  showEditModal.value = true;
}

/**
 * 保存分块编辑
 */
function saveChunkEdit() {
  if (editingChunkIndex.value === -1 || !currentTempFile.value) return;

  const list = allChunks.value.get(currentTempFile.value.id);
  if (!list) return;

  // 创建新数组以触发响应式更新
  const newList = [...list];
  const targetChunk = newList[editingChunkIndex.value];

  // 更新内容
  newList[editingChunkIndex.value] = {
    ...targetChunk,
    content: editingContent.value
  };

  // 更新Map
  const newMap = new Map(allChunks.value);
  newMap.set(currentTempFile.value.id, newList);
  allChunks.value = newMap;

  showEditModal.value = false;
  message.success('更新成功');
}

/**
 * 删除分块
 */
function handleDeleteChunk(chunk: Api.AI.KB.ChunkPreview) {
  if (!currentTempFile.value) return;

  const list = allChunks.value.get(currentTempFile.value.id);
  if (!list) return;

  const index = list.findIndex(c => c.chunkId === chunk.chunkId);
  if (index === -1) return;

  // 创建新数组
  const newList = [...list];
  newList.splice(index, 1);

  // 更新索引 (可选，如果后端依赖连续索引则需要重排，这里仅做展示优化)
  // newList.forEach((item, idx) => { item.index = idx; });

  const newMap = new Map(allChunks.value);
  newMap.set(currentTempFile.value.id, newList);
  allChunks.value = newMap;

  message.success('删除成功');
}

// 初始化：自动生成预览
onMounted(() => {
  handleGeneratePreview();
});
</script>

<template>
  <div class="h-full w-full flex flex-col overflow-hidden p-4">
    <NCard
      class="mx-auto h-full w-full flex flex-col"
      content-style="flex: 1; min-height: 0; display: flex; flex-direction: column;"
    >
      <template #header>
        <div class="flex items-center gap-2 border-b border-gray-200 pb-4">
          <SvgIcon icon="carbon:document-add" class="text-xl" />
          <NH3 class="m-0">上传文件 - 分块预览</NH3>
          <NTag v-if="tempFiles.length === 1" type="info" size="small">{{ currentTempFile?.filename }}</NTag>
          <NTag v-else type="info" size="small">{{ tempFiles.length }} 个文件</NTag>
        </div>
      </template>

      <!-- 分割线 -->
      <!-- <NDivider class="my-4" /> -->

      <div class="grid grid-cols-3 grid-rows-1 h-full gap-4 overflow-hidden">
        <!-- 左侧: 分块配置 -->
        <div class="col-span-1 h-full flex flex-col overflow-hidden border-r border-gray-200 pr-4 space-y-4">
          <NCard size="small" title="分块规则" :bordered="false" class="flex-shrink-0 text-sm">
            <div class="space-y-4">
              <div>
                <!-- 分块策略选择 -->
                <div class="flex flex-col gap-3">
                  <div
                    class="cursor-pointer border rounded-lg p-3 transition-all hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    :class="
                      chunkStrategy === 'AUTO'
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200'
                    "
                    @click="chunkStrategy = 'AUTO'"
                  >
                    <div class="flex items-center gap-2">
                      <NRadio :checked="chunkStrategy === 'AUTO'" class="pointer-events-none" />
                      <span class="font-medium">智能分段 (推荐)</span>
                    </div>
                    <div class="mt-1 pl-6 text-xs text-gray-500">不了解如何设置分段规则推荐使用智能分段</div>
                  </div>

                  <div
                    class="cursor-pointer border rounded-lg p-3 transition-all hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    :class="
                      chunkStrategy === 'CUSTOM'
                        ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200'
                    "
                    @click="chunkStrategy = 'CUSTOM'"
                  >
                    <div class="flex items-center gap-2">
                      <NRadio :checked="chunkStrategy === 'CUSTOM'" class="pointer-events-none" />
                      <span class="font-medium">高级分段</span>
                    </div>
                    <div class="mt-1 pl-6 text-xs text-gray-500">
                      根据文档规范自行设置分段标识符、分段长度及清洗规则
                    </div>

                    <div v-if="chunkStrategy === 'CUSTOM'" class="m-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <div class="space-y-4">
                        <!-- 分段标识 -->
                        <div>
                          <div class="mb-1 flex items-center gap-1 text-sm font-medium">
                            分段标识
                            <NTooltip trigger="hover">
                              <template #trigger>
                                <SvgIcon icon="carbon:information" class="text-gray-400" />
                              </template>
                              如果不设置，则默认使用双换行符
                            </NTooltip>
                          </div>
                          <NSelect
                            v-model:value="customSeparators"
                            multiple
                            tag
                            filterable
                            placeholder="请选择或输入自定义标识符"
                            :options="separatorOptions"
                          />
                        </div>

                        <!-- 分段长度 -->
                        <div>
                          <div class="mb-1 text-sm font-medium">分段长度</div>
                          <div class="flex items-center gap-4">
                            <NSlider v-model:value="chunkSize" :min="100" :max="2000" :step="50" class="flex-1" />
                            <NInputNumber
                              v-model:value="chunkSize"
                              size="small"
                              :min="100"
                              :max="2000"
                              class="w-20"
                              :show-button="false"
                            />
                          </div>
                        </div>

                        <!-- 重叠长度 -->
                        <div>
                          <div class="mb-1 text-sm font-medium">OverLap 长度</div>
                          <div class="flex items-center gap-4">
                            <NSlider
                              v-model:value="chunkOverlap"
                              :min="0"
                              :max="chunkSize / 2"
                              :step="10"
                              class="flex-1"
                            />
                            <NInputNumber
                              v-model:value="chunkOverlap"
                              size="small"
                              :min="0"
                              :max="chunkSize / 2"
                              class="w-20"
                              :show-button="false"
                            />
                          </div>
                        </div>

                        <!-- 自动清洗 -->
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm font-medium">自动清洗</div>
                            <div class="text-xs text-gray-500">去掉重复多余符号空格、空行、制表符</div>
                          </div>
                          <NSwitch v-model:value="isAutoClean" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <NButton type="primary" block :loading="loading" @click="handleGeneratePreview">
                <template #icon>
                  <SvgIcon icon="carbon:play" />
                </template>
                生成预览
              </NButton>

              <!-- 批量预览按钮 (多文件且有未预览文件时显示) -->
              <NButton
                v-if="tempFiles.length > 1 && tempFiles.some(f => !allChunks.has(f.id))"
                block
                :loading="loading"
                @click="handleBatchPreview"
              >
                <template #icon>
                  <SvgIcon icon="carbon:batch-job" />
                </template>
                为所有未预览文件生成预览
              </NButton>
            </div>
          </NCard>

          <!-- 文件列表 (新增) -->
          <NCard
            v-if="tempFiles.length > 1"
            size="small"
            title="文件列表"
            :bordered="false"
            class="min-h-0 flex flex-col flex-1"
            content-style="flex: 1; min-height: 0; display: flex; flex-direction: column;"
          >
            <div class="mb-2">
              <NInput v-model:value="searchKeyword" placeholder="搜索文件..." size="small" clearable>
                <template #prefix>
                  <SvgIcon icon="mdi:magnify" class="text-gray-400" />
                </template>
              </NInput>
            </div>
            <div class="min-h-0 flex-1 overflow-hidden -mr-3">
              <NScrollbar class="h-full">
                <div class="pr-3 space-y-1">
                  <div
                    v-for="file in filteredFiles"
                    :key="file.id"
                    class="flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    :class="{ 'bg-primary-100 dark:bg-primary-900 text-primary': currentTempFile?.id === file.id }"
                    @click="currentFileIndex = tempFiles.findIndex(f => f.id === file.id)"
                  >
                    <div class="min-w-0 flex flex-1 items-center gap-2">
                      <SvgIcon
                        icon="mdi:file-document-outline"
                        class="flex-shrink-0 text-lg"
                        :class="currentTempFile?.id === file.id ? 'text-primary' : 'text-gray-400'"
                      />
                      <span class="truncate text-sm font-medium" :title="file.filename">{{ file.filename }}</span>
                    </div>
                    <NTag
                      v-if="allChunks.has(file.id)"
                      :type="allChunks.get(file.id)!.length > 0 ? 'primary' : 'warning'"
                      size="small"
                      :bordered="false"
                      round
                      class="flex-shrink-0 px-1"
                    >
                      {{ allChunks.get(file.id)?.length || 0 }}
                    </NTag>
                  </div>
                </div>
                <div v-if="filteredFiles.length === 0" class="py-4 text-center text-sm text-gray-400">暂无匹配文件</div>
              </NScrollbar>
            </div>
          </NCard>
        </div>

        <!-- 右侧: 分块列表 -->
        <div class="col-span-2 h-full min-w-0 flex flex-col overflow-hidden">
          <!-- 当前文件标题 -->
          <div v-if="tempFiles.length > 1" class="mb-4 mr-2 flex items-center justify-between rounded-md p-3">
            <div class="flex items-center gap-2 overflow-hidden">
              <SvgIcon icon="mdi:file-document-outline" class="text-xl text-primary" />
              <span class="truncate font-medium" :title="currentTempFile?.filename">
                {{ currentTempFile?.filename }}
              </span>
            </div>
            <div class="flex-shrink-0">
              <NTag
                v-if="allChunks.has(currentTempFile?.id) && allChunks.get(currentTempFile?.id)!.length > 0"
                type="success"
                size="small"
              >
                已分块 ({{ allChunks.get(currentTempFile?.id)!.length }} )
              </NTag>
              <NTag v-else type="warning" size="small">待分块</NTag>
            </div>
          </div>

          <NSpin :show="loading" class="min-h-0 flex-1" content-class="h-full">
            <NScrollbar class="h-full">
              <div v-if="chunks.length === 0" class="flex items-center justify-center">
                <NEmpty description="暂无分块数据，请点击“生成预览”" />
              </div>

              <div v-else class="pr-2 space-y-3">
                <NCard
                  v-for="chunk in chunks"
                  :key="chunk.chunkId"
                  size="small"
                  :bordered="true"
                  class="group bg-gray-50 transition-all hover:shadow-md"
                >
                  <template #header>
                    <div class="flex items-center justify-between whitespace-nowrap">
                      <span class="text-sm font-medium">分块 {{ chunk.index + 1 }}</span>
                      <div class="flex items-center gap-2">
                        <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <NButton size="tiny" secondary type="primary" @click="handleEditChunk(chunk)">
                            <template #icon>
                              <SvgIcon icon="carbon:edit" />
                            </template>
                          </NButton>
                          <NButton size="tiny" secondary type="error" @click="handleDeleteChunk(chunk)">
                            <template #icon>
                              <SvgIcon icon="carbon:trash-can" />
                            </template>
                          </NButton>
                        </div>
                        <NTag size="small" secondary class="mr-1 bg-gray-200">{{ chunk.content.length }} 字符</NTag>
                      </div>
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

    <!-- 编辑分块弹窗 -->
    <NModal v-model:show="showEditModal" preset="card" title="编辑分块内容" class="w-[600px]" :bordered="false">
      <NInput
        v-model:value="editingContent"
        type="textarea"
        placeholder="请输入分块内容"
        :autosize="{ minRows: 5, maxRows: 15 }"
      />
      <template #footer>
        <div class="flex justify-end gap-2">
          <NButton @click="showEditModal = false">取消</NButton>
          <NButton type="primary" @click="saveChunkEdit">确定</NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
:deep(.n-spin-content) {
  height: 100%;
}
.n-list.n-list--bordered .n-list-item,
.n-list.n-list--hoverable .n-list-item {
  padding: 8px 4px !important;
}
:deep(.n-card-header) {
  padding: 12px 12px !important;
  font-size: 15px !important;
  font-weight: 800 !important;
}
</style>
