<script setup lang="ts">
/**
 * 条件构建器组件
 * 用于可视化构建条件表达式
 *
 * @author Mahone
 * @date 2026-01-19
 */
import { computed, h } from 'vue';
import { NButton, NInput, NSelect } from 'naive-ui';
import {
  COMPARISON_OPERATOR_OPTIONS,
  LOGICAL_OPERATOR_OPTIONS,
  PARAM_GLOBAL_COLORS,
  PARAM_GLOBAL_NODE_COLORS,
  UNARY_OPERATORS
} from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getAvailableParamsForNode } from '@/utils/workflow/param-resolver';
import { getNodeIconBackground } from '@/utils/color';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props {
  /** 当前节点ID */
  nodeId: string;
  /** 条件组配置 */
  modelValue: Workflow.ConditionGroup;
  /** 是否为顶层（不显示删除按钮） */
  isRoot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isRoot: true
});

const emit = defineEmits<{
  'update:modelValue': [value: Workflow.ConditionGroup];
  delete: [];
}>();

const workflowStore = useWorkflowStore();

// 更新条件组
function updateGroup(updates: Partial<Workflow.ConditionGroup>) {
  emit('update:modelValue', { ...props.modelValue, ...updates });
}

// 添加条件规则
function addRule() {
  const newRule: Workflow.ConditionRule = {
    type: 'rule',
    variable: { sourceType: 'node', sourceKey: '', sourceParam: '' },
    operator: 'eq',
    compareValue: '',
    compareValueType: 'static'
  };
  updateGroup({
    conditions: [...props.modelValue.conditions, newRule]
  });
}

// 添加嵌套条件组
function addNestedGroup() {
  const newGroup: Workflow.ConditionGroup = {
    type: 'group',
    logicalOperator: 'AND',
    conditions: []
  };
  updateGroup({
    conditions: [...props.modelValue.conditions, newGroup]
  });
}

// 删除条件
function removeCondition(index: number) {
  const newConditions = [...props.modelValue.conditions];
  newConditions.splice(index, 1);
  updateGroup({ conditions: newConditions });
}

// 更新条件
function updateCondition(index: number, value: Workflow.ConditionRule | Workflow.ConditionGroup) {
  const newConditions = [...props.modelValue.conditions];
  newConditions[index] = value;
  updateGroup({ conditions: newConditions });
}

// 判断是否为条件组
function isConditionGroup(
  condition: Workflow.ConditionRule | Workflow.ConditionGroup
): condition is Workflow.ConditionGroup {
  return condition.type === 'group' || 'logicalOperator' in condition;
}

// 获取可用参数来源
function getAvailableSources() {
  return getAvailableParamsForNode(props.nodeId, workflowStore.nodes, workflowStore.edges);
}

// 转换为变量选择器选项
const variableOptions = computed(() => {
  const sources = getAvailableSources();
  const options: Array<{ label: string; value: string; icon?: string; color?: string }> = [];

  sources.forEach(source => {
    if (!source.params?.length) return;

    source.params.forEach(param => {
      let icon = 'mdi:cube-outline';
      let color = PARAM_GLOBAL_COLORS;

      if (source.sourceKey === 'app') {
        icon = 'mdi:earth';
        color = PARAM_GLOBAL_NODE_COLORS.app;
      } else if (source.sourceKey === 'interface') {
        icon = 'mdi:api';
        color = PARAM_GLOBAL_NODE_COLORS.interface;
      } else if (source.sourceKey === 'session') {
        icon = 'mdi:message-text';
        color = PARAM_GLOBAL_NODE_COLORS.session;
      } else if (source.type === 'node') {
        const node = workflowStore.nodes.find(n => n.id === source.sourceKey);
        if (node?.data?.nodeIcon) icon = node.data.nodeIcon;
        color = node?.data?.nodeColor || PARAM_GLOBAL_COLORS;
      }

      options.push({
        label: `${source.sourceName} / ${param.label}`,
        value: `${source.type}|${source.sourceKey}|${param.key}`,
        icon,
        color
      });
    });
  });

  return options;
});

// 解析变量选择值
function parseVariableValue(value: string): Workflow.VariableRef | null {
  if (!value) return null;
  const parts = value.split('|');
  if (parts.length !== 3) return null;

  const [sourceType, sourceKey, sourceParam] = parts;
  const isGlobal = ['app', 'interface', 'session'].includes(sourceKey);

  return {
    sourceType: isGlobal ? 'global' : (sourceType as 'global' | 'node'),
    sourceKey,
    sourceParam
  };
}

// 格式化变量引用为选择器值
function formatVariableValue(variable: Workflow.VariableRef | undefined): string | null {
  if (!variable) return null;
  return `${variable.sourceType}|${variable.sourceKey}|${variable.sourceParam}`;
}

// 渲染变量选择标签
function renderVariableLabel(option: { label: string; icon?: string; color?: string }) {
  if (!option.icon) return option.label;

  return h('div', { class: 'flex items-center gap-2' }, [
    h(
      'div',
      {
        class: 'h-5 w-5 flex flex-shrink-0 items-center justify-center rounded-1',
        style: {
          backgroundColor: getNodeIconBackground(option.color || PARAM_GLOBAL_COLORS),
          color: option.color
        }
      },
      h(SvgIcon, { icon: option.icon, class: 'text-12px' })
    ),
    h('span', { class: 'text-12px' }, option.label)
  ]);
}

// 判断是否为一元运算符
function isUnaryOperator(operator: string): boolean {
  return UNARY_OPERATORS.includes(operator);
}
</script>

<template>
  <div class="condition-builder">
    <!-- 条件组头部 -->
    <div class="mb-2 flex items-center gap-2">
      <NSelect
        :value="modelValue.logicalOperator"
        :options="LOGICAL_OPERATOR_OPTIONS"
        size="small"
        class="w-32"
        @update:value="(val: string) => updateGroup({ logicalOperator: val as any })"
      />
      <NButton size="tiny" secondary @click="addRule">
        <template #icon><SvgIcon icon="mdi:plus" /></template>
        条件
      </NButton>
      <NButton size="tiny" secondary @click="addNestedGroup">
        <template #icon><SvgIcon icon="mdi:folder-plus" /></template>
        条件组
      </NButton>
      <NButton v-if="!isRoot" size="tiny" type="error" text @click="$emit('delete')">
        <template #icon><SvgIcon icon="mdi:delete" /></template>
      </NButton>
    </div>

    <!-- 条件列表 -->
    <div class="condition-list ml-4 border-l-2 border-l-primary/30 pl-3">
      <div v-for="(condition, index) in modelValue.conditions" :key="index" class="condition-item mb-2">
        <!-- 嵌套条件组 -->
        <template v-if="isConditionGroup(condition)">
          <ConditionBuilder
            :node-id="nodeId"
            :model-value="condition as Workflow.ConditionGroup"
            :is-root="false"
            @update:model-value="(val: Workflow.ConditionGroup) => updateCondition(index, val)"
            @delete="removeCondition(index)"
          />
        </template>

        <!-- 条件规则 -->
        <template v-else>
          <div class="flex flex-wrap items-center gap-2">
            <!-- 变量选择 -->
            <NSelect
              :value="formatVariableValue((condition as Workflow.ConditionRule).variable)"
              :options="variableOptions"
              :render-label="renderVariableLabel"
              placeholder="选择变量"
              size="small"
              filterable
              class="min-w-50"
              @update:value="
                (val: string) => {
                  const variable = parseVariableValue(val);
                  if (variable) {
                    updateCondition(index, { ...condition, variable } as Workflow.ConditionRule);
                  }
                }
              "
            />

            <!-- 运算符选择 -->
            <NSelect
              :value="(condition as Workflow.ConditionRule).operator"
              :options="COMPARISON_OPERATOR_OPTIONS"
              size="small"
              class="w-36"
              @update:value="
                (val: Workflow.ComparisonOperator) => {
                  updateCondition(index, { ...condition, operator: val } as Workflow.ConditionRule);
                }
              "
            />

            <!-- 比较值输入 (非一元运算符时显示) -->
            <template v-if="!isUnaryOperator((condition as Workflow.ConditionRule).operator)">
              <NInput
                :value="String((condition as Workflow.ConditionRule).compareValue ?? '')"
                placeholder="比较值"
                size="small"
                class="w-32"
                @update:value="
                  (val: string) => {
                    updateCondition(index, {
                      ...condition,
                      compareValue: val,
                      compareValueType: 'static'
                    } as Workflow.ConditionRule);
                  }
                "
              />
            </template>

            <!-- 删除按钮 -->
            <NButton size="tiny" type="error" text @click="removeCondition(index)">
              <template #icon><SvgIcon icon="mdi:close" /></template>
            </NButton>
          </div>
        </template>
      </div>

      <!-- 空状态提示 -->
      <div v-if="modelValue.conditions.length === 0" class="py-2 text-xs c-gray-4">点击上方按钮添加条件</div>
    </div>
  </div>
</template>

<style scoped>
.condition-builder {
  @apply rounded-1 bg-gray-50 p-3 dark:bg-dark-3;
}

.condition-list {
  @apply min-h-10;
}
</style>
