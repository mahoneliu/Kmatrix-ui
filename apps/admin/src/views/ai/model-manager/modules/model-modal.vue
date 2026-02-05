<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { aiModelTypeOptions, aiProviderTypeOptions } from '@/constants/business';
import { addModel, testModelConnection, updateModel } from '@/service/api/ai/model';
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
// const providers = ref<Api.AI.Admin.ModelProvider[]>([]); // Removed internal ref

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
  modelSource: '1'
});

const rules = computed(() => {
  return {
    providerId: { required: true, type: 'integer' as const, message: '请选择供应商', trigger: 'change' },
    modelName: { required: true, message: '请输入模型名称', trigger: 'blur' },
    modelKey: { required: true, message: '请输入或选择基础模型', trigger: ['blur', 'change'] },
    modelType: { required: true, message: '请选择模型类型', trigger: 'change' },
    modelSource: { required: true, message: '请选择模型来源', trigger: 'change' },
    apiKey: { required: modelForm.modelSource === '1', message: '请输入apiKey', trigger: 'blur' },
    apiBase: { required: modelForm.modelSource === '2', message: '请输入apiBase 地址', trigger: 'blur' }
  };
});

const formRef = ref<any>(null);

// 移除 loadProviders 函数
// 移除 onMounted 钩子

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

// onMounted removed

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

// ... (omitted)

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
      maxTokens: 2048
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
    message.warning('请先选择供应商和基础模型');
    return;
  }

  testingConnection.value = true;
  try {
    const submitData = { ...modelForm };
    const { error, data } = await testModelConnection(submitData);
    if (!error) {
      message.success(data || '连接测试成功');
    }
  } finally {
    testingConnection.value = false;
  }
}

async function handleSubmit() {
  await formRef.value?.validate();

  loading.value = true;
  try {
    const api = type.value === 'add' ? addModel : updateModel;

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
      message.success(type.value === 'add' ? '新增成功' : '修改成功');
      show.value = false;
      emit('success');
    }
  } catch {
    // 校验失败或请求失败
    // console.error('Submit failed:', err);
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
    :title="type === 'add' ? '新增模型' : '编辑模型'"
    class="w-650px rounded-8px"
    :segmented="{ content: true, action: true }"
  >
    <NForm ref="formRef" :model="modelForm" :rules="rules" label-placement="left" label-width="100">
      <NTabs type="line" animated>
        <NTabPane name="basic" tab="基础设置">
          <!-- 基础设置表单 -->
          <div class="min-h-[580px] flex flex-col pr-3 pt-4">
            <NFormItem label="模型来源" path="modelSource">
              <NRadioGroup v-model:value="modelForm.modelSource" :disabled="isSourceLocked">
                <NRadioButton v-for="option in aiProviderTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </NRadioButton>
              </NRadioGroup>
            </NFormItem>
            <NFormItem label="模型名称" path="modelName">
              <NInput v-model:value="modelForm.modelName" placeholder="如：千问Max，方便记忆" />
            </NFormItem>
            <NFormItem label="供应商" path="providerId">
              <NSelect
                :key="modelForm.modelSource"
                v-model:value="modelForm.providerId"
                :options="filteredProviders as any"
                label-field="providerName"
                value-field="providerId"
                placeholder="请选择供应商"
                filterable
                clearable
              />
            </NFormItem>
            <NFormItem label="模型类型" path="modelType">
              <NSelect v-model:value="modelForm.modelType" :options="aiModelTypeOptions" />
            </NFormItem>
            <NFormItem label="基础模型" path="modelKey">
              <NSelect
                v-model:value="modelForm.modelKey"
                :options="modelOptions"
                placeholder="选择基础模型或直接输入"
                filterable
                tag
              />
            </NFormItem>
            <NFormItem label="API Key" path="apiKey">
              <div class="w-full flex flex-col gap-1">
                <NInput
                  v-model:value="modelForm.apiKey"
                  placeholder="请输入 API Key"
                  show-password-on="click"
                  type="password"
                />
                <div
                  v-if="selectedProvider?.siteUrl && modelForm.modelSource === '1'"
                  class="flex items-center gap-1 text-xs text-gray-500"
                >
                  <span class="i-carbon-information" />
                  <span>没有 API Key？前往</span>
                  <a
                    :href="selectedProvider.siteUrl"
                    class="flex items-center gap-0.5 text-primary hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {{ selectedProvider.providerName }} 官网
                    <span class="i-carbon-launch text-10px" />
                  </a>
                  <span>获取</span>
                </div>
              </div>
            </NFormItem>
            <NFormItem label="API Base" path="apiBase">
              <NInput
                v-model:value="modelForm.apiBase"
                :placeholder="
                  modelForm.modelSource === '1'
                    ? '可选，留空使用供应商默认值'
                    : '请填写本地部署的大模型的 API Base 地址'
                "
              />
            </NFormItem>
            <NFormItem label="状态">
              <NSwitch v-model:value="modelForm.status" checked-value="0" unchecked-value="1">
                <template #checked>启用</template>
                <template #unchecked>禁用</template>
              </NSwitch>
            </NFormItem>
          </div>
        </NTabPane>
        <NTabPane name="advanced" tab="高级参数">
          <div class="min-h-[580px] flex flex-col pr-3 pt-4">
            <!-- 语言模型参数 (Type 1) -->
            <template v-if="modelForm.modelType === '1'">
              <NFormItem label="最大 Token" path="maxTokens">
                <NInputNumber
                  v-model:value="modelForm.maxTokens"
                  :min="1"
                  class="w-full"
                  placeholder="默认使用模型上限"
                />
              </NFormItem>
              <NFormItem label="温度" path="temperature">
                <TemperatureSlider v-model:model-value="modelForm.temperature" :show-label="false" />
              </NFormItem>
            </template>

            <!-- 向量模型参数 (Type 2) -->
            <template v-else-if="modelForm.modelType === '2'">
              <NEmpty class="py-8" description="该模型类型暂无高级参数配置" />
            </template>
          </div>
        </NTabPane>
      </NTabs>
    </NForm>

    <template #action>
      <div class="w-full flex justify-end gap-2">
        <div class="flex-1">
          <NButton :loading="testingConnection" secondary @click="handleTestConnection">
            <!-- <template #icon><span class="i-carbon-network-overlay" /></template> -->
            <template #icon>
              <SvgIcon icon="carbon:network-overlay" />
            </template>
            测试连接
          </NButton>
        </div>
        <NButton @click="show = false">取消</NButton>
        <NButton type="primary" :loading="loading" @click="handleSubmit">提交</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
