<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput, NSpace } from 'naive-ui';
import type { Node } from '@vue-flow/core';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.IntentClassifierConfig];
}>();

// 配置数据
const config = ref<Workflow.IntentClassifierConfig>({
  modelId: props.node.data.config?.modelId || undefined,
  intents: props.node.data.config?.intents || ['问候', '咨询']
});

// 添加意图
function addIntent() {
  config.value.intents.push('');
}

// 删除意图
function removeIntent(index: number) {
  config.value.intents.splice(index, 1);
}

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
  <div class="space-y-4">
    <NButton type="primary" size="small" @click="addIntent">
      <template #icon>
        <div class="i-mdi:plus" />
      </template>
      添加意图
    </NButton>

    <NSpace vertical class="w-full">
      <div v-for="(intent, index) in config.intents" :key="index" class="flex items-center gap-2">
        <span class="w-16 text-sm text-gray-500">意图{{ index + 1 }}</span>
        <NInput v-model:value="config.intents[index]" placeholder="输入意图名称" class="flex-1" />
        <NButton text type="error" @click="removeIntent(index)">
          <template #icon>
            <div class="i-mdi:delete" />
          </template>
        </NButton>
      </div>
    </NSpace>
  </div>
</template>
