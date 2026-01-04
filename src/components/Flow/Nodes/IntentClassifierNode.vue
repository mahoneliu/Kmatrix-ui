<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput, NPopover } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 本地配置状态
const localConfig = ref<Workflow.IntentClassifierConfig>({
  modelId: props.data.config?.modelId,
  intents: props.data.config?.intents || []
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (newVal) {
      // 深度合并或替换，这里简单替换
      localConfig.value = {
        modelId: newVal.modelId,
        intents: newVal.intents || []
      };
    }
  },
  { deep: true, immediate: true }
);

// 监听本地配置变化，同步到 Store
watch(
  localConfig,
  newVal => {
    workflowStore.updateNodeConfig(props.id, JSON.parse(JSON.stringify(newVal)));
  },
  { deep: true }
);

// 添加意图
function addIntent() {
  const newIndex = localConfig.value.intents.length + 1;
  localConfig.value.intents.push({
    name: `意图${newIndex}`,
    description: '',
    examples: []
  });
}

// 删除意图
function removeIntent(index: number) {
  localConfig.value.intents.splice(index, 1);
}

// 添加示例
function addExample(intentIndex: number) {
  if (!localConfig.value.intents[intentIndex].examples) {
    localConfig.value.intents[intentIndex].examples = [];
  }
  localConfig.value.intents[intentIndex].examples.push('');
}

// 删除示例
function removeExample(intentIndex: number, exampleIndex: number) {
  localConfig.value.intents[intentIndex].examples.splice(exampleIndex, 1);
}
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:brain' }" :hide-source-handle="true">
    <div class="flex flex-col gap-2">
      <div class="text-xs c-gray-5 dark:c-gray-4">定义用户意图分支，AI 将自动分类用户输入并路由到相应分支。</div>

      <!-- 意图列表 -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(intent, index) in localConfig.intents"
          :key="index"
          class="relative flex items-center justify-between rounded bg-gray-50 px-2 py-1.5 transition-colors dark:bg-dark-3 hover:bg-gray-100 dark:hover:bg-dark-4"
        >
          <!-- 意图名称展示与编辑 Popover -->
          <NPopover trigger="click" placement="bottom" raw :show-arrow="false">
            <template #trigger>
              <div class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden">
                <div class="truncate text-sm c-gray-7 font-500 dark:c-gray-2">{{ intent.name || '未命名意图' }}</div>
                <div class="text-xs c-gray-4">{{ intent.examples?.length || 0 }} 示例</div>
              </div>
            </template>
            <!-- 意图详细配置面板 -->
            <div class="w-80 border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2">
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm c-gray-8 font-bold dark:c-gray-1">配置意图</div>
                <NButton text type="error" size="tiny" @click="removeIntent(index)">
                  <template #icon><div class="i-mdi:delete" /></template>
                  删除
                </NButton>
              </div>

              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-xs c-gray-5">意图名称</label>
                  <NInput v-model:value="intent.name" placeholder="例如: 问候" size="small" />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-xs c-gray-5">描述</label>
                  <NInput
                    v-model:value="intent.description"
                    type="textarea"
                    :rows="2"
                    placeholder="描述意图含义"
                    size="small"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <label class="text-xs c-gray-5">示例语句</label>
                    <NButton text type="primary" size="tiny" @click="addExample(index)">
                      <template #icon><div class="i-mdi:plus" /></template>
                      添加
                    </NButton>
                  </div>
                  <div class="max-h-40 flex flex-col gap-2 overflow-y-auto">
                    <div v-for="(example, exIdx) in intent.examples" :key="exIdx" class="flex gap-1">
                      <NInput v-model:value="intent.examples[exIdx]" placeholder="输入示例" size="tiny" />
                      <NButton text type="error" @click="removeExample(index, exIdx)">
                        <template #icon><div class="i-mdi:close" /></template>
                      </NButton>
                    </div>
                    <div v-if="!intent.examples?.length" class="py-1 text-center text-xs c-gray-4">暂无示例</div>
                  </div>
                </div>
              </div>
            </div>
          </NPopover>

          <!-- 右侧输出点 (Handle) -->
          <!-- 注意：Handle 需要绝对定位或放置在最右侧，这里使用 BaseNode 的样式习惯 -->
          <div class="flex items-center">
            <div class="mr-2 text-xs c-gray-4">Default</div>
            <!-- 这个是占位，实际逻辑应该是条件判断 -->
            <!--
 这里其实每个意图都是一个输出。默认输出可能是 "其他"。
                 根据目前的逻辑，IntentClassifierNode 会有多个 Handle。
                 我们需要为每个 intent 生成一个 Handle。
                 ID 需要是特定的格式吗？通常是 `source-${intentIndex}` 或者直接用 intent 名称？
                 为了稳定性，建议用 index。
            -->
            <Handle
              :id="`intent-${index}`"
              type="source"
              :position="Position.Right"
              class="handle-override !h-3 !w-3 !bg-primary !active:bg-primary"
            />
          </div>
        </div>

        <!-- 默认/其他 分支 (可选，视业务逻辑而定，通常意图分类有一个 ELSE) -->
        <!-- 如果后端逻辑支持 ELSE，这里应该加一个 ELSE Handle -->
        <div class="relative flex items-center justify-end rounded bg-gray-50 px-2 py-1.5 dark:bg-dark-3">
          <div class="mr-3 text-xs c-gray-5">其他 (Else)</div>
          <Handle id="else" type="source" :position="Position.Right" class="handle-override !h-3 !w-3 !bg-gray-4" />
        </div>
      </div>

      <!-- 添加意图按钮 -->
      <NButton block dashed size="small" class="mt-1" @click="addIntent">
        <template #icon>
          <div class="i-mdi:plus" />
        </template>
        添加意图
      </NButton>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 Handle 样式以确保在列表中正确显示 */
:deep(.vue-flow__handle) {
  z-index: 10;
}
.handle-override {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
