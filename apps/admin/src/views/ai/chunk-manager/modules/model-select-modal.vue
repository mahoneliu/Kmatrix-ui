<script setup lang="ts">
import { computed } from 'vue';
import ModelSelectorBasic from '@/components/ai/public/model-selector-basic.vue';

defineOptions({
  name: 'ModelSelectModal'
});

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// 切片问题生成的默认提示词
const defaultPrompt = `请根据以下参考文本，识别 3-5 个潜在的用户问题。
仅输出问题，每行一个。不要对它们进行编号。
参考文本：
{data}`;

// 提示信息内容
const alertContent = computed(() => {
  return `
    <div class="mb-2">
      提示词中的
      <code class="rounded bg-gray-100 px-1">{data}</code>
      为分段内容的占位符,执行时替换为分段内容发送给 AI 模型;
    </div>
    <div class="mb-2">
      AI 模型根据分段内容生成相关问题,每行一个问题返回;
    </div>
    <div>生成效果依赖于所选模型和提示词,用户可自行调整至最佳效果。</div>
  `;
});

function handleConfirm(data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }) {
  emit('confirm', data);
}

function handleUpdateShow(value: boolean) {
  emit('update:show', value);
}
</script>

<template>
  <ModelSelectorBasic
    :show="show"
    title="生成问题"
    :default-prompt="defaultPrompt"
    :default-temperature="0.7"
    :default-max-tokens="2048"
    :alert-content="alertContent"
    :show-alert="true"
    @update:show="handleUpdateShow"
    @confirm="handleConfirm"
  />
</template>
