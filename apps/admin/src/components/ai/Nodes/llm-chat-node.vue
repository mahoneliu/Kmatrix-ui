<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NCollapse, NCollapseItem, NSelect, NSwitch, NTooltip } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchMcpServerList } from '@/service/api/ai/mcp-server';
import { fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { fetchGetAllSkillList } from '@/service/api/ai/skill';
import { useAiModelStore } from '@/store/modules/ai/ai-model';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { useNodeCollapse } from '@/composables/ai/workflow/use-node-collapse';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps & { drawerMode?: boolean }>();
const aiModelStore = useAiModelStore();
const { collapseProps } = useNodeCollapse();

// 工具配置（LLM 节点特有）
const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, {
  mcpServerIds: [] as string[],
  builtinToolIds: [] as string[],
  skillIds: [] as string[],
  enableToolTrace: false
});

// 计算摘要信息
const summaryItems = computed(() => {
  const items = [];
  const config = props.data.config || {};
  if (config.modelId) {
    const model = aiModelStore.models?.find(m => String(m.modelId) === String(config.modelId));
    items.push({
      label: $t('ai.workflow_public.model'),
      value: model?.modelName || config.modelId
    });
  }
  return items;
});

// 下拉选项
const mcpOptions = ref<{ label: string; value: string }[]>([]);
const toolOptions = ref<{ label: string; value: string }[]>([]);
const skillOptions = ref<{ label: string; value: string }[]>([]);

onMounted(() => {
  initData();
  aiModelStore.loadModels();

  fetchMcpServerList({ serverName: '' }).then(res => {
    const raw = res as any;
    const list: Api.Ai.McpServerVo[] = Array.isArray(raw) ? raw : (raw?.rows ?? raw?.data ?? []);
    mcpOptions.value = list
      .filter((s: Api.Ai.McpServerVo) => s.status === '0')
      .map((s: Api.Ai.McpServerVo) => ({ label: s.serverName, value: String(s.serverId) }));
  });

  fetchBuiltinToolList({ toolName: '' }).then(res => {
    const raw = res as any;
    const list: Api.Ai.BuiltinToolVo[] = Array.isArray(raw) ? raw : (raw?.rows ?? raw?.data ?? []);
    toolOptions.value = list
      .filter((t: Api.Ai.BuiltinToolVo) => t.status === '0')
      .map((t: Api.Ai.BuiltinToolVo) => ({ label: t.toolName, value: String(t.toolId) }));
  });

  fetchGetAllSkillList({ status: '0', skillName: '' }).then(res => {
    const raw = res as any;
    const list: Api.Ai.Skill.Info[] = Array.isArray(raw) ? raw : (raw?.rows ?? raw?.data ?? []);
    skillOptions.value = list.map((s: Api.Ai.Skill.Info) => ({ label: s.skillName, value: String(s.skillId) }));
  });
});
</script>

<template>
  <BaseNode
    v-bind="props"
    :data="data"
    :drawer-mode="props.drawerMode"
    :summary-items="summaryItems"
    class="llm-chat-node"
  >
    <div class="w-full">
      <NCollapse v-bind="collapseProps(['tools'])">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>

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
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}

:deep(.n-input__textarea-el),
:deep(.n-input__placeholder) {
  font-size: 12px;
}
</style>
