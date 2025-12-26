<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import { addModel, updateModel, fetchModelProviders, testModelConnection } from '@/service/api/ai';

const emit = defineEmits(['success']);

const message = useMessage();

const show = ref(false);
const type = ref<'add' | 'edit'>('add');
const loading = ref(false);
const providers = ref<Api.AI.ModelProvider[]>([]);

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

// 获取所有供应商以供选择
async function loadProviders() {
  const { data } = await fetchModelProviders();
  if (data) {
    providers.value = data;
  }
}

const isInitializing = ref(false);

const isSourceLocked = ref(false);

const filteredProviders = computed(() => {
  if (!modelForm.modelSource) return [];
  return providers.value.filter(p => p.providerType === modelForm.modelSource);
});


// 计算当前选中的供应商
const selectedProvider = computed(() => {
  return providers.value.find(p => p.providerId === modelForm.providerId);
});


// 监听模型来源变化，清空供应商和基础模型
watch(() => modelForm.modelSource, (newVal, oldVal) => {
  if (isInitializing.value) return;
  if (newVal !== oldVal) {
    modelForm.providerId = undefined;
    modelForm.modelKey = '';
  }
});

// 监听模型类型变化,自动清空基础模型
watch(() => modelForm.modelType, () => {
  if (isInitializing.value) return;
  // 当模型类型改变时,清空已选择的基础模型
  modelForm.modelKey = '';
});

onMounted(() => {
  loadProviders();
});

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
    } catch (e) {
      console.error('解析供应商模型列表失败', e);
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
      maxTokens: 2048,
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
      } catch (e) {
        console.error('解析模型配置失败', e);
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
  } catch (err) {
    // 校验失败或请求失败
    console.error('Submit failed:', err);
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
    class="w-650px rounded-12px"
    :segmented="{ content: true, action: true }"
  >
    <NForm ref="formRef" :model="modelForm" :rules="rules" label-placement="left" label-width="100">
      <NTabs type="line" animated>
        <NTabPane name="basic" tab="基础设置">
          <!-- ... omitted ... -->
          <div class="pt-4 flex flex-col">
            <NFormItem label="模型来源" path="modelSource">
              <NRadioGroup v-model:value="modelForm.modelSource" :disabled="isSourceLocked">
                <NRadioButton value="1">公有模型</NRadioButton>
                <NRadioButton value="2">本地模型</NRadioButton>
              </NRadioGroup>
            </NFormItem>
            <NFormItem label="模型名称" path="modelName">
              <NInput v-model:value="modelForm.modelName" placeholder="如：千问Max，方便记忆" />
            </NFormItem>
            <NFormItem label="供应商" path="providerId">
              <NSelect
                :key="modelForm.modelSource"
                v-model:value="modelForm.providerId"
                :options="filteredProviders"
                label-field="providerName"
                value-field="providerId"
                placeholder="请选择供应商"
                filterable
                clearable
              />
            </NFormItem>
            <NFormItem label="模型类型" path="modelType">
              <NSelect
                v-model:value="modelForm.modelType"
                :options="[
                  { label: '语言模型 (LLM)', value: '1' },
                  { label: '向量模型 (Embedding)', value: '2' }
                ]"
              />
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
              <div class="flex flex-col w-full gap-1">
                <NInput v-model:value="modelForm.apiKey" type="password" show-password-on="click" placeholder="请输入 API Key" />
                <div v-if="selectedProvider?.siteUrl && modelForm.modelSource === '1' " class="flex items-center gap-1 text-xs text-gray-500">
                  <span class="i-carbon-information" />
                  <span>没有 API Key？前往</span>
                  <a :href="selectedProvider.siteUrl" target="_blank" class="text-primary hover:underline flex items-center gap-0.5">
                    {{ selectedProvider.providerName }} 官网
                    <span class="i-carbon-launch text-10px" />
                  </a>
                  <span>获取</span>
                </div>
              </div>
            </NFormItem>
            <NFormItem label="API Base" path="apiBase">
              <NInput v-model:value="modelForm.apiBase" :placeholder="modelForm.modelSource === '1' ? '可选，留空使用供应商默认值' : '请填写本地部署的大模型的 API Base 地址'" />
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
          <div class="pt-4 flex flex-col h-480px">
            <!-- 语言模型参数 (Type 1) -->
            <template v-if="modelForm.modelType === '1'">
              <NFormItem label="最大 Token" path="maxTokens">
                <NInputNumber v-model:value="modelForm.maxTokens" :min="1" class="w-full" placeholder="默认使用模型上限" />
              </NFormItem>
              <NFormItem label="温度" path="temperature">
                <div class="flex-1 flex items-center gap-4">
                  <NSlider v-model:value="modelForm.temperature" :min="0" :max="2" :step="0.1" class="flex-1" />
                  <NInputNumber v-model:value="modelForm.temperature" :min="0" :max="2" :step="0.1" size="small" class="w-24" />
                </div>
              </NFormItem>
            </template>

            <!-- 向量模型参数 (Type 2) -->
            <template v-else-if="modelForm.modelType === '2'">
               <NEmpty description="该模型类型暂无高级参数配置" class="py-8" />
            </template>
          </div>
        </NTabPane>
      </NTabs>
    </NForm>

    <template #action>
      <div class="flex justify-end gap-2 w-full">
        <div class="flex-1">
           <NButton secondary :loading="testingConnection" @click="handleTestConnection">
             <template #icon><span class="i-carbon-connection-signal" /></template>
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
