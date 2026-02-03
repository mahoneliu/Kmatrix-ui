<script lang="ts" setup>
import { NButton, NCheckbox, NDropdown, NEmpty, NInput, NInputGroup, NSelect, NSpin, NTag } from 'naive-ui';
import { SvgIcon } from '@sa/materials';

defineOptions({
  name: 'ChunkListPanel'
});

interface Props {
  documentName: string;
  chunks: Api.AI.KB.DocumentChunk[];
  selectedChunkId: string | null;
  isBatchMode: boolean;
  selectedChunkIds: string[];
  loading: boolean;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  searchField: 'title' | 'content';
  searchKeyword: string;
  batchActionOptions: Array<{ label?: string; key: string; type?: string }>;
  batchOperating: boolean;
}

interface Emits {
  (e: 'select', chunkId: string): void;
  (e: 'toggle-selection', chunkId: string): void;
  (e: 'scroll', event: Event): void;
  (e: 'open-add-modal'): void;
  (e: 'enter-batch'): void;
  (e: 'exit-batch'): void;
  (e: 'batch-action', key: string): void;
  (e: 'update:search-field', value: 'title' | 'content'): void;
  (e: 'update:search-keyword', value: string): void;
  (e: 'search'): void;
  (e: 'open-edit-modal'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function isChunkSelected(chunkId: string) {
  return props.selectedChunkIds.includes(chunkId);
}

function handleChunkClick(chunkId: string) {
  if (props.isBatchMode) {
    emit('toggle-selection', chunkId);
  } else {
    emit('select', chunkId);
  }
}

function handleChunkDblClick() {
  if (!props.isBatchMode) {
    emit('open-edit-modal');
  }
}
</script>

<template>
  <div class="w-800px flex flex-col border-r border-gray-200 pr-4">
    <!-- 文档名称 -->
    <div v-if="documentName" class="text-md mb-4 flex items-center gap-2 font-bold font-medium">
      <div class="h-6 w-6 flex items-center justify-center rounded-sm bg-primary/10 text-xl text-primary">
        <SvgIcon icon="mdi:book-open-page-variant" />
      </div>
      {{ documentName }}
      <span class="whitespace-nowrap text-xs text-gray-400">{{ total }}分块</span>
    </div>

    <!-- 工具栏 -->
    <div class="items-between mb-3 flex gap-3">
      <!-- 搜索栏 -->
      <NInputGroup class="flex-1" style="max-width: 300px">
        <NSelect
          :value="searchField"
          :options="[
            { label: '标题', value: 'title' },
            { label: '内容', value: 'content' }
          ]"
          class="w-100px"
          size="small"
          @update:value="(v: 'title' | 'content') => emit('update:search-field', v)"
        />
        <NInput
          :value="searchKeyword"
          placeholder="搜索"
          size="small"
          clearable
          @update:value="(v: string) => emit('update:search-keyword', v)"
          @keydown.enter="emit('search')"
          @clear="
            () => {
              emit('update:search-keyword', '');
              emit('search');
            }
          "
        />
      </NInputGroup>

      <!-- 操作按钮 -->
      <div class="ml-auto flex items-center gap-2">
        <!-- 批量模式 -->
        <template v-if="isBatchMode">
          <span class="whitespace-nowrap text-xs text-gray-500">已选 {{ selectedChunkIds.length }} 项</span>
          <NDropdown
            :options="batchActionOptions"
            :disabled="selectedChunkIds.length === 0 || batchOperating"
            @select="(key: string) => emit('batch-action', key)"
          >
            <NButton size="small" :loading="batchOperating" :disabled="selectedChunkIds.length === 0">
              操作
              <template #icon>
                <SvgIcon icon="mdi:chevron-down" />
              </template>
            </NButton>
          </NDropdown>
          <NButton size="small" @click="emit('exit-batch')">取消选择</NButton>
        </template>
        <template v-else>
          <NButton size="small" title="批量选择" @click="emit('enter-batch')">批量选择</NButton>
        </template>

        <!-- 新增按钮 -->
        <NButton size="small" ghost title="新增分块" @click="emit('open-add-modal')">
          <template #icon>
            <icon-material-symbols-add />
          </template>
        </NButton>
      </div>
    </div>

    <!-- 分块列表 -->
    <div v-if="loading" class="h-600px flex-center">
      <NSpin size="small" />
    </div>

    <NEmpty v-else-if="chunks.length === 0" description="暂无分块" class="mt-10" />

    <div v-else class="chunk-list-container" @scroll="(e: Event) => emit('scroll', e)">
      <div
        v-for="(chunk, index) in chunks"
        :key="String(chunk.id)"
        class="mb-0 cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
        :class="{
          'bg-primary/10 border-1 border-primary': !isBatchMode && selectedChunkId === String(chunk.id),
          'bg-blue-50 border-1 border-blue-300': isBatchMode && isChunkSelected(String(chunk.id)),
          'border-1 border-transparent': isBatchMode
            ? !isChunkSelected(String(chunk.id))
            : selectedChunkId !== String(chunk.id)
        }"
        @click="handleChunkClick(String(chunk.id))"
        @dblclick="handleChunkDblClick"
      >
        <div class="mb-1 flex items-center gap-2">
          <NCheckbox
            v-if="isBatchMode"
            :checked="isChunkSelected(String(chunk.id))"
            @click.stop
            @update:checked="emit('toggle-selection', String(chunk.id))"
          />
          <NTag size="small" :bordered="false">{{ index + 1 }}</NTag>
          <span class="flex-1 truncate text-sm font-medium">
            {{ chunk.title || `分块 ${index + 1}` }}
          </span>
        </div>
        <div class="line-clamp-2 text-xs text-gray-400">
          {{ chunk.content }}
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="py-3 text-center text-sm text-gray-400">
        <NSpin size="small" />
        <span class="ml-2">加载中...</span>
      </div>
      <div v-else-if="!hasMore && chunks.length > 0" class="py-3 text-center text-sm text-gray-400">已加载全部分块</div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.h-600px {
  height: 600px;
}

.chunk-list-container {
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}
</style>
