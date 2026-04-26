<script setup lang="ts">
/**
 * 变量聚合器节点
 * 将互斥分支（IF/ELSE、意图分类器）的输出汇聚为单一输出变量
 *
 * @author Mahone
 * @date 2026-05-01
 */
import { computed, onMounted, watch } from 'vue';
import { NButton, NInput, NSwitch, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { getAvailableParamsForNode } from '@/utils/ai/param-resolver';
import { getTagBackground } from '@/utils/color';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();

const workflowStore = useWorkflowStore();

/** 单个变量引用 */
interface VarRef {
  /** 来源节点 ID（或 global/app/interface/session） */
  sourceNodeId: string;
  /** 来源参数键 */
  sourceParam: string;
  /** 数据类型（用于 UI 类型校验提示） */
  type: Workflow.ParamDataType;
}

/** 聚合分组 */
interface AggregatorGroup {
  /** 分组名称（同时作为输出 key） */
  groupName: string;
  /** 该分组的变量引用列表 */
  variables: VarRef[];
}

const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, {
  enableGrouping: false,
  outputKey: 'output',
  variables: [] as VarRef[],
  groups: [] as AggregatorGroup[]
});

onMounted(() => {
  initData();
  syncOutputParams();
});

// ── 可用参数源 ──────────────────────────────────────────────
const availableSources = computed(() => getAvailableParamsForNode(props.id, workflowStore.nodes, workflowStore.edges));

/** 将参数源展平为选项列表 */
const flatParamOptions = computed(() => {
  const opts: Array<{ label: string; sourceNodeId: string; sourceParam: string; type: Workflow.ParamDataType }> = [];
  for (const src of availableSources.value) {
    for (const param of src.params) {
      opts.push({
        label: `${src.sourceName} / ${param.label || param.key}`,
        sourceNodeId: src.sourceKey,
        sourceParam: param.key,
        type: param.type as Workflow.ParamDataType
      });
    }
  }
  return opts;
});

// ── 单组模式操作 ─────────────────────────────────────────────
function addVariable() {
  formModel.variables.push({ sourceNodeId: '', sourceParam: '', type: 'string' });
}

function removeVariable(index: number) {
  formModel.variables.splice(index, 1);
}

function selectVariable(index: number, opt: (typeof flatParamOptions.value)[0]) {
  formModel.variables[index] = { sourceNodeId: opt.sourceNodeId, sourceParam: opt.sourceParam, type: opt.type };
}

// ── 分组模式操作 ─────────────────────────────────────────────
function addGroup() {
  const idx = formModel.groups.length + 1;
  formModel.groups.push({ groupName: `group${idx}`, variables: [] });
}

function removeGroup(index: number) {
  formModel.groups.splice(index, 1);
}

function addGroupVariable(groupIndex: number) {
  formModel.groups[groupIndex].variables.push({ sourceNodeId: '', sourceParam: '', type: 'string' });
}

function removeGroupVariable(groupIndex: number, varIndex: number) {
  formModel.groups[groupIndex].variables.splice(varIndex, 1);
}

function selectGroupVariable(groupIndex: number, varIndex: number, opt: (typeof flatParamOptions.value)[0]) {
  formModel.groups[groupIndex].variables[varIndex] = {
    sourceNodeId: opt.sourceNodeId,
    sourceParam: opt.sourceParam,
    type: opt.type
  };
}

// ── 同步 customOutputParams ───────────────────────────────────
function syncOutputParams() {
  const outputs: Workflow.ParamDefinition[] = [];

  if (formModel.enableGrouping) {
    for (const group of formModel.groups) {
      if (group.groupName?.trim()) {
        // 推断类型：取分组第一个有效变量的类型
        const firstVar = group.variables.find(v => v.sourceParam);
        outputs.push({
          key: group.groupName,
          label: group.groupName,
          type: (firstVar?.type as Workflow.ParamDataType) || 'string',
          required: false,
          description: ''
        });
      }
    }
  } else {
    const key = formModel.outputKey?.trim() || 'output';
    const firstVar = formModel.variables.find(v => v.sourceParam);
    outputs.push({
      key,
      label: key,
      type: (firstVar?.type as Workflow.ParamDataType) || 'string',
      required: false,
      description: ''
    });
  }

  workflowStore.updateNode(props.id, { customOutputParams: outputs });
}

watch(
  () => [formModel.enableGrouping, formModel.outputKey, formModel.variables, formModel.groups],
  () => syncOutputParams(),
  { deep: true }
);

// ── 类型校验：同一组内所有变量类型必须一致 ──────────────────
function getGroupTypeError(variables: VarRef[]): string | null {
  const types = variables.filter(v => v.sourceParam).map(v => v.type);
  if (types.length < 2) return null;
  const first = types[0];
  if (types.every(t => t === first)) return null;
  return $t('ai.workflow_node.variable_aggregator.type_mismatch');
}
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="variable-aggregator-node">
    <div class="w-full">
      <!-- 启用分组开关 -->
      <div class="mb-2 flex workflow-config-item items-center justify-between">
        <div class="flex items-center gap-1">
          <span class="text-12px">{{ $t('ai.workflow_node.variable_aggregator.enable_grouping') }}</span>
          <NTooltip>
            <template #trigger>
              <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
            </template>
            {{ $t('ai.workflow_node.variable_aggregator.enable_grouping_desc') }}
          </NTooltip>
        </div>
        <NSwitch v-model:value="formModel.enableGrouping" size="small" />
      </div>

      <!-- 单组模式 -->
      <template v-if="!formModel.enableGrouping">
        <div class="workflow-config-item-section dark:bg-white/5">
          <!-- 输出键名 -->
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-shrink-0 text-12px text-gray-5">
              {{ $t('ai.workflow_node.variable_aggregator.output_key') }}
            </span>
            <NInput
              v-model:value="formModel.outputKey"
              size="tiny"
              :placeholder="$t('ai.workflow_node.variable_aggregator.output_key_placeholder')"
              class="flex-1"
            />
          </div>

          <!-- 变量列表标题 -->
          <div class="flex items-center justify-between">
            <span class="text-12px">{{ $t('ai.workflow_node.variable_aggregator.variables') }}</span>
            <NButton secondary size="tiny" @click.stop="addVariable">
              <template #icon>
                <SvgIcon local-icon="mdi-plus" />
              </template>
            </NButton>
          </div>

          <!-- 空状态 -->
          <div v-if="formModel.variables.length === 0" class="py-1 text-center text-xs text-gray-4">
            {{ $t('ai.workflow_node.variable_aggregator.no_variables') }}
          </div>

          <!-- 类型不一致警告 -->
          <div
            v-if="getGroupTypeError(formModel.variables)"
            class="mt-1 rounded bg-orange-50 px-2 py-1 text-11px text-orange-5 dark:bg-orange-900/20"
          >
            <SvgIcon local-icon="mdi-alert-outline" class="mr-1 text-12px" />
            {{ getGroupTypeError(formModel.variables) }}
          </div>

          <!-- 变量列表 -->
          <div class="mt-1 flex flex-col gap-1">
            <div v-for="(varRef, index) in formModel.variables" :key="index" class="flex items-center gap-1">
              <!-- 变量选择器（简单下拉） -->
              <div
                class="min-w-0 flex-1 cursor-pointer truncate rounded px-2 py-1 text-11px"
                :style="{
                  backgroundColor: getTagBackground(data.nodeColor),
                  borderLeft: `2px solid ${data.nodeColor}`,
                  color: data.nodeColor
                }"
              >
                <select
                  class="w-full bg-transparent text-11px outline-none"
                  :style="{ color: data.nodeColor }"
                  :value="`${varRef.sourceNodeId}::${varRef.sourceParam}`"
                  @change="
                    e => {
                      const val = (e.target as HTMLSelectElement).value;
                      const opt = flatParamOptions.find(o => `${o.sourceNodeId}::${o.sourceParam}` === val);
                      if (opt) selectVariable(index, opt);
                    }
                  "
                >
                  <option value="::">{{ $t('ai.workflow_node.variable_aggregator.select_variable') }}</option>
                  <option
                    v-for="opt in flatParamOptions"
                    :key="`${opt.sourceNodeId}::${opt.sourceParam}`"
                    :value="`${opt.sourceNodeId}::${opt.sourceParam}`"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <!-- 类型标签 -->
              <span class="flex-shrink-0 text-10px text-gray-4">{{ varRef.type }}</span>
              <!-- 删除 -->
              <NButton secondary size="tiny" @click.stop="removeVariable(index)">
                <template #icon>
                  <SvgIcon local-icon="mdi-minus" />
                </template>
              </NButton>
            </div>
          </div>
        </div>
      </template>

      <!-- 分组模式 -->
      <template v-else>
        <div class="flex flex-col gap-2">
          <!-- 添加分组按钮 -->
          <div class="flex items-center justify-between">
            <span class="text-12px text-gray-5">{{ $t('ai.workflow_node.variable_aggregator.groups') }}</span>
            <NButton secondary size="tiny" @click.stop="addGroup">
              <template #icon>
                <SvgIcon local-icon="mdi-plus" />
              </template>
              {{ $t('ai.workflow_node.variable_aggregator.add_group') }}
            </NButton>
          </div>

          <!-- 空状态 -->
          <div v-if="formModel.groups.length === 0" class="py-1 text-center text-xs text-gray-4">
            {{ $t('ai.workflow_node.variable_aggregator.no_groups') }}
          </div>

          <!-- 分组列表 -->
          <div
            v-for="(group, groupIndex) in formModel.groups"
            :key="groupIndex"
            class="workflow-config-item-section dark:bg-white/5"
          >
            <!-- 分组头部 -->
            <div class="mb-1 flex items-center gap-1">
              <NInput
                v-model:value="group.groupName"
                size="tiny"
                :placeholder="$t('ai.workflow_node.variable_aggregator.group_name_placeholder')"
                class="flex-1"
              />
              <NButton secondary size="tiny" @click.stop="addGroupVariable(groupIndex)">
                <template #icon>
                  <SvgIcon local-icon="mdi-plus" />
                </template>
              </NButton>
              <NButton secondary size="tiny" @click.stop="removeGroup(groupIndex)">
                <template #icon>
                  <SvgIcon local-icon="mdi-delete-outline" />
                </template>
              </NButton>
            </div>

            <!-- 类型不一致警告 -->
            <div
              v-if="getGroupTypeError(group.variables)"
              class="mb-1 rounded bg-orange-50 px-2 py-1 text-11px text-orange-5 dark:bg-orange-900/20"
            >
              <SvgIcon local-icon="mdi-alert-outline" class="mr-1 text-12px" />
              {{ getGroupTypeError(group.variables) }}
            </div>

            <!-- 分组变量列表 -->
            <div v-if="group.variables.length === 0" class="py-1 text-center text-xs text-gray-4">
              {{ $t('ai.workflow_node.variable_aggregator.no_variables') }}
            </div>
            <div class="flex flex-col gap-1">
              <div v-for="(varRef, varIndex) in group.variables" :key="varIndex" class="flex items-center gap-1">
                <div
                  class="min-w-0 flex-1 cursor-pointer truncate rounded px-2 py-1 text-11px"
                  :style="{
                    backgroundColor: getTagBackground(data.nodeColor),
                    borderLeft: `2px solid ${data.nodeColor}`,
                    color: data.nodeColor
                  }"
                >
                  <select
                    class="w-full bg-transparent text-11px outline-none"
                    :style="{ color: data.nodeColor }"
                    :value="`${varRef.sourceNodeId}::${varRef.sourceParam}`"
                    @change="
                      e => {
                        const val = (e.target as HTMLSelectElement).value;
                        const opt = flatParamOptions.find(o => `${o.sourceNodeId}::${o.sourceParam}` === val);
                        if (opt) selectGroupVariable(groupIndex, varIndex, opt);
                      }
                    "
                  >
                    <option value="::">{{ $t('ai.workflow_node.variable_aggregator.select_variable') }}</option>
                    <option
                      v-for="opt in flatParamOptions"
                      :key="`${opt.sourceNodeId}::${opt.sourceParam}`"
                      :value="`${opt.sourceNodeId}::${opt.sourceParam}`"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <span class="flex-shrink-0 text-10px text-gray-4">{{ varRef.type }}</span>
                <NButton secondary size="tiny" @click.stop="removeGroupVariable(groupIndex, varIndex)">
                  <template #icon>
                    <SvgIcon local-icon="mdi-minus" />
                  </template>
                </NButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 340px !important;
  max-width: 380px;
}

select option {
  background: white;
  color: #333;
}

:global(.dark) select option {
  background: #1e1e2e;
  color: #cdd6f4;
}
</style>
