<script setup lang="ts">
/**
 * 条件节点
 * 支持多分支条件判断
 *
 * @author Mahone
 * @date 2026-01-19
 */
import { ref, watch } from 'vue';
import { NButton, NInput, NPopover } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ConditionBuilder from '../ConditionBuilder.vue';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string, handleId: string];
}>();

const workflowStore = useWorkflowStore();

// 创建默认空分支
function createDefaultBranch(index: number): Workflow.ConditionBranch {
  return {
    name: `分支 ${index + 1}`,
    handleId: `condition-${index}`,
    condition: {
      type: 'group',
      logicalOperator: 'AND',
      conditions: []
    }
  };
}

// 本地配置状态
const localConfig = ref<Workflow.ConditionConfig>({
  branches: props.data.config?.branches || [createDefaultBranch(0)],
  hasDefaultBranch: props.data.config?.hasDefaultBranch ?? true
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (newVal?.branches) {
      const newConfig: Workflow.ConditionConfig = {
        branches: newVal.branches || [createDefaultBranch(0)],
        hasDefaultBranch: newVal.hasDefaultBranch ?? true
      };
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
    if (JSON.stringify(newVal) !== JSON.stringify(props.data.config)) {
      workflowStore.updateNodeConfig(props.id, JSON.parse(JSON.stringify(newVal)));
    }
  },
  { deep: true }
);

// 添加分支
function addBranch() {
  const index = localConfig.value.branches.length;
  localConfig.value.branches.push(createDefaultBranch(index));
}

// 删除分支
function removeBranch(index: number) {
  const handleId = `condition-${index}`;
  // 删除与该分支 Handle 相关的边
  workflowStore.edges = workflowStore.edges.filter(e => !(e.source === props.id && e.sourceHandle === handleId));
  // 删除分支配置
  localConfig.value.branches.splice(index, 1);
  // 重新分配 handleId
  localConfig.value.branches.forEach((branch, i) => {
    branch.handleId = `condition-${i}`;
  });
}

// 更新分支条件
function updateBranchCondition(index: number, condition: Workflow.ConditionGroup) {
  localConfig.value.branches[index].condition = condition;
}

// 处理 Handle 点击
function handleSourceHandleClick(e: MouseEvent, index: number) {
  e.stopPropagation();
  const handleId = index === -1 ? 'default' : `condition-${index}`;
  emit('sourceHandleClick', e, props.id, handleId);
}

// 生成条件摘要
function getConditionSummary(condition: Workflow.ConditionGroup): string {
  if (!condition.conditions || condition.conditions.length === 0) {
    return '点击配置条件';
  }

  const parts: string[] = [];
  const maxShow = 2; // 最多显示2个条件

  for (let i = 0; i < Math.min(condition.conditions.length, maxShow); i += 1) {
    const c = condition.conditions[i];
    if ('variable' in c && c.variable) {
      const rule = c as Workflow.ConditionRule;
      const varName = rule.variable.sourceParam || '变量';
      const op = rule.operator || '==';
      const val = rule.compareValue ?? '';
      parts.push(`${varName} ${op} ${val}`);
    } else {
      parts.push('(条件组)');
    }
  }

  if (condition.conditions.length > maxShow) {
    parts.push(`+${condition.conditions.length - maxShow}`);
  }

  const connector = condition.logicalOperator === 'AND' ? ' 且 ' : ' 或 ';
  return parts.join(connector);
}
</script>

<template>
  <BaseNode
    v-slot="{ showHandles, isHandleConnected }"
    v-bind="props"
    :data="data"
    :hide-source-handle="true"
    :no-content-padding="true"
    class="condition-node"
  >
    <div class="w-93">
      <!-- 条件分支列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between pr-3 text-12px c-gray-5 font-600">
          <label>条件分支 (IF / ELSE IF)</label>
          <NButton secondary size="tiny" class="mr-2" @click="addBranch">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
          </NButton>
        </div>

        <div
          v-for="(branch, index) in localConfig.branches"
          :key="index"
          class="relative flex items-center justify-between gap-2"
        >
          <!-- 分支配置 Popover -->
          <NPopover trigger="click" placement="bottom" raw :show-arrow="false" class="flex-1">
            <template #trigger>
              <div
                class="mr-2 flex flex-1 cursor-pointer items-center gap-1 rounded-1 bg-gray-1 p-2 dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-2"
              >
                <NInput
                  v-model:value="branch.name"
                  size="tiny"
                  placeholder="分支名称"
                  class="w-20 flex-shrink-0"
                  @click.stop
                />
                <span class="truncate text-11px c-gray-5">{{ getConditionSummary(branch.condition) }}</span>
              </div>
            </template>

            <!-- 条件配置面板 -->
            <div
              class="max-h-100 w-120 overflow-auto border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2"
            >
              <div class="mb-3 flex items-center justify-between">
                <div class="text-sm c-gray-8 font-bold dark:c-gray-1">配置分支条件</div>
                <NButton text type="error" size="tiny" @click="removeBranch(index)">
                  <template #icon><SvgIcon icon="mdi:delete" /></template>
                  删除
                </NButton>
              </div>

              <ConditionBuilder
                :node-id="id"
                :model-value="branch.condition"
                @update:model-value="(val: Workflow.ConditionGroup) => updateBranchCondition(index, val)"
              />
            </div>
          </NPopover>

          <!-- 删除按钮 -->
          <NButton class="mr-3" secondary size="tiny" @click="removeBranch(index)">
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

        <!-- 默认/其他 分支 (ELSE) -->
        <div v-if="localConfig.hasDefaultBranch" class="relative mt-1 flex items-center justify-between gap-2">
          <NInput value="默认 (ELSE)" size="small" disabled class="mr-14 flex-1" />
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
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.vue-flow__handle) {
  z-index: 10;
}
</style>
