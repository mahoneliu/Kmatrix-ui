<script setup lang="ts">
/**
 * 循环节点
 * 支持配置循环条件和最大迭代次数
 *
 * @author Mahone
 * @date 2026-03-22
 */
import { ref, watch } from 'vue';
import { NInput, NInputNumber, NPopover } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { getAvailableParamsForNode } from '@/utils/ai/param-resolver';
import { $t } from '@/locales';
import ConditionBuilder from './add-in/condition-builder.vue';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string, handleId: string];
}>();

const workflowStore = useWorkflowStore();

// 本地配置状态
const localConfig = ref<Workflow.LoopConfig>({
  condition: props.data.config?.condition || {
    type: 'group',
    logicalOperator: 'AND',
    conditions: []
  },
  maxIterations: props.data.config?.maxIterations ?? 50
});

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (newVal) {
      const newConfig: Workflow.LoopConfig = {
        condition: newVal.condition || {
          type: 'group',
          logicalOperator: 'AND',
          conditions: []
        },
        maxIterations: newVal.maxIterations ?? 50
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

// 处理 Handle 点击
function handleSourceHandleClick(e: MouseEvent, handleId: string) {
  e.stopPropagation();
  emit('sourceHandleClick', e, props.id, handleId);
}

// 转换操作符为友好文字
const opMap: Record<string, string> = {
  eq: '=',
  ne: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  contains: $t('ai.workflow_node.op_contains'),
  notContains: $t('ai.workflow_node.op_not_contains'),
  startsWith: $t('ai.workflow_node.op_starts_with'),
  endsWith: $t('ai.workflow_node.op_ends_with'),
  isEmpty: $t('ai.workflow_node.op_is_empty'),
  isNotEmpty: $t('ai.workflow_node.op_is_not_empty')
};

// 获取友好的参数名称
function getParamLabel(variable: any): string {
  if (!variable?.sourceKey || !variable?.sourceParam) {
    return variable?.sourceParam || $t('ai.workflow_node.param');
  }

  const availableSources = getAvailableParamsForNode(props.id, workflowStore.nodes, workflowStore.edges);
  const sourceKey = variable.sourceKey === 'global' ? 'global' : variable.sourceKey;
  const source = availableSources.find(s => s.sourceKey === sourceKey);

  if (source) {
    const param = source.params.find(p => p.key === variable.sourceParam);
    if (param) return param.label;
  }

  return variable.sourceParam;
}

// 生成条件摘要
function getConditionSummary(condition: Workflow.ConditionGroup): string {
  if (!condition || !condition.conditions) return $t('ai.workflow_node.loading');
  if (condition.conditions.length === 0) return $t('ai.workflow_node.continue_when_all_met');

  try {
    const first = condition.conditions[0] as any;
    if (!first) return $t('ai.workflow_node.condition_not_set');

    let summary = '';
    if (first.variable || (first.type === 'rule' && first.variable)) {
      const varName = getParamLabel(first.variable);
      const op = opMap[first.operator] || first.operator || '==';
      const val = first.compareValue !== undefined && first.compareValue !== '' ? first.compareValue : '...';

      if (condition.conditions.length > 1) {
        const baseSummary = `${varName} ${op} ${val}`;
        const moreSummary = $t('ai.workflow_node.and_n_more', {
          summary: baseSummary,
          count: condition.conditions.length
        });
        return $t('ai.workflow_node.loop_when', { summary: moreSummary });
      }
      return $t('ai.workflow_node.continue_when_met', { varName, op, val });
    } else if (first.conditions || first.type === 'group') {
      summary = $t('ai.workflow_node.nested_group');
    } else {
      summary = $t('ai.workflow_node.config_condition');
    }

    if (condition.conditions.length > 1) {
      const moreSummary = $t('ai.workflow_node.and_n_more', { summary, count: condition.conditions.length });
      return $t('ai.workflow_node.loop_when', { summary: moreSummary });
    }
    return summary;
  } catch {
    return $t('ai.workflow_node.detail');
  }
}
</script>

<template>
  <BaseNode
    v-slot="{ showHandles, isHandleConnected, checkHandleHighlight, getHandleStyle }"
    v-bind="props"
    :data="data"
    :hide-source-handle="true"
    :no-content-padding="true"
    class="loop-node"
  >
    <div class="w-93">
      <!-- 循环配置列表 -->
      <div class="flex flex-col gap-2">
        <!-- 循环条件配置 -->
        <div class="flex items-center justify-between pr-3 text-12px c-gray-5 font-600">
          <label class="flex-1 pl-1">{{ $t('ai.workflow_node.continue_condition') }}</label>
        </div>
        <div class="relative flex items-center justify-between gap-1 pr-4">
          <div class="min-w-0 flex-1">
            <NPopover trigger="click" placement="bottom" raw :show-arrow="false">
              <template #trigger>
                <div
                  class="w-full flex cursor-pointer items-center overflow-hidden rounded-1 bg-gray-1 px-2 py-1.5 dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-2"
                >
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-11px c-gray-6">
                      {{ getConditionSummary(localConfig.condition) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- 条件配置面板 -->
              <div
                class="max-h-300 w-120 overflow-auto border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2"
              >
                <div class="mb-3 flex items-center justify-between">
                  <div class="text-sm c-gray-8 font-bold dark:c-gray-1">
                    {{ $t('ai.workflow_node.config_continue_condition') }}
                  </div>
                </div>
                <ConditionBuilder
                  :node-id="id"
                  :model-value="localConfig.condition"
                  @update:model-value="val => (localConfig.condition = val as any)"
                />
              </div>
            </NPopover>
          </div>
          <!-- Continue 输出点 -->
          <div class="box-border w-10 flex flex-shrink-0 items-center justify-end pr-1">
            <Handle
              id="continue"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected('continue') },
                { highlighted: checkHandleHighlight('continue', 'source') }
              ]"
              :style="getHandleStyle(checkHandleHighlight('continue', 'source'))"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, 'continue')"
            />
          </div>
        </div>

        <!-- 最大循环次数 -->
        <div class="mt-1 flex items-center pb-1 pl-1 pr-4">
          <label class="w-30 text-12px c-gray-5 font-600">{{ $t('ai.workflow_node.max_iterations_label') }}</label>
          <div class="w-24">
            <NInputNumber
              v-model:value="localConfig.maxIterations"
              size="small"
              :min="1"
              :max="1000"
              class="w-full"
              :placeholder="$t('ai.workflow_node.no_limit')"
            />
          </div>
        </div>

        <!-- 跳出 / 结束 分支 (Exit) -->
        <div class="relative mt-1 flex items-center justify-between gap-1 pr-4">
          <NInput :value="$t('ai.workflow_node.exit_or_end')" size="small" disabled class="flex-1" />
          <div class="box-border w-10 flex flex-shrink-0 items-center justify-end pr-1">
            <Handle
              id="exit"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source !bg-red-4"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected('exit') },
                { highlighted: checkHandleHighlight('exit', 'source') }
              ]"
              :style="getHandleStyle(checkHandleHighlight('exit', 'source'))"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, 'exit')"
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
