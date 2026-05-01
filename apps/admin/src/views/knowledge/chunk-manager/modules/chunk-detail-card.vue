<script lang="ts" setup>
import { h } from 'vue';
import { NButton, NCard, NDropdown, NSwitch } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'ChunkDetailCard'
});

const { t } = useI18n();

interface Props {
  chunk: Api.AI.KB.DocumentChunk;
  chunkIndex: number;
}

interface Emits {
  (e: 'edit'): void;
  (e: 'toggleStatus', enabled: boolean): void;
  (e: 'generateQuestions'): void;
  (e: 'delete'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleDropdownSelect(key: string) {
  if (key === 'generate') {
    emit('generateQuestions');
  } else if (key === 'delete') {
    emit('delete');
  }
}
</script>

<template>
  <NCard :bordered="false" size="small" class="h-full flex-col shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-base font-medium">
          {{
            chunk?.title ||
            t('ai.chunk_manager.chunk_index', {
              index: chunkIndex + 1
            })
          }}
        </span>

        <!-- 悬浮操作栏 -->
        <div class="flex items-center gap-2" @click.stop>
          <div v-if="chunk" class="flex items-center gap-2">
            <NButton quaternary size="tiny" @click="emit('edit')">
              <template #icon>
                <icon-material-symbols-edit-outline class="text-base" />
              </template>
              {{ t('common.edit') }}
            </NButton>
            <!-- 启用/禁用开关 -->
            <NSwitch
              :value="chunk.enabled === 1"
              size="small"
              @update:value="enabled => emit('toggleStatus', enabled)"
            />

            <NDropdown
              trigger="hover"
              :options="[
                {
                  label: t('ai.chunk_manager.ai_generate_question'),
                  key: 'generate',
                  icon: () => h(SvgIcon, { localIcon: 'mdi-magic-staff' })
                },
                {
                  label: t('ai.chunk_manager.delete'),
                  key: 'delete',
                  icon: () => h(SvgIcon, { localIcon: 'mdi-delete-outline' }),
                  props: { class: 'text-error' }
                }
              ]"
              @select="handleDropdownSelect"
            >
              <NButton size="tiny">
                <template #icon>
                  <icon-material-symbols-more-vert />
                </template>
              </NButton>
            </NDropdown>
          </div>
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
