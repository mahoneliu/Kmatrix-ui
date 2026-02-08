<script setup lang="ts">
import { NSlider, NTooltip } from 'naive-ui';

interface Props {
  /** 温度值 */
  modelValue?: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 是否显示提示信息 */
  showTooltip?: boolean;
}

withDefaults(defineProps<Props>(), {
  modelValue: 0.7,
  showLabel: true,
  showTooltip: true
});

const emit = defineEmits<{
  /** 温度值变更事件 */
  'update:modelValue': [value: number];
}>();

// 温度标记
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

// 处理温度变更
function handleTemperatureChange(value: number) {
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="workflow-config-item flex-1">
    <div v-if="showLabel" class="flex items-center gap-2">
      <label class="mb-0 workflow-label">温度</label>
      <NTooltip v-if="showTooltip">
        <template #trigger>
          <SvgIcon local-icon="mdi-information-outline" class="cursor-help text-12px text-gray-400" />
        </template>
        温度越高,模型越随机,越倾向于创造性和创新性,但可能会降低准确性。
      </NTooltip>
    </div>
    <!-- 温度配置 -->
    <div class="mx-2 flex items-center gap-2">
      <div class="flex-1">
        <NSlider
          :value="modelValue"
          :min="0"
          :max="2"
          :step="0.1"
          :marks="temperatureMarks"
          class="text-xs"
          :format-tooltip="formatTemperature"
          @update:value="handleTemperatureChange"
        />
      </div>
      <div class="w-35px text-center text-sm text-gray-400 font-bold -mt-6">
        {{ formatTemperature(modelValue) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-config-item :deep(.n-slider-marks) {
  font-size: 10px;
}
</style>
