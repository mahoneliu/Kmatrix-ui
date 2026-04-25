<script setup lang="ts">
import { onMounted } from 'vue';
import { NCollapseItem, NInputNumber, NSwitch, NTooltip } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { useAiNodeDialogConfig } from '@/composables/ai/workflow/use-ai-node';
import { $t } from '@/locales';
import VariableMention from '@/components/ai/Nodes/add-in/variable-mention.vue';

interface Props {
  /** 节点ID */
  nodeId: string;
  /** 节点数据 */
  nodeData: Workflow.NodeData;
}

const props = defineProps<Props>();

const { userPrompt, dialogConfig, initDialogConfig } = useAiNodeDialogConfig(props.nodeId, () => props.nodeData);

onMounted(() => {
  initDialogConfig();
});
</script>

<template>
  <NCollapseItem :title="$t('ai.workflow_node.dialog_config')" name="dialog-config">
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
          :node-id="nodeId"
          :rows="2"
          :placeholder="$t('ai.workflow_node.eg_analyze_problem')"
        />
      </div>

      <!-- 多模态开关 -->
      <div class="workflow-config-item">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <label class="workflow-label">{{ $t('ai.workflow_node.enable_multimodal') }}</label>
            <NTooltip>
              <template #trigger>
                <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
              </template>
              {{ $t('ai.workflow_node.enable_multimodal_desc') }}
            </NTooltip>
          </div>
          <NSwitch v-model:value="dialogConfig.enableMultimodal" size="small" />
        </div>
      </div>

      <!-- 历史对话开关 -->
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
          <NSwitch v-model:value="dialogConfig.historyEnabled" size="small" />
        </div>
      </div>

      <!-- 历史条数 -->
      <div v-if="dialogConfig.historyEnabled" class="workflow-config-item">
        <div class="flex items-center gap-2">
          <span class="workflow-label">{{ $t('ai.workflow_node.history_messages_count') }}</span>
          <NTooltip>
            <template #trigger>
              <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-gray-400" />
            </template>
            {{ $t('ai.workflow_node.keep_n_messages') }}
          </NTooltip>
          <NInputNumber
            v-model:value="dialogConfig.historyLimit"
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
</template>

<style scoped></style>
