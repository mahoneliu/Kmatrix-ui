<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string, handleId: string];
}>();

const workflowStore = useWorkflowStore();

// 本地配置状态 (仅保留意图列表)
const localConfig = ref<{ intents: string[] }>({
  intents: props.data.config?.intents || []
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (!newVal) return;
    // 仅比较意图列表
    const isSame = JSON.stringify(newVal.intents) === JSON.stringify(localConfig.value.intents);

    if (!isSame) {
      localConfig.value = {
        intents: [...(newVal.intents || [])]
      };
    }
  },
  { deep: true, immediate: true }
);

// 监听本地配置变化,同步到 Store
watch(
  localConfig,
  newVal => {
    const isSame = JSON.stringify(newVal.intents) === JSON.stringify(props.data.config?.intents);

    if (!isSame) {
      // 仅更新 intents 字段，避免覆盖 modelId 等其他配置
      workflowStore.updateNodeConfig(props.id, { intents: JSON.parse(JSON.stringify(newVal.intents)) });
    }
  },
  { deep: true }
);

// 添加意图
function addIntent() {
  const newIndex = localConfig.value.intents.length + 1;
  localConfig.value.intents.push(`意图${newIndex}`);
}

// 删除意图
function removeIntent(index: number) {
  // 删除与该意图 Handle 相关的边
  const handleId = `intent-${index}`;
  workflowStore.edges = workflowStore.edges.filter(e => !(e.source === props.id && e.sourceHandle === handleId));

  // 删除意图配置
  localConfig.value.intents.splice(index, 1);
}

// 处理 Handle 点击
function handleSourceHandleClick(e: MouseEvent, index: number) {
  // 阻止冒泡，避免触发节点点击
  e.stopPropagation();
  // 构建 handle ID
  const handleId = index === -1 ? 'else' : `intent-${index}`;
  // 触发事件，传递 event, nodeId, handleId
  emit('sourceHandleClick', e, props.id, handleId);
}
</script>

<template>
  <!-- hide-source-handle="true" 隐藏 BaseNode 默认的输出点 -->
  <BaseNode
    v-slot="{ showHandles, isHandleConnected, checkHandleHighlight, getHandleStyle }"
    v-bind="props"
    :data="{ ...data, icon: 'mdi:brain' }"
    :hide-source-handle="true"
    :no-content-padding="true"
    class="intent-classifier-node"
  >
    <div class="w-93">
      <!-- 意图列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between pr-3 text-12px c-gray-5 font-600">
          <label>定义意图分支</label>
          <NButton secondary size="tiny" class="mr-2" @click="addIntent">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
          </NButton>
        </div>
        <div
          v-for="(intent, index) in localConfig.intents"
          :key="index"
          class="relative flex items-center justify-between gap-2"
        >
          <!-- 意图名称输入 -->
          <NInput v-model:value="localConfig.intents[index]" placeholder="意图名称" size="small" class="mr-2 flex-1" />

          <!-- 删除按钮 -->
          <NButton class="workflow-btn-remove mr-3" secondary size="tiny" @click="removeIntent(index)">
            <template #icon>
              <SvgIcon icon="mdi:minus" class="workflow-btn-icon" />
            </template>
          </NButton>

          <!-- 右侧输出点 (Handle) -->
          <!-- 使用 BaseNode 样式类 custom-handle custom-handle-source 以保持一致性 -->
          <div class="right-1 h-full flex items-center justify-center">
            <Handle
              :id="`intent-${index}`"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected(`intent-${index}`) },
                { highlighted: checkHandleHighlight(`intent-${index}`, 'source') }
              ]"
              :style="getHandleStyle(checkHandleHighlight(`intent-${index}`, 'source'))"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, index)"
            />
          </div>
        </div>

        <!-- 默认/其他 分支 -->
        <div class="relative mt-1 flex items-center justify-between gap-2">
          <NInput value="其他 (Else)" size="small" disabled class="mr-12 flex-1" />
          <div class="right-1 h-full flex items-center justify-center pr-1">
            <Handle
              id="else"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source !bg-gray-2"
              :class="[
                { 'handles-visible': showHandles || selected },
                { highlighted: checkHandleHighlight('else', 'source') }
              ]"
              :style="getHandleStyle(checkHandleHighlight('else', 'source'))"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, -1)"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 确保 Handle 在 hover 时才显示或一直显示，这里为了操作方便，建议一直显示或者适配 BaseNode 的逻辑 */
/* 为了简单起见，我们在 inline style 中强制了一部分样式，也可以在这里定义 */
:deep(.vue-flow__handle) {
  z-index: 10;
}
</style>
