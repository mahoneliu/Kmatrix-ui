<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NButton, NEmpty, NInput, NModal, NSelect, NSpace, NSpin } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'ChunkEditModal'
});

const { t } = useI18n();

interface Props {
  show: boolean;
  chunk: Api.AI.KB.DocumentChunk | null;
  questions: Api.AI.KB.Question[];
  kbQuestionOptions: Array<{ label: string; value: string | number }>;
  loadingQuestions: boolean;
  loadingMoreQuestions: boolean;
  generatingQuestions: boolean;
  savingChunk: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: { title: string; content: string }): void;
  (e: 'selectQuestion', questionId: string | number | null): void;
  (e: 'createQuestion', event: KeyboardEvent): void;
  (e: 'deleteQuestion', questionId: string | number): void;
  (e: 'generateQuestions'): void;
  (e: 'loadQuestions'): void;
  (e: 'questionSearch', keyword: string): void;
  (e: 'questionScroll', event: Event): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isEditing = ref(false);
const editTitleValue = ref('');
const editContentValue = ref('');
const newQuestionContent = ref<string | number | null>(null);

// 监听弹窗打开
watch(
  () => props.show,
  val => {
    if (val && props.chunk) {
      editTitleValue.value = props.chunk.title || '';
      editContentValue.value = props.chunk.content || '';
      isEditing.value = false;
      emit('loadQuestions');
      newQuestionContent.value = null;
    }
  }
);

function startEditing() {
  if (!props.chunk) return;
  editTitleValue.value = props.chunk.title || '';
  editContentValue.value = props.chunk.content || '';
  isEditing.value = true;
}

function handleSave() {
  emit('save', {
    title: editTitleValue.value.trim(),
    content: editContentValue.value.trim()
  });
  isEditing.value = false;
}

function handleClose() {
  emit('update:show', false);
}

function handleCancelEdit() {
  isEditing.value = false;
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="isEditing ? t('ai.chunk_manager.edit_chunk') : t('ai.chunk_manager.chunk_detail')"
    class="w-1500px"
    :closable="true"
    :mask-closable="false"
    @update:show="handleClose"
  >
    <div class="h-800px flex flex-col">
      <!-- Divider (Top) -->
      <div class="mb-4 h-px flex-shrink-0 bg-gray-200" />

      <!-- Bottom Section: Split View -->
      <div class="min-h-0 flex flex-1 gap-4 overflow-hidden">
        <!-- Left: Title + Content -->
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- Title Section -->
          <div class="mb-4 flex-shrink-0">
            <template v-if="!isEditing">
              <div class="mb-2 text-sm text-gray-600 font-medium">{{ t('ai.chunk_manager.chunk_title') }}</div>
              <div class="select-text px-1 text-base text-gray-800 font-bold">
                {{ chunk?.title || t('ai.chunk_manager.no_title') }}
              </div>
            </template>
            <template v-else>
              <div class="mb-2 text-sm text-gray-600 font-medium">{{ t('ai.chunk_manager.chunk_title') }}</div>
              <NInput
                v-model:value="editTitleValue"
                :placeholder="t('ai.chunk_manager.title_placeholder')"
                :maxlength="256"
                show-count
              />
            </template>
          </div>

          <!-- Content Section -->
          <div class="min-h-0 flex flex-col flex-1">
            <div class="mb-2 text-sm text-gray-600 font-medium">{{ t('ai.chunk_manager.chunk_content') }}</div>

            <template v-if="!isEditing">
              <div
                class="flex-1 select-text overflow-auto whitespace-pre-wrap break-all border border-gray-100 rounded bg-gray-50 p-4 text-sm leading-relaxed"
              >
                {{ chunk?.content }}
              </div>
            </template>
            <template v-else>
              <NInput
                v-model:value="editContentValue"
                type="textarea"
                :placeholder="t('ai.chunk_manager.content_placeholder')"
                :maxlength="1000"
                show-count
                class="flex-1"
                :input-props="{ style: 'height: 100%' }"
              />
            </template>
          </div>
        </div>

        <!-- Right: Questions -->
        <div class="w-500px flex flex-col border-l border-gray-100 pl-4">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-medium">{{ t('ai.chunk_manager.associated_questions') }}</span>
            <NButton size="small" :loading="generatingQuestions" @click="emit('generateQuestions')">
              <template #icon>
                <SvgIcon local-icon="mdi-magic-staff" />
              </template>
              {{ t('ai.chunk_manager.ai_generate_question') }}
            </NButton>
          </div>

          <!-- Add Question Input -->
          <div class="mb-4">
            <NSelect
              v-model:value="newQuestionContent"
              filterable
              remote
              clearable
              tag
              :placeholder="t('ai.chunk_manager.add_question_placeholder')"
              :options="kbQuestionOptions"
              :loading="loadingMoreQuestions"
              virtual-scroll
              :show-arrow="false"
              @update:value="val => emit('selectQuestion', val)"
              @keydown.enter="(e: KeyboardEvent) => emit('createQuestion', e)"
              @search="(keyword: string) => emit('questionSearch', keyword)"
              @scroll="(e: Event) => emit('questionScroll', e)"
            />
          </div>

          <div v-if="loadingQuestions" class="flex-center py-8">
            <NSpin size="small" />
          </div>

          <div v-else class="flex flex-col flex-1 gap-3 overflow-auto">
            <!-- Question List -->
            <div v-if="questions.length > 0" class="flex flex-col gap-2">
              <div
                v-for="q in questions"
                :key="String(q.id)"
                class="group flex items-start gap-2 rounded bg-gray-50 p-2 transition-colors hover:bg-gray-100"
              >
                <div class="flex-1 text-sm">
                  {{ q.content }}
                </div>
                <NButton
                  size="tiny"
                  text
                  type="error"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  @click="emit('deleteQuestion', q.id)"
                >
                  <template #icon>
                    <icon-material-symbols-close />
                  </template>
                </NButton>
              </div>
            </div>

            <NEmpty
              v-else-if="!loadingQuestions"
              :description="t('ai.chunk_manager.no_associated_questions')"
              size="small"
              class="mt-8"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <NSpace justify="center">
        <!-- 浏览状态下的按钮 -->
        <NButton v-show="!isEditing" @click="handleClose">{{ t('common.close') }}</NButton>
        <NButton v-show="!isEditing" type="primary" @click="startEditing">{{ t('common.edit') }}</NButton>

        <!-- 编辑状态下的按钮 -->
        <NButton v-show="isEditing" @click="handleCancelEdit">{{ t('common.cancel') }}</NButton>
        <NButton v-show="isEditing" type="primary" :loading="savingChunk" @click="handleSave">
          {{ t('common.save') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
