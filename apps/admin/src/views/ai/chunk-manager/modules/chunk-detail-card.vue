<script lang="ts" setup>
import { h } from 'vue';
import { NButton, NCard, NDropdown, NSwitch } from 'naive-ui';
import { SvgIcon } from '@sa/materials';

defineOptions({
  name: 'ChunkDetailCard'
});

interface Props {
  chunk: Api.AI.KB.DocumentChunk;
  chunkIndex: number;
}

interface Emits {
  (e: 'edit'): void;
  (e: 'toggle-status', enabled: boolean): void;
  (e: 'generate-questions'): void;
  (e: 'delete'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const dropdownOptions = [
  {
    label: 'AI 生成问题',
    key: 'generate',
    icon: () => h(SvgIcon, { icon: 'mdi:magic-staff' })
  },
  {
    label: '删除分块',
    key: 'delete',
    icon: () => h(SvgIcon, { icon: 'mdi:delete-outline' })
  }
];

function handleDropdownSelect(key: string) {
  if (key === 'generate') {
    emit('generate-questions');
  } else if (key === 'delete') {
    emit('delete');
  }
}
</script>

<template>
  <NCard
    size="small"
    class="chunk-detail-card flex flex-col flex-1 cursor-pointer transition-shadow hover:shadow-md"
    content-style="display: flex; flex-direction: column; flex: 1; min-height: 0;"
    @click="emit('edit')"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-base font-medium">
          {{ chunk.title || `分块 ${chunkIndex + 1}` }}
        </span>

        <!-- 悬浮操作栏 -->
        <div class="flex items-center gap-2" @click.stop>
          <!-- 启用/禁用开关 -->
          <NSwitch
            :value="chunk.enabled === 1"
            size="small"
            @update:value="enabled => emit('toggle-status', enabled)"
          />

          <!-- 编辑按钮 -->
          <NButton size="small" text @click="emit('edit')">
            <template #icon>
              <icon-material-symbols-drive-file-rename-outline-outline />
            </template>
          </NButton>

          <!-- 更多菜单 -->
          <NDropdown :options="dropdownOptions" @select="handleDropdownSelect">
            <NButton size="small" text>
              <template #icon>
                <icon-material-symbols-more-vert />
              </template>
            </NButton>
          </NDropdown>
        </div>
      </div>
    </template>

    <!-- 分块内容 -->
    <div class="chunk-content-area">
      {{ chunk.content }}
    </div>
  </NCard>
</template>

<style scoped>
.chunk-content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 0;
}
</style>
