<script setup lang="ts">
import { ref, watch } from 'vue';
import { NForm, NFormItem, NInput } from 'naive-ui';
import type { Node } from '@vue-flow/core';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.FixedResponseConfig];
}>();

// 配置数据
const config = ref<Workflow.FixedResponseConfig>({
  content: props.node.data.config?.content || ''
});

// 监听配置变化
watch(
  config,
  newConfig => {
    emit('update', newConfig);
  },
  { deep: true }
);
</script>

<template>
  <NForm label-placement="top" :show-feedback="false">
    <NFormItem label="回复内容">
      <NInput v-model:value="config.content" type="textarea" :rows="6" placeholder="输入固定的回复文本内容..." />
    </NFormItem>

    <div class="mt-2 text-xs text-gray-500">
      <div class="mb-1 font-bold">支持变量替换:</div>
      <ul class="list-disc list-inside">
        <li>
          <code>{`{userInput}`}</code>
          - 用户输入
        </li>
        <li>
          <code>{`{sessionId}`}</code>
          - 会话 ID
        </li>
      </ul>
    </div>
  </NForm>
</template>
