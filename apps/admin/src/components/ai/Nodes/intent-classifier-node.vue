<script setup lang="ts">
import { onMounted } from 'vue';
import { NButton, NInput } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string, handleId: string];
}>();

const workflowStore = useWorkflowStore();

// 使用通用 AI 节点配置 composable 管理意图列表
const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, { intents: [] as string[] });

onMounted(() => {
  initData();
});

// 添加意图
function addIntent() {
  const newIndex = formModel.intents.length + 1;
  formModel.intents.push(`意图${newIndex}`);
}

// 删除意图
function removeIntent(index: number) {
  // 删除与该意图 Handle 相关的边
  const handleId = `intent-${index}`;
  workflowStore.edges = workflowStore.edges.filter(e => !(e.source === props.id && e.sourceHandle === handleId));

  // 删除意图配置
  formModel.intents.splice(index, 1);
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
    v-slot="{
      showHandles,
      drawerMode: inDrawer,
      canvasDrawerMode,
      isHandleConnected,
      checkHandleHighlight,
      getHandleStyle
    }"
    v-bind="props"
    :data="{ ...data, localIcon: 'mdi-brain' }"
    :hide-source-handle="true"
    :no-content-padding="true"
    class="intent-classifier-node"
  >
    <div class="w-full">
      <div class="flex flex-col" :class="canvasDrawerMode ? 'gap-1' : 'gap-2'">
        <!-- 标题行：画布抽屉模式下隐藏 -->
        <div v-if="!canvasDrawerMode" class="flex items-center justify-between text-12px c-gray-5 font-600">
          <label>{{ $t('ai.workflow_node.define_intent_branch') }}</label>
          <NButton secondary size="tiny" @click="addIntent">
            <template #icon>
              <SvgIcon local-icon="mdi-plus" />
            </template>
          </NButton>
        </div>

        <div
          v-for="(intent, index) in formModel.intents"
          :key="index"
          class="relative flex items-center gap-1 rounded-l-[4px] bg-gray-50 py-1 pl-2 pr-1 transition-colors dark:bg-dark-3 hover:bg-gray-100 dark:hover:bg-dark-4"
        >
          <!-- 画布抽屉模式：只显示分支名称 + Handle -->
          <template v-if="canvasDrawerMode">
            <span class="flex-1 truncate py-0.5 text-11px c-gray-6">{{ intent }}</span>
          </template>

          <!-- 正常/抽屉面板模式：输入框 + 删除按钮 -->
          <template v-else>
            <NInput
              v-model:value="formModel.intents[index]"
              :placeholder="$t('ai.workflow_node.intent_name')"
              size="small"
              :bordered="false"
              class="flex-1 !bg-transparent"
            />
            <NButton
              secondary
              size="tiny"
              class="opacity-60 !border-none !bg-transparent hover:opacity-100"
              @click="removeIntent(index)"
            >
              <template #icon>
                <SvgIcon local-icon="mdi-minus" />
              </template>
            </NButton>
          </template>

          <!-- Handle：仅画布模式（含画布抽屉模式）显示 -->
          <div v-if="!inDrawer" class="branch-row-handle">
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
        <div
          class="relative flex items-center gap-1 rounded-l-[4px] bg-gray-50 py-1.5 pl-2 pr-1 transition-colors dark:bg-dark-3 hover:bg-gray-100 dark:hover:bg-dark-4"
          :class="canvasDrawerMode ? '' : 'mt-1'"
        >
          <template v-if="canvasDrawerMode">
            <span class="flex-1 truncate py-0.5 text-11px c-gray-4">其他 (Else)</span>
          </template>
          <template v-else>
            <div class="flex-1 truncate pl-2.5 text-11px c-gray-4">其他 (Else)</div>
          </template>
          <div v-if="!inDrawer" class="branch-row-handle">
            <Handle
              id="else"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected('else') },
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
.vue-flow__handle {
  min-width: 2px;
}
</style>
