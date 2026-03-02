<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NModal } from 'naive-ui';
import { batchAddQuestions } from '@/service/api/ai/knowledge';
import { $t } from '@/locales';

defineOptions({
  name: 'QuestionAddModal'
});

interface Props {
  visible?: boolean;
  kbId?: CommonType.IdType | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  kbId: null
});

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const emit = defineEmits<Emits>();

const inputText = ref('');
const submitting = ref(false);

function handleClose() {
  emit('update:visible', false);
  inputText.value = '';
}

async function handleSubmit() {
  if (!props.kbId || !inputText.value.trim()) {
    window.$message?.warning($t('ai.knowledge_detail.questionAddModal.requireContent'));
    return;
  }

  // 解析输入内容，每行一个问题
  const contents = inputText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (contents.length === 0) {
    window.$message?.warning($t('ai.knowledge_detail.questionAddModal.requireContent'));
    return;
  }

  submitting.value = true;
  try {
    const { error } = await batchAddQuestions(props.kbId, contents);
    if (!error) {
      window.$message?.success($t('ai.knowledge_detail.questionAddModal.addSuccess', { count: contents.length }));
      emit('success');
      handleClose();
    }
  } catch {
    window.$message?.error($t('ai.knowledge_detail.questionAddModal.addFail'));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    :title="$t('ai.knowledge_detail.questionAddModal.title')"
    :mask-closable="false"
    :bordered="false"
    :segmented="{ content: true }"
    class="w-640px"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <div class="flex flex-col gap-3">
      <div class="text-sm text-gray-500">{{ $t('ai.knowledge_detail.questionAddModal.tip') }}</div>
      <NInput
        v-model:value="inputText"
        type="textarea"
        :placeholder="$t('ai.knowledge_detail.questionAddModal.placeholder')"
        :rows="10"
        :disabled="submitting"
        clearable
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </div>
    </template>
  </NModal>
</template>
