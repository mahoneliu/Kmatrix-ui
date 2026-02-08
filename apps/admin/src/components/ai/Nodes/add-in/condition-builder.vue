<script setup lang="ts">
/**
 * 条件构建器组件
 * 用于可视化构建条件表达式
 *
 * @author Mahone
 * @date 2026-01-19
 */
import { defineAsyncComponent } from 'vue';
import { NButton, NInput, NSelect } from 'naive-ui';
import { COMPARISON_OPERATOR_OPTIONS, LOGICAL_OPERATOR_OPTIONS, UNARY_OPERATORS } from '@/constants/workflow';

const ParamSelector = defineAsyncComponent(() => import('@/components/ai/Nodes/add-in/param-selector.vue'));

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

// 判断是否为一元运算符
function isUnaryOperator(operator: string): boolean {
  return UNARY_OPERATORS.includes(operator);
}

// 处理变量选择更新
function handleVariableUpdate(
  index: number,
  condition: Workflow.ConditionRule,
  variable: Workflow.VariableRef | undefined
) {
  if (variable) {
    updateCondition(index, { ...condition, variable } as Workflow.ConditionRule);
  }
}

// 辅助函数用于模板中的类型转换，避免 ESLint 警告
const getRule = (c: any) => c as Workflow.ConditionRule;
const getGroup = (c: any) => c as Workflow.ConditionGroup;
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
        @update:value="val => updateGroup({ logicalOperator: val as any })"
      />
      <NButton size="tiny" secondary @click="addRule">
        <template #icon><SvgIcon local-icon="mdi-plus" /></template>
        条件
      </NButton>
      <NButton size="tiny" secondary @click="addNestedGroup">
        <template #icon><SvgIcon local-icon="mdi-folder-plus" /></template>
        条件组
      </NButton>
      <NButton v-if="!isRoot" size="tiny" type="error" text @click="$emit('delete')">
        <template #icon><SvgIcon local-icon="mdi-delete" /></template>
      </NButton>
    </div>

    <!-- 条件列表 -->
    <div class="condition-list ml-4 border-l-2 border-l-primary/30 pl-3">
      <div v-for="(condition, index) in modelValue.conditions" :key="index" class="condition-item mb-2">
        <!-- 嵌套条件组 -->
        <template v-if="isConditionGroup(condition)">
          <ConditionBuilder
            :node-id="nodeId"
            :model-value="getGroup(condition)"
            :is-root="false"
            @update:model-value="val => updateCondition(index, val)"
            @delete="removeCondition(index)"
          />
        </template>

        <!-- 条件规则 -->
        <template v-else>
          <div class="flex flex-wrap items-center gap-2">
            <!-- 变量选择 -->
            <div class="min-w-50">
              <ParamSelector
                :node-id="nodeId"
                :variable-value="getRule(condition).variable"
                :filter-by-type="false"
                placeholder="选择变量"
                @update:variable-value="val => handleVariableUpdate(index, getRule(condition), val)"
              />
            </div>

            <!-- 运算符选择 -->
            <NSelect
              :value="getRule(condition).operator"
              :options="COMPARISON_OPERATOR_OPTIONS"
              size="small"
              class="w-36"
              @update:value="
                val => {
                  updateCondition(index, { ...getRule(condition), operator: val as any } as any);
                }
              "
            />

            <!-- 比较值输入 (非一元运算符时显示) -->
            <template v-if="!isUnaryOperator(getRule(condition).operator)">
              <NInput
                :value="String(getRule(condition).compareValue ?? '')"
                placeholder="比较值"
                size="small"
                class="w-32"
                @update:value="
                  val => {
                    updateCondition(index, {
                      ...getRule(condition),
                      compareValue: val,
                      compareValueType: 'static'
                    });
                  }
                "
              />
            </template>

            <!-- 删除按钮 -->
            <NButton size="tiny" type="error" text @click="removeCondition(index)">
              <template #icon><SvgIcon local-icon="mdi-close" /></template>
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
