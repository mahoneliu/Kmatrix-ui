<script setup lang="ts">
import { ref, watch } from 'vue';
import { NCollapseItem, NInput, NInputNumber, NSlider, NSwitch, NTooltip } from 'naive-ui';

interface Props {
  /** 节点数据 */
  nodeData: Workflow.NodeData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** AI配置变更事件 */
  updateAiConfig: [config: Workflow.AiConfig];
}>();

// AI配置（本地状态）
const temperature = ref<number>(0.7);
const maxTokens = ref<number | null>(null);
const systemPrompt = ref<string>('');
const streamOutput = ref<boolean>(false);

// 初始化配置从nodeData
watch(
  () => props.nodeData,
  newData => {
    const config = newData.config || {};
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
    temperature: temperature.value,
    maxTokens: maxTokens.value,
    systemPrompt: systemPrompt.value,
    streamOutput: streamOutput.value
  });
}

// 温度提示
const temperatureMarks = {
  0: '精确',
  0.5: '平衡',
  1: '创意',
  1.5: '随机',
  2: '极随机'
};

// 温度格式化
function formatTemperature(value: number) {
  return value.toFixed(1);
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

    <div class="ai-config-panel space-y-3">
      <!-- 温度配置 -->
      <div class="flex items-center gap-2">
        <div class="w-65px flex-shrink-0 text-gray-500">温度</div>
        <div class="flex-1">
          <NSlider
            v-model:value="temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :marks="temperatureMarks"
            :format-tooltip="formatTemperature"
            @update:value="handleConfigChange"
          />
        </div>
        <div class="w-35px text-center text-xs text-gray-400">{{ formatTemperature(temperature) }}</div>
      </div>

      <!-- 最大Token数 -->
      <div class="flex items-center gap-2">
        <div class="w-65px flex-shrink-0 text-gray-500">Max Tokens</div>
        <NInputNumber
          v-model:value="maxTokens"
          :min="1"
          :max="128000"
          placeholder="不限制"
          size="small"
          class="flex-1"
          clearable
          @update:value="handleConfigChange"
        />
        <NTooltip>
          <template #trigger>
            <SvgIcon icon="mdi:information-outline" class="cursor-help text-gray-400" />
          </template>
          模型生成的最大token数，留空则使用模型默认值
        </NTooltip>
      </div>

      <!-- 系统提示词 -->
      <div class="space-y-1">
        <div class="flex items-center gap-1 text-gray-500">
          <span>系统提示词</span>
          <NTooltip>
            <template #trigger>
              <SvgIcon icon="mdi:information-outline" class="cursor-help text-12px text-gray-400" />
            </template>
            定义AI助手的角色和行为规范
          </NTooltip>
        </div>
        <NInput
          v-model:value="systemPrompt"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="例如：你是一个专业的客服助手..."
          size="small"
          @update:value="handleConfigChange"
        />
      </div>

      <!-- 流式输出开关 -->
      <div class="flex items-center gap-2">
        <div class="w-65px flex-shrink-0 text-gray-500">流式输出</div>
        <NSwitch v-model:value="streamOutput" size="small" @update:value="handleConfigChange" />
        <span class="text-xs text-gray-400">{{ streamOutput ? '开启（作为thinking事件输出）' : '关闭' }}</span>
      </div>
    </div>
  </NCollapseItem>
</template>

<style scoped>
.ai-config-panel :deep(.n-slider-marks) {
  font-size: 10px;
}
</style>
