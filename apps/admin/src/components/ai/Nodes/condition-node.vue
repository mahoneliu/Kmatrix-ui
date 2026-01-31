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
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { getAvailableParamsForNode } from '@/utils/ai/param-resolver';
import ConditionBuilder from './add-in/condition-builder.vue';
import BaseNode from './base-node.vue';

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

// 转换操作符为友好文字
const opMap: Record<string, string> = {
  eq: '=',
  ne: '≠',
  gt: '>',
  lt: '<',
  gte: '≥',
  lte: '≤',
  contains: '包含',
  notContains: '不包含',
  startsWith: '开头',
  endsWith: '结尾',
  isEmpty: '为空',
  isNotEmpty: '不为空'
};

// 获取友好的参数名称
function getParamLabel(variable: any): string {
  if (!variable?.sourceKey || !variable?.sourceParam) {
    return variable?.sourceParam || '参数';
  }

  // 统一使用 param-resolver 获取所有可用参数 (包括全局、节点输出等)
  const availableSources = getAvailableParamsForNode(props.id, workflowStore.nodes, workflowStore.edges);
  const sourceKey = variable.sourceKey === 'global' ? 'global' : variable.sourceKey;
  const source = availableSources.find(s => s.sourceKey === sourceKey);

  if (source) {
    const param = source.params.find(p => p.key === variable.sourceParam);
    if (param) return param.label;
  }

  return variable.sourceParam;
}

// 生成条件摘要 (增强兼容性)
function getConditionSummary(condition: Workflow.ConditionGroup): string {
  if (!condition || !condition.conditions) return '获取中...';
  if (condition.conditions.length === 0) return '未设置条件';

  try {
    const first = condition.conditions[0] as any;
    if (!first) return '未设置条件';

    let summary = '';
    // 兼容多种属性路径 (Workflow.ConditionRule)
    if (first.variable || (first.type === 'rule' && first.variable)) {
      const varName = getParamLabel(first.variable);
      const op = opMap[first.operator] || first.operator || '==';
      const val = first.compareValue !== undefined && first.compareValue !== '' ? first.compareValue : '...';
      summary = `${varName} ${op} ${val}`;
    } else if (first.conditions || first.type === 'group') {
      summary = '嵌套分组';
    } else {
      summary = '配置条件';
    }

    if (condition.conditions.length > 1) {
      return `${summary} 等${condition.conditions.length}项`;
    }
    return summary;
  } catch {
    return '详情';
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
    class="condition-node"
  >
    <div class="w-93">
      <!-- 条件分支列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between pr-3 text-12px c-gray-5 font-600">
          <label class="flex-1 pl-1">条件分支 (IF / ELSE IF)</label>
          <div class="mr-2 flex flex-shrink-0 items-center">
            <NButton secondary size="tiny" @click="addBranch">
              <template #icon>
                <SvgIcon icon="mdi:plus" />
              </template>
            </NButton>
          </div>
        </div>

        <div
          v-for="(branch, index) in localConfig.branches"
          :key="index"
          class="relative flex items-center justify-between gap-2 pr-4"
        >
          <!-- 分支配置 Popover 包装层，确保 flex-1 生效 -->
          <div class="min-w-0 flex-1">
            <NPopover trigger="click" placement="bottom" raw :show-arrow="false">
              <template #trigger>
                <div
                  class="w-full flex cursor-pointer items-center overflow-hidden rounded-1 bg-gray-1 px-2 py-1.5 dark:bg-dark-3 hover:bg-gray-2 dark:hover:bg-dark-2"
                >
                  <!-- 使用 wrapper 强制限制输入框宽度 -->
                  <div class="w-20 flex-shrink-0">
                    <NInput
                      v-model:value="branch.name"
                      size="tiny"
                      placeholder="分支"
                      :bordered="false"
                      class="branch-name-input"
                      @click.stop
                    />
                  </div>
                  <div class="mx-2 h-3.5 w-px flex-shrink-0 bg-gray-3"></div>
                  <!-- 确保容器具有 flex-1 和 min-w-0 以填充剩余空间 -->
                  <div class="min-w-0 flex-1">
                    <span class="block truncate text-11px c-gray-6">
                      {{ getConditionSummary(branch.condition) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- 条件配置面板 -->
              <div
                class="max-h-300 w-120 overflow-auto border border-gray-100 rounded-2 bg-white p-4 shadow-xl dark:border-dark-3 dark:bg-dark-2"
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
                  @update:model-value="val => updateBranchCondition(index, val)"
                />
              </div>
            </NPopover>
          </div>

          <!-- 右侧操作区：包含删除按钮和输出点 -->
          <div class="flex flex-shrink-0 items-center justify-between pr-1">
            <NButton secondary size="tiny" @click="removeBranch(index)">
              <template #icon>
                <SvgIcon icon="mdi:minus" />
              </template>
            </NButton>
            <div class="h-full flex items-center justify-center">
              <Handle
                :id="`condition-${index}`"
                type="source"
                :position="Position.Right"
                class="custom-handle custom-handle-source"
                :class="[
                  { 'handles-visible': showHandles || selected },
                  { connected: isHandleConnected(`condition-${index}`) },
                  { highlighted: checkHandleHighlight(`condition-${index}`, 'source') }
                ]"
                :style="getHandleStyle(checkHandleHighlight(`condition-${index}`, 'source'))"
                @click="(e: MouseEvent) => handleSourceHandleClick(e, index)"
              />
            </div>
          </div>
        </div>

        <!-- 默认/其他 分支 (ELSE) -->
        <div v-if="localConfig.hasDefaultBranch" class="relative mt-1 flex items-center justify-between gap-1">
          <NInput value="默认 (ELSE)" size="small" disabled class="flex-1" />
          <div class="w-14 flex flex-shrink-0 items-center justify-end pr-1">
            <Handle
              id="default"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source !bg-gray-2"
              :class="[
                { 'handles-visible': showHandles || selected },
                { connected: isHandleConnected('default') },
                { highlighted: checkHandleHighlight('default', 'source') }
              ]"
              :style="getHandleStyle(checkHandleHighlight('default', 'source'))"
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

.branch-name-input {
  max-width: 100%;
  min-width: 0;
}
</style>
