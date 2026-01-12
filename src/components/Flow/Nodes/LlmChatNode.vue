<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { NButton, NCollapse, NCollapseItem, NInput, NInputNumber, NModal, NSlider, NSpace } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import ModelSelector from '@/components/ai/ModelSelector.vue';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 温度预设模式
type TemperatureMode = 'precise' | 'balanced' | 'creative' | 'custom';

// 局部表单数据
const formModel = reactive<Workflow.LlmNodeConfig>({
  modelId: null as any,
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000
});

// 温度模式
const temperatureMode = ref<TemperatureMode>('balanced');

// 模型设置弹窗
const showModelSettings = ref(false);

// 温度预设值
const temperaturePresets = {
  precise: 0.3,
  balanced: 0.8,
  creative: 1
};

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.LlmNodeConfig | undefined;
  if (config) {
    formModel.modelId = (config.modelId || null) as any;
    formModel.systemPrompt = config.systemPrompt || '';
    formModel.temperature = config.temperature || 0.7;
    formModel.maxTokens = config.maxTokens || 2000;

    // 根据温度值设置模式
    updateTemperatureMode(formModel.temperature);
  }
}

// 根据温度值更新模式
function updateTemperatureMode(temp: number) {
  if (temp === temperaturePresets.precise) {
    temperatureMode.value = 'precise';
  } else if (temp === temperaturePresets.balanced) {
    temperatureMode.value = 'balanced';
  } else if (temp === temperaturePresets.creative) {
    temperatureMode.value = 'creative';
  } else {
    temperatureMode.value = 'custom';
  }
}

// 切换温度模式
function handleTemperatureModeChange(mode: TemperatureMode) {
  temperatureMode.value = mode;
  if (mode !== 'custom') {
    formModel.temperature = temperaturePresets[mode];
  }
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as Workflow.LlmNodeConfig | undefined;
    if (
      newValue.modelId !== currentConfig?.modelId ||
      newValue.systemPrompt !== currentConfig?.systemPrompt ||
      newValue.temperature !== currentConfig?.temperature ||
      newValue.maxTokens !== currentConfig?.maxTokens
    ) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.LlmNodeConfig | undefined;
    if (config) {
      if (
        config.modelId !== formModel.modelId ||
        config.systemPrompt !== formModel.systemPrompt ||
        config.temperature !== formModel.temperature ||
        config.maxTokens !== formModel.maxTokens
      ) {
        formModel.modelId = (config.modelId || null) as any;
        formModel.systemPrompt = config.systemPrompt || '';
        formModel.temperature = config.temperature || 0.7;
        formModel.maxTokens = config.maxTokens || 2000;
        updateTemperatureMode(formModel.temperature);
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: 'mdi:robot' }" class="llm-chat-node">
    <div class="w-100 p-2">
      <NCollapse :default-expanded-names="['config']">
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="config">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-12px font-500">
                模型
                <span class="ml-0.5 c-red-5">*</span>
              </label>
              <div class="flex items-center gap-2">
                <ModelSelector v-model="formModel.modelId" class="flex-1" />
                <NButton quaternary circle @click="showModelSettings = true">
                  <template #icon>
                    <SvgIcon icon="mdi:cog" class="text-18px" />
                  </template>
                </NButton>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-12px font-500">系统提示词</label>
              <NInput
                v-model:value="formModel.systemPrompt"
                type="textarea"
                :rows="3"
                placeholder="输入系统提示词，定义 AI 的角色和行为..."
              />
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>

    <!-- 模型设置弹窗 -->
    <NModal v-model:show="showModelSettings" preset="card" title="模型设置" class="w-140">
      <NForm :model="formModel" label-placement="left" label-width="120" size="medium">
        <div class="mb-2 mt-4 text-sm font-500">生成多样性</div>
        <!-- 生成多样性 -->
        <div>
          <div class="w-full flex flex-col items-center gap-3 pb-2">
            <NSpace>
              <NButton
                :type="temperatureMode === 'precise' ? 'primary' : 'default'"
                @click="handleTemperatureModeChange('precise')"
              >
                精确模式
              </NButton>
              <NButton
                :type="temperatureMode === 'balanced' ? 'primary' : 'default'"
                @click="handleTemperatureModeChange('balanced')"
              >
                平衡模式
              </NButton>
              <NButton
                :type="temperatureMode === 'creative' ? 'primary' : 'default'"
                @click="handleTemperatureModeChange('creative')"
              >
                创意模式
              </NButton>
              <NButton
                :type="temperatureMode === 'custom' ? 'primary' : 'default'"
                @click="handleTemperatureModeChange('custom')"
              >
                自定义
              </NButton>
            </NSpace>
          </div>
        </div>

        <!-- 生成随机性 -->
        <NFormItem label="生成随机性">
          <div class="w-full flex items-center gap-3">
            <NSlider
              v-model:value="formModel.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              :disabled="temperatureMode !== 'custom'"
              class="flex-1"
              @update:value="(val: number) => val !== undefined && updateTemperatureMode(val)"
            />
            <NInputNumber
              v-model:value="formModel.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              :disabled="temperatureMode !== 'custom'"
              class="w-24"
              @update:value="(val: number | null) => val !== null && updateTemperatureMode(val)"
            />
          </div>
        </NFormItem>

        <!-- 输入及输出设置 -->
        <div class="mb-2 mt-4 text-sm font-500">输入及输出设置</div>

        <!-- 最大回复长度 -->
        <NFormItem label="最大回复长度">
          <div class="w-full flex items-center gap-3">
            <NSlider v-model:value="formModel.maxTokens" :min="100" :max="8000" :step="100" class="flex-1" />
            <NInputNumber v-model:value="formModel.maxTokens" :min="100" :max="8000" :step="100" class="w-24" />
          </div>
        </NFormItem>
      </NForm>
    </NModal>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制 */
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
