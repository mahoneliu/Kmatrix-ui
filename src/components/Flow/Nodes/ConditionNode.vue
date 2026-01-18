<script setup lang="ts">
import { ref, watch } from 'vue';
import { NButton, NInput, NPopover } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import SvgIcon from '@/components/custom/svg-icon.vue';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string, handleId: string];
}>();

const workflowStore = useWorkflowStore();

// 本地配置状态
const localConfig = ref<Workflow.ConditionConfig>({
  conditions: props.data.config?.conditions || [],
  defaultTargetNodeId: props.data.config?.defaultTargetNodeId || ''
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (newVal) {
      const newConfig = {
        conditions: newVal.conditions || [],
        defaultTargetNodeId: newVal.defaultTargetNodeId || ''
      };
      // 只在真正有变化时才更新,避免循环
      if (JSON.stringify(newConfig) !== JSON.stringify(localConfig.value)) {
        localConfig.value = newConfig;
      }
    }
  },
  { deep: true, immediate: true }
);

// 监听本地配置变化，同步到 Store
watch(
  localConfig,
  newVal => {
    // 只在与 props 不同时才更新,避免循环
    if (JSON.stringify(newVal) !== JSON.stringify(props.data.config)) {
      workflowStore.updateNodeConfig(props.id, JSON.parse(JSON.stringify(newVal)));
    }
  },
  { deep: true }
);

// 添加条件
function addCondition() {
  localConfig.value.conditions.push({
    expression: '',
    targetNodeId: ''
  });
}

// 删除条件
function removeCondition(index: number) {
  // 删除与该条件 Handle 相关的边
  const handleId = `condition-${index}`;
  workflowStore.edges = workflowStore.edges.filter(e => !(e.source === props.id && e.sourceHandle === handleId));

  // 删除条件配置
  localConfig.value.conditions.splice(index, 1);
}

// 处理 Handle 点击
function handleSourceHandleClick(e: MouseEvent, index: number) {
  // 阻止冒泡,避免触发节点点击
  e.stopPropagation();
  // 构建 handle ID
  const handleId = index === -1 ? 'default' : `condition-${index}`;
  // 触发事件,传递 event, nodeId, handleId
  emit('sourceHandleClick', e, props.id, handleId);
}
</script>

<template>
  <!-- hide-source-handle="true" 隐藏 BaseNode 默认的输出点 -->
  <BaseNode
    v-slot="{ showHandles, isHandleConnected }"
    v-bind="props"
    :data="data"
    :hide-source-handle="true"
    :no-content-padding="true"
    class="condition-node"
  >
    <div class="w-93">
      <!-- 条件列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between pr-3 text-12px c-gray-5 font-600">
          <label>定义条件分支</label>
          <NButton secondary size="tiny" class="mr-2" @click="addCondition">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
          </NButton>
        </div>
        <div
          v-for="(condition, index) in localConfig.conditions"
          :key="index"
          class="relative flex items-center justify-between gap-2"
        >
          <!-- 表达式编辑 Popover -->
          <NPopover trigger="click" placement="bottom" raw :show-arrow="false" class="flex-1">
            <template #trigger>
              <NInput
                :value="condition.expression || '点击配置表达式'"
                placeholder="条件表达式"
                size="small"
                readonly
                class="mr-2 flex-1 cursor-pointer"
              />
            </template>
            <!-- 详细配置面板 -->
            <div class="w-80 border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2">
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm c-gray-8 font-bold dark:c-gray-1">配置条件表达式</div>
                <NButton text type="error" size="tiny" @click="removeCondition(index)">
                  <template #icon><SvgIcon icon="mdi:delete" /></template>
                  删除
                </NButton>
              </div>

              <div class="flex flex-col gap-1">
                <NInput
                  v-model:value="condition.expression"
                  type="textarea"
                  :rows="3"
                  placeholder="例如: state.value > 10"
                  size="small"
                />
                <div class="mt-1 text-xs c-gray-4">可用变量: state.xxx</div>
              </div>
            </div>
          </NPopover>

          <!-- 删除按钮 -->
          <NButton class="mr-3" secondary size="tiny" @click="removeCondition(index)">
            <template #icon>
              <SvgIcon icon="mdi:minus" />
            </template>
          </NButton>

          <!-- 右侧输出点 (Handle) -->
          <div class="right-1 h-full flex items-center justify-center pr-1">
            <Handle
              :id="`condition-${index}`"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected(`condition-${index}`) }
              ]"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, index)"
            />
          </div>
        </div>

        <!-- 默认/其他 分支 -->
        <div class="relative mt-1 flex items-center justify-between gap-2">
          <NInput value="默认 (Default)" size="small" disabled class="mr-14 flex-1" />
          <div class="right-1 h-full flex items-center justify-center pr-1">
            <Handle
              id="default"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source !bg-gray-2"
              :class="[{ 'handles-visible': showHandles || selected }, { connected: isHandleConnected('default') }]"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, -1)"
            />
          </div>
        </div>
      </div>

      <!-- 添加条件按钮 -->
      <!--
 <NButton block dashed size="small" class="mt-1 mr-3" @click="addCondition">
        <template #icon>
          <div class="i-mdi:plus" />
        </template>
        添加条件
      </NButton> 
-->
    </div>
  </BaseNode>
</template>

<style scoped>
/* 确保 Handle 的 z-index 正确 */
:deep(.vue-flow__handle) {
  z-index: 10;
}
</style>
