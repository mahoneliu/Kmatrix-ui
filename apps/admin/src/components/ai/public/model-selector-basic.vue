<script setup lang="ts">
import { ref, watch } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput, NInputNumber, NModal } from 'naive-ui';
import { useAiModelStore } from '@/store/modules/ai/ai-model';
import ModelSelector from '@/components/ai/public/model-selector.vue';
import TemperatureSlider from '@/components/ai/public/temperature-slider.vue';

defineOptions({
  name: 'ModelSelectorBasic'
});

interface Props {
  show: boolean;
  title?: string;
  defaultPrompt?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  alertContent?: string;
  showAlert?: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', data: { modelId: CommonType.IdType; prompt: string; temperature: number; maxTokens: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: '模型选择',
  defaultPrompt: '',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
  alertContent: '',
  showAlert: true
});

const emit = defineEmits<Emits>();

const aiModelStore = useAiModelStore();

// 表单数据
const formData = ref({
  modelId: null as CommonType.IdType | null,
  prompt: props.defaultPrompt,
  temperature: props.defaultTemperature,
  maxTokens: props.defaultMaxTokens
});

// 是否显示参数设置
const showAdvanced = ref(false);

// 监听模型变化,自动填充默认参数
watch(
  () => formData.value.modelId,
  modelId => {
    if (!modelId) return;
    const model = aiModelStore.models.find(m => m.modelId === modelId);
    if (model && model.config) {
      try {
        const config = JSON.parse(model.config);
        if (config.temperature !== undefined) {
          formData.value.temperature = config.temperature;
        }
        if (config.maxTokens !== undefined) {
          formData.value.maxTokens = config.maxTokens;
        }
      } catch {
        // ignore
      }
    }
  }
);

// 处理确认
function handleConfirm() {
  if (!formData.value.modelId) {
    return;
  }

  emit('confirm', {
    modelId: formData.value.modelId,
    prompt: formData.value.prompt,
    temperature: formData.value.temperature,
    maxTokens: formData.value.maxTokens
  });

  emit('update:show', false);
}

// 处理取消
function handleCancel() {
  emit('update:show', false);
}

// 重置表单
function resetForm() {
  formData.value = {
    modelId: null,
    prompt: props.defaultPrompt,
    temperature: props.defaultTemperature,
    maxTokens: props.defaultMaxTokens
  };
  showAdvanced.value = false;
}

// 监听弹窗关闭,重置表单
watch(
  () => props.show,
  show => {
    if (!show) {
      resetForm();
    }
  }
);
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="title"
    class="w-650px rounded-8px"
    :mask-closable="false"
    :segmented="{ content: true, action: true }"
    @update:show="emit('update:show', $event)"
  >
    <NForm :model="formData" label-placement="top" label-width="100">
      <!-- 提示信息 -->
      <NAlert v-if="showAlert && alertContent" type="info" class="mb-4">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="text-sm" v-html="alertContent"></div>
      </NAlert>

      <!-- AI 模型 -->
      <NFormItem label="AI 模型" path="modelId" required>
        <div class="w-full flex items-center gap-2">
          <ModelSelector v-model="formData.modelId" class="flex-1" placeholder="请选择 AI 模型" />
          <NButton text type="primary" @click="showAdvanced = !showAdvanced">
            <template #icon>
              <SvgIcon :local-icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" />
            </template>
            参数设置
          </NButton>
        </div>
      </NFormItem>

      <!-- 高级参数 -->
      <div v-if="showAdvanced">
        <div class="mb-4 text-sm font-medium">高级参数</div>

        <NFormItem label="温度 (Temperature)" path="temperature">
          <TemperatureSlider v-model:model-value="formData.temperature" :show-label="false" />
        </NFormItem>

        <NFormItem label="最大 Token (Max Tokens)" path="maxTokens">
          <NInputNumber v-model:value="formData.maxTokens" :min="1" class="w-full" placeholder="默认使用模型上限" />
        </NFormItem>
      </div>

      <!-- 提示词 -->
      <NFormItem label="提示词" path="prompt" required>
        <NInput
          v-model:value="formData.prompt"
          type="textarea"
          placeholder="请输入提示词"
          :rows="10"
          :autosize="{ minRows: 10, maxRows: 15 }"
        />
      </NFormItem>
    </NForm>

    <template #action>
      <div class="w-full flex justify-end gap-2">
        <NButton @click="handleCancel">取消</NButton>
        <NButton type="primary" :disabled="!formData.modelId" @click="handleConfirm">确定</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
:deep(code) {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}
</style>
