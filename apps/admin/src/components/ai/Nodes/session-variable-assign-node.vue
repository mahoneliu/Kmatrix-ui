<script setup lang="ts">
/**
 * 会话变量赋值节点
 * 对 AppInfo 节点中定义的会话变量（sessionParams）进行赋值操作。
 * 支持覆写、清除、设置三种操作模式。
 *
 * @author Mahone
 * @date 2026-05-01
 */
import { computed, onMounted, reactive, watch } from 'vue';
import { NButton, NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';
import ParamSelector from './add-in/param-selector.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 操作模式选项
const assignModeOptions = computed(() => [
  { label: $t('ai.workflow_node.assign_mode_overwrite'), value: 'overwrite' },
  { label: $t('ai.workflow_node.assign_mode_clear'), value: 'clear' },
  { label: $t('ai.workflow_node.assign_mode_set'), value: 'set' }
]);

// 从 AppInfo 节点获取会话参数定义
const sessionParamOptions = computed(() => {
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  const config = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;
  const sessionParams = config?.sessionParams || [];
  return sessionParams.map(p => ({
    label: `${p.key}  ${p.type}`,
    value: p.key,
    param: p
  }));
});

// 局部表单数据
const formModel = reactive<{ assignments: Workflow.SessionVarAssignment[] }>({
  assignments: []
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.SessionVariableAssignConfig | undefined;
  if (config?.assignments) {
    formModel.assignments = config.assignments.map(a => ({ ...a }));
  } else {
    formModel.assignments = [];
  }
}

// 添加赋值项
function addAssignment() {
  formModel.assignments.push({
    variableName: '',
    mode: 'overwrite',
    sourceValue: ''
  });
}

// 删除赋值项
function removeAssignment(index: number) {
  formModel.assignments.splice(index, 1);
}

// 获取指定变量名对应的 ParamDefinition
function getParamDef(variableName: string): Workflow.ParamDefinition | undefined {
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  const config = appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;
  return config?.sessionParams?.find(p => p.key === variableName);
}

// 处理 ParamSelector 的 binding 更新（覆写模式）
function handleBindingUpdate(index: number, binding: Workflow.ParamBinding | undefined) {
  const assignment = formModel.assignments[index];
  if (!assignment) return;
  assignment.sourceBinding = binding;
  // 同步生成 sourceValue 字符串（{{sourceType|sourceKey|sourceParam}} 格式）
  if (binding) {
    assignment.sourceValue = `{{${binding.sourceType}|${binding.sourceKey}|${binding.sourceParam || ''}}}`;
  } else {
    assignment.sourceValue = '';
  }
}

// 监听局部表单变化，同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.SessionVariableAssignConfig | undefined;
    if (JSON.stringify(newValue.assignments) !== JSON.stringify(currentConfig?.assignments)) {
      workflowStore.updateNodeConfig(props.id, { assignments: [...newValue.assignments] });
    }
  },
  { deep: true }
);

// 监听外部配置变化（如 DSL 加载时）
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.SessionVariableAssignConfig | undefined;
    if (config && JSON.stringify(config.assignments) !== JSON.stringify(formModel.assignments)) {
      formModel.assignments = (config.assignments || []).map(a => ({ ...a }));
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-93">
      <!-- 变量列表标题行：+ 按钮与每行的 - 按钮右对齐，使用相同宽度占位 -->
      <div class="mb-2 flex items-center text-12px c-gray-5 font-600">
        <label class="flex-1">{{ $t('ai.workflow_node.variable') }}</label>
        <!-- 占位：与下方 - 按钮左侧的 gap-2 对齐 -->
        <NButton secondary size="tiny" @click="addAssignment">
          <template #icon>
            <SvgIcon local-icon="mdi-plus" />
          </template>
        </NButton>
      </div>

      <!-- 无会话变量提示 -->
      <div
        v-if="sessionParamOptions.length === 0"
        class="mb-2 rounded bg-gray-1 px-2 py-2 text-11px c-gray-4 dark:bg-dark-3"
      >
        {{ $t('ai.workflow_node.no_session_variable_defined') }}
      </div>

      <!-- 赋值列表 -->
      <div class="flex flex-col gap-2">
        <div v-for="(assignment, index) in formModel.assignments" :key="index" class="flex flex-col gap-1">
          <!-- 第一行：变量选择 + 操作模式 + 删除按钮 -->
          <div class="flex items-center gap-2">
            <!-- 变量选择器 -->
            <div class="min-w-0 flex-1">
              <NSelect
                v-model:value="assignment.variableName"
                :options="sessionParamOptions"
                :placeholder="$t('ai.workflow_node.select_session_variable')"
                size="small"
                :render-label="
                  (option: any) => {
                    return option.label;
                  }
                "
              >
                <template #prefix>
                  <SvgIcon local-icon="mdi-variable" class="mr-1 text-12px text-orange-5" />
                </template>
              </NSelect>
            </div>

            <!-- 操作模式下拉 -->
            <div class="w-20 flex-shrink-0">
              <NSelect v-model:value="assignment.mode" :options="assignModeOptions" size="small" />
            </div>

            <!-- 删除按钮（与参数提取器一致） -->
            <NButton class="workflow-btn-remove flex-shrink-0" secondary size="tiny" @click="removeAssignment(index)">
              <template #icon>
                <SvgIcon local-icon="mdi-minus" class="workflow-btn-icon" />
              </template>
            </NButton>
          </div>

          <div v-if="assignment.mode === 'overwrite'" class="source-row b-l-2 b-orange-3 pl-1">
            <ParamSelector
              :node-id="props.id"
              :param-def="getParamDef(assignment.variableName)"
              :binding="assignment.sourceBinding"
              :placeholder="$t('ai.workflow_node.source_data')"
              @update:binding="b => handleBindingUpdate(index, b)"
            />
          </div>

          <div v-else-if="assignment.mode === 'set'" class="source-row b-l-2 b-blue-3 pl-1">
            <!-- 设置模式：输入固定值 -->
            <div
              class="flex items-center gap-1 b-1 b-gray-2 rounded bg-gray-1 px-2 py-1 text-11px dark:b-dark-3 dark:bg-dark-3"
            >
              <SvgIcon local-icon="mdi-code-braces" class="flex-shrink-0 text-12px text-gray-4" />
              <input
                v-model="assignment.sourceValue"
                class="flex-1 bg-transparent text-11px c-base-text outline-none placeholder-gray-4"
                :placeholder="$t('ai.workflow_node.source_data')"
              />
              <span class="flex-shrink-0 rounded bg-gray-2 px-1 text-10px c-gray-5 dark:bg-dark-4">
                {{ $t('ai.workflow_node.fixed_value') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div
        v-if="formModel.assignments.length === 0 && sessionParamOptions.length > 0"
        class="py-2 text-center text-11px c-gray-4"
      >
        {{ $t('ai.workflow_node.add_variable') }}
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 380px !important;
  max-width: 420px;
}

/* 源数据行右侧与 - 按钮左边缘对齐：- 按钮宽 22px + gap-2(8px) = 30px */
.source-row {
  padding-right: 30px;
}
</style>
