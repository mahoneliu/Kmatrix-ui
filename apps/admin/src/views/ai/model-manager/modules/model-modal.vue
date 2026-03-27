<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { aiModelTypeOptions, aiProviderTypeOptions } from '@/constants/business';
import { createModel, testModelConnection, updateModel } from '@/service/api/ai/model';
import { $t } from '@/locales';
import TemperatureSlider from '@/components/ai/public/temperature-slider.vue';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const message = useMessage();

const show = ref(false);
const type = ref<'add' | 'edit'>('add');
const loading = ref(false);

interface Props {
  providers?: Api.AI.Admin.ModelProvider[];
}
const props = withDefaults(defineProps<Props>(), {
  providers: () => []
});

const modelForm = reactive<any>({
  modelId: undefined,
  modelName: '',
  modelKey: '',
  modelType: '1',
  apiKey: '',
  apiBase: '',
  status: '0',
  providerId: undefined,
  config: '{}',
  temperature: 0.7,
  maxTokens: 2048,
  modelSource: '1',
  isDefault: 0,
  abilities: []
});

const rules = computed(() => {
  return {
    providerId: {
      required: true,
      type: 'integer' as const,
      message: $t('ai.model_manager.select_provider'),
      trigger: 'change'
    },
    modelName: { required: true, message: $t('ai.model_manager.input_model_name'), trigger: 'blur' },
    modelKey: { required: true, message: $t('ai.model_manager.select_base_model'), trigger: ['blur', 'change'] },
    modelType: { required: true, message: $t('ai.model_manager.select_model_type'), trigger: 'change' },
    modelSource: { required: true, message: $t('ai.model_manager.select_model_source'), trigger: 'change' },
    apiKey: { required: modelForm.modelSource === '1', message: $t('ai.model_manager.input_api_key'), trigger: 'blur' },
    apiBase: {
      required: modelForm.modelSource === '2',
      message: $t('ai.model_manager.input_api_base'),
      trigger: 'blur'
    }
  };
});

const formRef = ref<any>(null);

const isInitializing = ref(false);

const isSourceLocked = ref(false);

const filteredProviders = computed(() => {
  if (!modelForm.modelSource) return [];
  // 使用 props.providers
  return props.providers.filter((p: Api.AI.Admin.ModelProvider) => p.providerType === modelForm.modelSource);
});

// 计算当前选中的供应商
const selectedProvider = computed(() => {
  // 使用 props.providers
  return props.providers.find((p: Api.AI.Admin.ModelProvider) => p.providerId === modelForm.providerId);
});

// 监听模型来源变化，清空供应商和基础模型
watch(
  () => modelForm.modelSource,
  (newVal, oldVal) => {
    if (isInitializing.value) return;
    if (newVal !== oldVal) {
      modelForm.providerId = undefined;
      modelForm.modelKey = '';
    }
  }
);

// 监听模型类型变化,自动清空基础模型
watch(
  () => modelForm.modelType,
  () => {
    if (isInitializing.value) return;
    // 当模型类型改变时,清空已选择的基础模型
    modelForm.modelKey = '';
  }
);

// 监听供应商变化,自动清空基础模型
watch(
  () => modelForm.providerId,
  () => {
    if (isInitializing.value) return;
    // 当供应商改变时,清空已选择的基础模型
    modelForm.modelKey = '';
  }
);

// 计算当前选中供应商支持的模型列表(根据模型类型过滤)
const modelOptions = computed(() => {
  const provider = selectedProvider.value;
  if (provider && provider.models) {
    try {
      const models = JSON.parse(provider.models);
      if (Array.isArray(models)) {
        // 根据当前选择的模型类型过滤
        const filtered = models.filter((m: any) => {
          // 如果是对象格式(新格式),根据 modelType 过滤
          if (typeof m === 'object' && m.modelKey && m.modelType) {
            return m.modelType === modelForm.modelType;
          }
          // 兼容旧格式(纯字符串数组),全部显示
          return typeof m === 'string';
        });

        return filtered.map((m: any) => {
          if (typeof m === 'object') {
            return { label: m.modelKey, value: m.modelKey };
          }
          return { label: m, value: m };
        });
      }
    } catch {
      // ignore
    }
  }
  return [];
});

// 判断模型是否被锁定（默认向量模型禁止修改关键配置）
const isModelLocked = computed(() => {
  return type.value === 'edit' && modelForm.modelType === '2' && modelForm.isDefault === 1;
});

async function open(modalType: 'add' | 'edit', data?: any) {
  isInitializing.value = true;
  type.value = modalType;

  if (modalType === 'add') {
    // 基础初始化
    Object.assign(modelForm, {
      modelId: undefined,
      modelName: '',
      modelKey: '',
      modelType: '1',
      apiKey: '',
      apiBase: '',
      status: '0',
      config: '{}',
      temperature: 0.7,
      maxTokens: 2048,
      isDefault: 0,
      abilities: []
    });

    // 单独处理 modelSource 以设置锁定状态
    if (data?.modelSource) {
      modelForm.modelSource = data.modelSource;
      isSourceLocked.value = true;
    } else {
      modelForm.modelSource = '1'; // 默认公有
      isSourceLocked.value = false;
    }

    // 等待 computed 和 DOM 更新，确保 filteredProviders 已更新
    await nextTick();

    // 单独处理 providerId，确保不被 watcher 清除
    if (data?.providerId) {
      modelForm.providerId = data.providerId;
    } else {
      modelForm.providerId = undefined;
    }
  } else {
    isSourceLocked.value = true;
    const editData = { ...data };
    if (editData.config) {
      try {
        const configObj = JSON.parse(editData.config);
        Object.assign(editData, configObj);
      } catch {
        // ignore
      }
    }
    if (editData.abilities && typeof editData.abilities === 'string') {
      try {
        editData.abilities = JSON.parse(editData.abilities);
      } catch {
        editData.abilities = [];
      }
    } else if (!editData.abilities) {
      editData.abilities = [];
    }
    Object.assign(modelForm, editData);
  }

  // 使用 nextTick 确保 watcher 不会在初始化期间触发副作用
  await nextTick();
  isInitializing.value = false;
  show.value = true;
}

const testingConnection = ref(false);

async function handleTestConnection() {
  // 简单校验必要字段
  if (!modelForm.providerId || !modelForm.modelKey) {
    message.warning($t('ai.model_manager.select_provider_and_model_first'));
    return;
  }

  testingConnection.value = true;
  try {
    const submitData = { ...modelForm };
    const { error, data } = await testModelConnection(submitData);
    if (!error) {
      message.success(data || $t('ai.model_manager.test_connection_success'));
    }
  } finally {
    testingConnection.value = false;
  }
}

async function handleSubmit() {
  await formRef.value?.validate();

  loading.value = true;
  try {
    const api = type.value === 'add' ? createModel : updateModel;

    const submitData = { ...modelForm };

    // 根据模型类型构建配置
    let configObj = {};
    if (modelForm.modelType === '1') {
      // 语言模型参数
      configObj = {
        temperature: submitData.temperature,
        maxTokens: submitData.maxTokens
      };
    } else {
      // 其他模型参数 (暂无)
      configObj = {};
    }

    // 清理提交数据中的临时字段 (temperature/maxTokens 虽然在 modelForm 中，但后端可能不需要直接接收，而是通过 config)
    submitData.config = JSON.stringify(configObj);

    const { error } = await api(submitData);
    if (!error) {
      message.success(
        type.value === 'add' ? $t('ai.model_manager.add_success') : $t('ai.model_manager.update_success')
      );
      show.value = false;
      emit('success');
    }
  } catch {
    // 校验失败或请求失败
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <NModal
    v-model:show="show"
    preset="card"
    :auto-focus="false"
    :mask-closable="false"
    :title="type === 'add' ? $t('ai.model_manager.add_model_title') : $t('ai.model_manager.edit_model_title')"
    class="w-650px rounded-8px"
    :segmented="{ content: true, action: true }"
  >
    <NForm ref="formRef" :model="modelForm" :rules="rules" label-placement="left" label-width="100">
      <NTabs type="line" animated>
        <NTabPane name="basic" :tab="$t('ai.model_manager.basic_settings')">
          <!-- 基础设置表单 -->
          <div class="min-h-[580px] flex flex-col pr-3 pt-4">
            <NFormItem :label="$t('ai.model_manager.model_source')" path="modelSource">
              <NRadioGroup v-model:value="modelForm.modelSource" :disabled="isSourceLocked || isModelLocked">
                <NRadioButton v-for="option in aiProviderTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </NRadioButton>
              </NRadioGroup>
            </NFormItem>
            <NFormItem :label="$t('ai.model_manager.model_name')" path="modelName">
              <NInput
                v-model:value="modelForm.modelName"
                :placeholder="$t('ai.model_manager.model_name_placeholder')"
                :disabled="isModelLocked"
              />
            </NFormItem>
            <NFormItem :label="$t('ai.model_manager.provider.name')" path="providerId">
              <NSelect
                :key="modelForm.modelSource"
                v-model:value="modelForm.providerId"
                :options="filteredProviders as any"
                label-field="providerName"
                value-field="providerId"
                :placeholder="$t('ai.model_manager.select_provider')"
                filterable
                clearable
                :disabled="isModelLocked"
              />
            </NFormItem>
            <NFormItem :label="$t('ai.model_manager.model_type')" path="modelType">
              <NSelect v-model:value="modelForm.modelType" :options="aiModelTypeOptions" :disabled="isModelLocked" />
            </NFormItem>
            <NFormItem :label="$t('ai.model_manager.base_model')" path="modelKey">
              <NSelect
                v-model:value="modelForm.modelKey"
                :options="modelOptions"
                :placeholder="$t('ai.model_manager.base_model_placeholder')"
                filterable
                tag
                :disabled="isModelLocked"
              />
            </NFormItem>
            <NFormItem label="API Key" path="apiKey">
              <div class="w-full flex flex-col gap-1">
                <NInput
                  v-model:value="modelForm.apiKey"
                  :placeholder="$t('ai.model_manager.input_api_key')"
                  show-password-on="click"
                  type="password"
                  :disabled="isModelLocked"
                />
                <div
                  v-if="selectedProvider?.siteUrl && modelForm.modelSource === '1'"
                  class="flex items-center gap-1 text-xs text-gray-500"
                >
                  <span class="i-carbon-information" />
                  <span>{{ $t('ai.model_manager.no_api_key_tip') }}</span>
                  <a
                    :href="selectedProvider.siteUrl"
                    class="flex items-center gap-0.5 text-primary hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {{ selectedProvider.providerName }} {{ $t('ai.model_manager.official_website') }}
                    <span class="i-carbon-launch text-10px" />
                  </a>
                  <span>{{ $t('ai.model_manager.get') }}</span>
                </div>
              </div>
            </NFormItem>
            <NFormItem label="API Base" path="apiBase">
              <NInput
                v-model:value="modelForm.apiBase"
                :disabled="isModelLocked"
                :placeholder="
                  modelForm.modelSource === '1'
                    ? $t('ai.model_manager.api_base_placeholder1')
                    : $t('ai.model_manager.api_base_placeholder2')
                "
              />
            </NFormItem>
            <NFormItem :label="$t('common.status')">
              <NSwitch v-model:value="modelForm.status" checked-value="0" unchecked-value="1">
                <template #checked>{{ $t('common.enable') }}</template>
                <template #unchecked>{{ $t('common.disable') }}</template>
              </NSwitch>
            </NFormItem>
            <NFormItem label="设为兜底模型" path="isDefault">
              <NSwitch v-model:value="modelForm.isDefault" :checked-value="1" :unchecked-value="0">
                <template #checked>是</template>
                <template #unchecked>否</template>
              </NSwitch>
              <NTooltip v-if="isModelLocked" trigger="hover">
                <template #trigger>
                  <span class="i-carbon-information ml-2 cursor-help text-gray-400" />
                </template>
                默认向量模型禁止修改关键配置，以保证向量空间一致性。
              </NTooltip>
            </NFormItem>
            <NFormItem label="多模态能力 (能力标签)" path="abilities">
              <NCheckboxGroup v-model:value="modelForm.abilities">
                <NSpace item-style="display: flex;">
                  <NCheckbox value="vision" label="视觉 (Vision/Image-in)" />
                  <NCheckbox value="audio" label="语音 (Audio-in)" />
                  <!-- 避免前端与后端的类型差异，通常只勾选vision和audio以配合基础大模型本身能力 -->
                </NSpace>
              </NCheckboxGroup>
            </NFormItem>
          </div>
        </NTabPane>
        <NTabPane name="advanced" :tab="$t('ai.model_manager.advanced_settings')">
          <div class="min-h-[580px] flex flex-col pr-3 pt-4">
            <!-- 语言模型参数 (Type 1) -->
            <template v-if="modelForm.modelType === '1'">
              <NFormItem :label="$t('ai.model_manager.max_tokens')" path="maxTokens">
                <NInputNumber
                  v-model:value="modelForm.maxTokens"
                  :min="1"
                  class="w-full"
                  :placeholder="$t('ai.model_manager.max_tokens_placeholder')"
                />
              </NFormItem>
              <NFormItem :label="$t('ai.workflow_public.temperature')" path="temperature">
                <TemperatureSlider v-model:model-value="modelForm.temperature" :show-label="false" />
              </NFormItem>
            </template>

            <!-- 向量模型参数 (Type 2) -->
            <template v-else-if="modelForm.modelType === '2'">
              <NEmpty class="py-8" :description="$t('ai.model_manager.no_advanced_settings')" />
            </template>
          </div>
        </NTabPane>
      </NTabs>
    </NForm>

    <template #action>
      <div class="w-full flex justify-end gap-2">
        <div class="flex-1">
          <NButton :loading="testingConnection" secondary @click="handleTestConnection">
            <template #icon>
              <SvgIcon local-icon="carbon-network-overlay" />
            </template>
            {{ $t('ai.model_manager.test_connection') }}
          </NButton>
        </div>
        <NButton @click="show = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('ai.model_manager.submit') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
