<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NInput, NModal } from 'naive-ui';
import { batchAddQuestions } from '@/service/api/ai/knowledge';

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
    window.$message?.warning('请输入问题内容');
    return;
  }

  // 解析输入内容，每行一个问题
  const contents = inputText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (contents.length === 0) {
    window.$message?.warning('请输入问题内容');
    return;
  }

  submitting.value = true;
  try {
    const { error } = await batchAddQuestions(props.kbId, contents);
    if (!error) {
      window.$message?.success(`成功添加 ${contents.length} 个问题`);
      emit('success');
      handleClose();
    }
  } catch {
    window.$message?.error('添加失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    title="批量添加问题"
    :mask-closable="false"
    :bordered="false"
    :segmented="{ content: true }"
    class="w-640px"
    @update:show="(val: boolean) => emit('update:visible', val)"
  >
    <div class="flex flex-col gap-3">
      <div class="text-sm text-gray-500">每行一个问题，提交后将批量创建。</div>
      <NInput
        v-model:value="inputText"
        type="textarea"
        placeholder="请输入问题，每行一个问题&#10;例如：&#10;如何使用这个系统？&#10;系统支持哪些功能？&#10;如何导出数据？"
        :rows="10"
        :disabled="submitting"
        clearable
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">确定</NButton>
      </div>
    </template>
  </NModal>
</template>
