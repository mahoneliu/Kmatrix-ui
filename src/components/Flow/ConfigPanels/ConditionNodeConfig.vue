<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput } from 'naive-ui';
import type { Node } from '@vue-flow/core';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.ConditionConfig];
}>();

// 配置数据
const config = ref<Workflow.ConditionConfig>({
  conditions: props.node.data.config?.conditions || [
    {
      expression: '',
      targetNodeId: ''
    }
  ],
  defaultTargetNodeId: props.node.data.config?.defaultTargetNodeId || ''
});

// 添加条件
function addCondition() {
  config.value.conditions.push({
    expression: '',
    targetNodeId: ''
  });
}

// 删除条件
function removeCondition(index: number) {
  config.value.conditions.splice(index, 1);
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
    <div class="bg-primary-1 dark:c-primary-1 mb-4 rounded p-3 text-sm c-primary dark:bg-primary/10">
      <div class="mb-1 font-bold">条件表达式说明:</div>
      <div>支持 JavaScript 表达式，可使用变量:</div>
      <ul class="mt-1 list-disc list-inside">
        <li>
          <code>state.intent</code>
          - 意图分类结果
        </li>
        <li>
          <code>state.userInput</code>
          - 用户输入
        </li>
        <li>
          <code>state.xxx</code>
          - 其他状态变量
        </li>
      </ul>
    </div>

    <div class="mb-4">
      <NButton type="primary" size="small" @click="addCondition">
        <template #icon>
          <div class="i-mdi:plus" />
        </template>
        添加条件
      </NButton>
    </div>

    <div v-for="(condition, index) in config.conditions" :key="index" class="mb-4">
      <NCard :title="`条件 ${index + 1}`" size="small">
        <template #header-extra>
          <NButton text type="error" size="small" @click="removeCondition(index)">
            <template #icon>
              <div class="i-mdi:delete" />
            </template>
          </NButton>
        </template>

        <NFormItem label="条件表达式">
          <NInput
            v-model:value="condition.expression"
            placeholder="例如: state.intent === '问候'"
            type="textarea"
            :rows="2"
          />
        </NFormItem>

        <NFormItem label="目标节点 ID">
          <NInput v-model:value="condition.targetNodeId" placeholder="输入目标节点的 ID" />
        </NFormItem>
      </NCard>
    </div>

    <NFormItem label="默认目标节点 ID">
      <NInput v-model:value="config.defaultTargetNodeId" placeholder="当所有条件都不满足时跳转的节点" />
    </NFormItem>
  </NForm>
</template>
