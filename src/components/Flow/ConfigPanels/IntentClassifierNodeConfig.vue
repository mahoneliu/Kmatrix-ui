<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NSpace } from 'naive-ui';
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
  intents: props.node.data.config?.intents || [
    {
      name: '问候',
      description: '用户打招呼或问候',
      examples: ['你好', '嗨', '早上好']
    }
  ]
});

// 添加意图
function addIntent() {
  config.value.intents.push({
    name: '',
    description: '',
    examples: []
  });
}

// 删除意图
function removeIntent(index: number) {
  config.value.intents.splice(index, 1);
}

// 添加示例
function addExample(intentIndex: number) {
  if (!config.value.intents[intentIndex].examples) {
    config.value.intents[intentIndex].examples = [];
  }
  config.value.intents[intentIndex].examples.push('');
}

// 删除示例
function removeExample(intentIndex: number, exampleIndex: number) {
  config.value.intents[intentIndex].examples.splice(exampleIndex, 1);
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
  <NForm label-placement="top" :show-feedback="false">
    <div class="mb-4">
      <NButton type="primary" size="small" @click="addIntent">
        <template #icon>
          <div class="i-mdi:plus" />
        </template>
        添加意图
      </NButton>
    </div>

    <div v-for="(intent, index) in config.intents" :key="index" class="mb-4">
      <NCard :title="`意图 ${index + 1}`" size="small">
        <template #header-extra>
          <NButton text type="error" size="small" @click="removeIntent(index)">
            <template #icon>
              <div class="i-mdi:delete" />
            </template>
          </NButton>
        </template>

        <NFormItem label="意图名称">
          <NInput v-model:value="intent.name" placeholder="例如: 问候、咨询、投诉" />
        </NFormItem>

        <NFormItem label="意图描述">
          <NInput v-model:value="intent.description" type="textarea" :rows="2" placeholder="描述这个意图的含义" />
        </NFormItem>

        <NFormItem label="示例语句">
          <NSpace vertical class="w-full">
            <div v-for="(example, exIdx) in intent.examples" :key="exIdx" class="flex gap-2">
              <NInput v-model:value="intent.examples[exIdx]" placeholder="输入示例语句" class="flex-1" />
              <NButton text type="error" @click="removeExample(index, exIdx)">
                <template #icon>
                  <div class="i-mdi:close" />
                </template>
              </NButton>
            </div>
            <NButton size="small" @click="addExample(index)">
              <template #icon>
                <div class="i-mdi:plus" />
              </template>
              添加示例
            </NButton>
          </NSpace>
        </NFormItem>
      </NCard>
    </div>
  </NForm>
</template>
