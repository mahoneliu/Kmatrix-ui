<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { NButton, NCheckbox, NDropdown, NEmpty, NInput, NInputGroup, NSpin, NTag } from 'naive-ui';
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
  displayLevel: 'concise' | 'medium' | 'detailed';
}

interface Emits {
  (e: 'select', chunkId: string): void;
  (e: 'toggleSelection', chunkId: string): void;
  (e: 'scroll', event: Event): void;
  (e: 'openAddModal'): void;
  (e: 'enterBatch'): void;
  (e: 'exitBatch'): void;
  (e: 'batchAction', key: string): void;
  (e: 'update:search-field', value: 'title' | 'content'): void;
  (e: 'update:search-keyword', value: string): void;
  (e: 'search'): void;
  (e: 'openEditModal'): void;
  (e: 'update:display-level', value: 'concise' | 'medium' | 'detailed'): void;
  (e: 'loadMore'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function isChunkSelected(chunkId: string) {
  return props.selectedChunkIds.includes(chunkId);
}

function handleChunkClick(chunkId: string) {
  if (props.isBatchMode) {
    emit('toggleSelection', chunkId);
  } else {
    emit('select', chunkId);
  }
}

function handleChunkDblClick() {
  if (!props.isBatchMode) {
    emit('openEditModal');
  }
}

const displayLevelOptions = computed(() => {
  return [
    { label: '精简', key: 'concise' },
    { label: '中等', key: 'medium' },
    { label: '详细', key: 'detailed' }
  ].map(item => ({
    ...item,
    icon: props.displayLevel === item.key ? () => h(SvgIcon, { icon: 'mdi:check', class: 'text-primary' }) : undefined
  }));
});

// 滚动加载
const sentinelRef = ref<HTMLElement | null>(null);

useIntersectionObserver(
  sentinelRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && props.hasMore && !props.loadingMore) {
      emit('loadMore');
    }
  },
  { rootMargin: '100px' }
);
</script>

<template>
  <div
    class="flex flex-col border-r border-gray-200 pr-4 transition-all duration-300"
    :class="displayLevel === 'detailed' ? 'w-1000px' : 'w-800px'"
  >
    <!-- 文档名称 -->
    <div
      v-if="documentName"
      class="text-md mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 font-bold font-medium"
    >
      <div class="h-6 w-6 flex items-center justify-center rounded-sm bg-primary/10 text-xl text-primary">
        <SvgIcon icon="mdi:book-open-page-variant" />
      </div>
      {{ documentName }}
      <span class="whitespace-nowrap text-xs text-gray-400">{{ total }}分块</span>
    </div>

    <!-- 工具栏 -->
    <div class="items-between mb-3 flex gap-3">
      <!-- 搜索栏 -->
      <NInputGroup class="max-w-300px flex-1">
        <NDropdown
          :options="[
            { label: '标题', key: 'title' },
            { label: '内容', key: 'content' }
          ]"
          @select="
            (key: 'title' | 'content') => {
              emit('update:search-field', key);
            }
          "
        >
          <NButton size="small">
            {{ searchField === 'title' ? '标题' : '内容' }}
            <template #icon>
              <SvgIcon icon="mdi:chevron-down" />
            </template>
          </NButton>
        </NDropdown>

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

      <!-- 显示层级选择 -->
      <NDropdown
        :options="displayLevelOptions"
        @select="
          (key: 'concise' | 'medium' | 'detailed') => {
            emit('update:display-level', key);
          }
        "
      >
        <NButton size="small">
          显示
          <template #icon>
            <SvgIcon icon="mdi:chevron-down" />
          </template>
        </NButton>
      </NDropdown>

      <!-- 操作按钮 -->
      <div class="ml-auto flex items-center gap-2">
        <!-- 批量模式 -->
        <template v-if="isBatchMode">
          <span class="whitespace-nowrap text-xs text-gray-500">已选 {{ selectedChunkIds.length }} 项</span>
          <NDropdown
            :options="batchActionOptions"
            :disabled="selectedChunkIds.length === 0 || batchOperating"
            @select="(key: string) => emit('batchAction', key)"
          >
            <NButton size="small" :loading="batchOperating" :disabled="selectedChunkIds.length === 0">
              操作
              <template #icon>
                <SvgIcon icon="mdi:chevron-down" />
              </template>
            </NButton>
          </NDropdown>
          <NButton size="small" @click="emit('exitBatch')">取消选择</NButton>
        </template>
        <template v-else>
          <NButton size="small" title="批量选择" @click="emit('enterBatch')">批量选择</NButton>
        </template>

        <!-- 新增按钮 -->
        <NButton size="small" ghost title="新增分块" @click="emit('openAddModal')">
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
        class="mb-1 cursor-pointer rounded-md p-1 transition-colors hover:border-gray-400"
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
            @update:checked="emit('toggleSelection', String(chunk.id))"
          />
          <NTag size="small" :bordered="false">{{ index + 1 }}</NTag>
          <span class="flex-1 truncate text-sm font-medium">
            {{ chunk.title || `分块 ${index + 1}` }}
          </span>
        </div>

        <div
          v-if="displayLevel !== 'concise'"
          class="text-xs text-gray-400"
          :class="{ 'line-clamp-2': displayLevel === 'medium' }"
        >
          {{ chunk.content }}
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="py-3 text-center text-sm text-gray-400">
        <NSpin size="small" />
        <span class="ml-2">加载中...</span>
      </div>
      <div v-else-if="!hasMore && chunks.length > 0" class="py-3 text-center text-sm text-gray-400">已加载全部分块</div>

      <!-- 滚动监听哨兵 -->
      <div v-if="hasMore && !loadingMore" ref="sentinelRef" class="h-1px w-full" />
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
