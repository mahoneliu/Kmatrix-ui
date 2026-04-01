<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NInputNumber, NSelect, NSwitch, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchMcpServerList } from '@/service/api/ai/mcp-server';
import { fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { fetchGetAllSkillList } from '@/service/api/ai/skill';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';
import VariableMention from './add-in/variable-mention.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据 (仅保留特有配置)
const formModel = reactive({
  historyEnabled: false,
  historyLimit: 10,
  mcpServerIds: [] as string[],
  builtinToolIds: [] as string[],
  skillIds: [] as string[],
  enableToolTrace: false,
  enableMultimodal: false
});

// MCP Server 和工具下拉选项
const mcpOptions = ref<{ label: string; value: string }[]>([]);
const toolOptions = ref<{ label: string; value: string }[]>([]);
const skillOptions = ref<{ label: string; value: string }[]>([]);

// 用户提示词 (独立管理)
const userPrompt = ref<string>('');

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (config) {
    formModel.historyEnabled = config.historyEnabled || false;
    formModel.historyLimit = config.historyLimit || 10;
    formModel.mcpServerIds = (config.mcpServerIds as string[]) || [];
    formModel.builtinToolIds = (config.builtinToolIds as string[]) || [];
    formModel.skillIds = (config.skillIds as string[]) || [];
    formModel.enableToolTrace = config.enableToolTrace || false;
    formModel.enableMultimodal = config.enableMultimodal || false;
    userPrompt.value = config.userPrompt || $t('ai.workflow_node.default_user_prompt');
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
    if (
      newValue.historyEnabled !== currentConfig?.historyEnabled ||
      newValue.historyLimit !== currentConfig?.historyLimit ||
      JSON.stringify(newValue.mcpServerIds) !== JSON.stringify(currentConfig?.mcpServerIds) ||
      JSON.stringify(newValue.builtinToolIds) !== JSON.stringify(currentConfig?.builtinToolIds) ||
      JSON.stringify(newValue.skillIds) !== JSON.stringify(currentConfig?.skillIds) ||
      newValue.enableToolTrace !== currentConfig?.enableToolTrace ||
      newValue.enableMultimodal !== currentConfig?.enableMultimodal
    ) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听用户提示词变化
watch(userPrompt, newValue => {
  const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (newValue !== currentConfig?.userPrompt) {
    workflowStore.updateNodeConfig(props.id, { userPrompt: newValue });
  }
});

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.LlmNodeConfig | undefined;
    if (config) {
      if (config.historyEnabled !== formModel.historyEnabled || config.historyLimit !== formModel.historyLimit) {
        formModel.historyEnabled = config.historyEnabled || false;
        formModel.historyLimit = config.historyLimit || 10;
      }
      if (JSON.stringify(config.mcpServerIds) !== JSON.stringify(formModel.mcpServerIds)) {
        formModel.mcpServerIds = (config.mcpServerIds as string[]) || [];
      }
      if (JSON.stringify(config.builtinToolIds) !== JSON.stringify(formModel.builtinToolIds)) {
        formModel.builtinToolIds = (config.builtinToolIds as string[]) || [];
      }
      if (JSON.stringify(config.skillIds) !== JSON.stringify(formModel.skillIds)) {
        formModel.skillIds = (config.skillIds as string[]) || [];
      }
      if (config.enableToolTrace !== formModel.enableToolTrace) {
        formModel.enableToolTrace = config.enableToolTrace || false;
      }
      if (config.enableMultimodal !== formModel.enableMultimodal) {
        formModel.enableMultimodal = config.enableMultimodal || false;
      }
      if (config.userPrompt !== userPrompt.value) {
        userPrompt.value = config.userPrompt || '';
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
  // 加载 MCP Server 选项
  fetchMcpServerList({ serverName: '' }).then(res => {
    const list = (res as any)?.data ?? res ?? [];
    mcpOptions.value = list
      .filter((s: Api.Ai.McpServerVo) => s.status === '0')
      .map((s: Api.Ai.McpServerVo) => ({ label: s.serverName, value: String(s.serverId) }));
  });
  // 加载内置工具选项
  fetchBuiltinToolList({ toolName: '' }).then(res => {
    const list = (res as any)?.data ?? res ?? [];
    toolOptions.value = list
      .filter((t: Api.Ai.BuiltinToolVo) => t.status === '0')
      .map((t: Api.Ai.BuiltinToolVo) => ({ label: t.toolName, value: String(t.toolId) }));
  });
  // 加载技能选项
  fetchGetAllSkillList({ status: '0', skillName: '' }).then(res => {
    const list = (res as any)?.data ?? res ?? [];
    skillOptions.value = list.map((s: Api.Ai.Skill.Info) => ({ label: s.skillName, value: String(s.skillId) }));
  });
});

// 处理配置变更
function handleConfigChange() {
  // VariableMention 组件会自动触发 update:model-value
}
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="llm-chat-node">
    <div class="w-93">
      <NCollapse :default-expanded-names="['history']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>

        <!-- 对话配置 -->
        <NCollapseItem :title="$t('ai.workflow_node.dialog_config')" name="history">
          <div class="workflow-config-section">
            <!-- 用户提示词 -->
            <div class="workflow-config-item">
              <div class="flex items-center gap-1">
                <span class="workflow-label">{{ $t('ai.workflow_node.user_prompt') }}</span>
                <NTooltip>
                  <template #trigger>
                    <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                  </template>
                  {{ $t('ai.workflow_node.user_prompt_desc') }}
                </NTooltip>
              </div>
            </div>
            <div>
              <VariableMention
                v-model:model-value="userPrompt"
                class="text-xs"
                :node-id="props.id"
                :rows="2"
                :placeholder="$t('ai.workflow_node.eg_analyze_problem')"
                @update:model-value="handleConfigChange"
              />
            </div>

            <!-- 历史对话配置 -->
            <div class="workflow-config-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <label class="workflow-label">{{ $t('ai.workflow_node.enable_history_dialog') }}</label>
                  <NTooltip>
                    <template #trigger>
                      <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                    </template>
                    {{ $t('ai.workflow_node.enable_context_memory') }}
                  </NTooltip>
                </div>
                <NSwitch v-model:value="formModel.historyEnabled" size="small" />
              </div>
            </div>

            <!-- 多模态开关 -->
            <div class="workflow-config-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <label class="workflow-label">启用多模态 (视觉/音频)</label>
                  <NTooltip>
                    <template #trigger>
                      <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                    </template>
                    开启后，大模型将能读取传入的图片或音频附件进行多模态分析
                  </NTooltip>
                </div>
                <NSwitch v-model:value="formModel.enableMultimodal" size="small" />
              </div>
            </div>

            <div v-if="formModel.historyEnabled" class="workflow-config-item">
              <div class="flex items-center gap-2">
                <span class="workflow-label">{{ $t('ai.workflow_node.history_messages_count') }}</span>
                <NTooltip>
                  <template #trigger>
                    <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-gray-400" />
                  </template>
                  {{ $t('ai.workflow_node.keep_n_messages') }}
                </NTooltip>
                <NInputNumber
                  v-model:value="formModel.historyLimit"
                  :min="1"
                  :max="50"
                  :step="1"
                  size="small"
                  class="flex-1 workflow-input"
                  :placeholder="$t('ai.workflow_node.latest_n_messages')"
                />
              </div>
            </div>
          </div>
        </NCollapseItem>

        <!-- 工具配置 -->
        <NCollapseItem :title="$t('ai.workflow_node.tool_config')" name="tools">
          <div class="workflow-config-section">
            <!-- 绑定 MCP Server -->
            <div class="workflow-config-item">
              <span class="workflow-label">{{ $t('ai.workflow_node.bind_mcp_servers') }}</span>
              <NSelect
                v-model:value="formModel.mcpServerIds"
                multiple
                :options="mcpOptions"
                :placeholder="$t('ai.workflow_node.mcp_select_placeholder')"
                size="small"
                class="mt-1"
              />
            </div>

            <!-- 绑定内置工具 -->
            <div class="workflow-config-item">
              <span class="workflow-label">{{ $t('ai.workflow_node.bind_builtin_tools') }}</span>
              <NSelect
                v-model:value="formModel.builtinToolIds"
                multiple
                :options="toolOptions"
                :placeholder="$t('ai.workflow_node.tool_select_placeholder')"
                size="small"
                class="mt-1"
              />
            </div>

            <!-- 绑定智能技能 -->
            <div class="workflow-config-item">
              <span class="workflow-label">{{ $t('ai.workflow_node.bind_skills') || '绑定技能' }}</span>
              <NSelect
                v-model:value="formModel.skillIds"
                multiple
                :options="skillOptions"
                :placeholder="$t('ai.workflow_node.skill_select_placeholder') || '请选择技能'"
                size="small"
                class="mt-1"
              />
            </div>

            <!-- 输出工具执行过程 -->
            <div class="workflow-config-item">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <label class="workflow-label">{{ $t('ai.workflow_node.enable_tool_trace') }}</label>
                  <NTooltip>
                    <template #trigger>
                      <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
                    </template>
                    {{ $t('ai.workflow_node.enable_tool_trace_desc') }}
                  </NTooltip>
                </div>
                <NSwitch v-model:value="formModel.enableToolTrace" size="small" />
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制 */
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}

:deep(.n-input__textarea-el),
:deep(.n-input__placeholder) {
  font-size: 12px;
}
</style>
