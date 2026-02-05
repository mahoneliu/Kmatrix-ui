<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCollapseItem, NInputNumber, NSwitch, NTooltip } from 'naive-ui';
import ModelSelector from '@/components/ai/public/model-selector.vue';
import TemperatureSlider from '@/components/ai/public/temperature-slider.vue';
import VariableMention from '@/components/ai/Nodes/add-in/variable-mention.vue';

interface Props {
  /** 节点数据 */
  nodeData: Workflow.NodeData;
  /** 节点ID (用于变量引用) */
  nodeId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** AI配置变更事件 */
  updateAiConfig: [config: Workflow.AiConfig];
}>();

// AI配置(本地状态)
const modelId = ref<string | null>(null);
const temperature = ref<number>(0.7);
const maxTokens = ref<number | null>(null);
const systemPrompt = ref<string>('');
const streamOutput = ref<boolean>(false);

// 初始化配置从nodeData
watch(
  () => props.nodeData,
  newData => {
    const config = newData.config || {};
    modelId.value = (config.modelId || null) as string | null;
    temperature.value = config.temperature ?? 0.7;
    maxTokens.value = config.maxTokens ?? null;
    systemPrompt.value = config.systemPrompt ?? '';
    streamOutput.value = config.streamOutput ?? false;
  },
  { immediate: true, deep: true }
);

// 配置变更时触发更新
function handleConfigChange() {
  emit('updateAiConfig', {
    modelId: modelId.value,
    temperature: temperature.value,
    maxTokens: maxTokens.value,
    systemPrompt: systemPrompt.value,
    streamOutput: streamOutput.value
  });
}
</script>

<template>
  <NCollapseItem title="AI模型配置" name="ai-config">
    <template #header-extra>
      <NTooltip>
        <template #trigger>
          <SvgIcon icon="mdi:robot" class="text-14px text-primary" />
        </template>
        配置大语言模型的行为参数
      </NTooltip>
    </template>

    <div class="workflow-config-section">
      <!-- 模型选择 -->
      <div class="workflow-config-item">
        <label class="workflow-label">
          模型
          <span class="workflow-label-required">*</span>
        </label>
        <ModelSelector v-model:model-value="modelId" @update:model-value="handleConfigChange" />
      </div>

      <div class="workflow-config-item">
        <div class="flex items-center gap-1">
          <span class="workflow-label">系统提示词</span>
          <NTooltip>
            <template #trigger>
              <SvgIcon icon="mdi:information-outline" class="cursor-help text-12px text-gray-400" />
            </template>
            定义AI助手的角色和行为规范
          </NTooltip>
        </div>
      </div>
      <div>
        <VariableMention
          v-model:model-value="systemPrompt"
          :node-id="nodeId"
          :rows="3"
          placeholder="例如:你是一个专业的客服助手... (输入 / 选择变量)"
          @update:model-value="handleConfigChange"
        />
      </div>

      <!-- 温度配置 -->
      <TemperatureSlider v-model:model-value="temperature" @update:model-value="handleConfigChange" />

      <!-- 最大Token数 -->
      <div class="workflow-config-item flex-1">
        <div class="flex items-center gap-2">
          <span class="workflow-label">Max Tokens</span>
          <NTooltip>
            <template #trigger>
              <SvgIcon icon="mdi:information-outline" class="cursor-help text-gray-400" />
            </template>
            模型生成的最大token数,留空则使用模型默认值
          </NTooltip>
          <NInputNumber
            v-model:value="maxTokens"
            :min="1"
            :max="128000"
            placeholder="不限制"
            size="small"
            class="flex-1 workflow-input"
            clearable
            @update:value="handleConfigChange"
          />
        </div>
      </div>

      <!-- 流式输出开关 -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <label class="workflow-label">流式输出</label>
          <NTooltip>
            <template #trigger>
              <SvgIcon icon="mdi:information-outline" class="cursor-help text-gray-400" />
            </template>
            开启后,模型将实时输出结果,而不是等待生成完成后一次性返回
          </NTooltip>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">{{ streamOutput ? '开启' : '关闭' }}</span>
          <NSwitch v-model:value="streamOutput" size="small" @update:value="handleConfigChange" />
        </div>
      </div>
    </div>
  </NCollapseItem>
</template>

<style scoped>
.ai-config-panel :deep(.n-slider-marks) {
  font-size: 10px;
}
</style>
