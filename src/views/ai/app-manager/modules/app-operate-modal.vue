<script lang="ts" setup>
import { ref, watch } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSlider,
  NSwitch,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import { addApp, updateApp } from '@/service/api/ai/admin/app';
import { fetchModels } from '@/service/api/ai/admin/model';

interface Props {
  visible: boolean;
  type?: 'add' | 'edit';
  data?: Api.AI.App | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', appId?: number, appType?: '1' | '2'): void;
}

/** 应用表单模型（省略审计字段） */
type AppFormModel = Omit<Api.AI.App, 'createBy' | 'createByName' | 'updateBy' | 'updateByName'>;

const props = withDefaults(defineProps<Props>(), {
  type: 'add',
  data: null
});

const emit = defineEmits<Emits>();

const message = useMessage();
const formRef = ref<(HTMLElement & { validate: () => Promise<void> }) | null>(null);

const modelOptions = ref<Array<{ label: string; value: CommonType.IdType }>>([]);

const formModel = ref<AppFormModel>({
  appId: undefined,
  appName: '',
  description: '',
  icon: '',
  appType: '1',
  status: '0',
  prologue: '',
  modelSetting: {
    prompt: '',
    temperature: 0.7,
    top_p: 0.8,
    max_tokens: 2048,
    opening_statement: '' // deprecated? using prologue
  },
  knowledgeSetting: {
    topK: 3,
    similarityThreshold: 0.6,
    searchMode: 'hybrid',
    maxParagraphChar: 500,
    returnDirectlyWhenNoRef: false,
    showCitation: true
  },
  workflowConfig: {
    showProcess: true
  },
  modelId: 0,
  remark: '',
  createTime: '',
  updateTime: ''
});

const rules = {
  appName: { required: true, message: '请输入应用名称', trigger: 'blur' },
  appType: { required: true, message: '请选择应用类型', trigger: 'change' }
};

const appTypeOptions = [
  { label: '基础对话', value: '1' },
  { label: '工作流', value: '2' }
];

const searchModeOptions = [
  { label: '混合检索', value: 'hybrid' },
  { label: '向量检索', value: 'embedding' },
  { label: '全文检索', value: 'fulltext' }
];

async function getModelList() {
  const res = await fetchModels();
  if (res.data && Array.isArray(res.data)) {
    modelOptions.value = res.data.map((item: Api.AI.Admin.Model) => ({
      label: item.modelName,
      value: item.modelId
    }));
  }
}

async function handleSubmit() {
  await formRef.value?.validate();

  let createdAppId: number | undefined;
  const appType = formModel.value.appType;

  if (props.type === 'add') {
    const res = await addApp(formModel.value);
    message.success('创建成功');
    // 获取创建的应用ID
    createdAppId = res.data?.appId ? Number(res.data.appId) : undefined;
  } else {
    await updateApp(formModel.value);
    message.success('更新成功');
  }

  emit('success', createdAppId, appType);
  emit('update:visible', false);
}

function handleClose() {
  emit('update:visible', false);
}

watch(
  () => props.visible,
  val => {
    if (val) {
      getModelList();
      if (props.type === 'edit' && props.data) {
        // Deep clone to avoid mutating prop
        // Note: props.data might differ slightly in structure if nested objects are null
        const clone = JSON.parse(JSON.stringify(props.data));
        // Ensure nested objects exist
        if (!clone.modelSetting) clone.modelSetting = { ...formModel.value.modelSetting };
        if (!clone.knowledgeSetting) clone.knowledgeSetting = { ...formModel.value.knowledgeSetting };
        if (!clone.workflowConfig) clone.workflowConfig = { ...formModel.value.workflowConfig };
        formModel.value = clone;
      } else {
        // Reset
        formModel.value = {
          appId: undefined,
          appName: '',
          description: '',
          icon: '',
          appType: '1',
          status: '0',
          prologue: '',
          modelSetting: {
            prompt: '',
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: 2048,
            opening_statement: ''
          },
          knowledgeSetting: {
            topK: 3,
            similarityThreshold: 0.6,
            searchMode: 'hybrid',
            maxParagraphChar: 500,
            returnDirectlyWhenNoRef: false,
            showCitation: true
          },
          workflowConfig: {
            showProcess: true
          },
          modelId: 0,
          remark: '',
          createTime: '',
          updateTime: ''
        };
      }
    }
  }
);
</script>

<template>
  <NModal
    :show="visible"
    :title="type === 'add' ? '新建应用' : '编辑应用'"
    class="w-800px"
    preset="card"
    @update:show="emit('update:visible', $event)"
  >
    <NForm
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <NTabs animated type="line">
        <NTabPane name="basic" tab="基础设置">
          <NFormItem label="应用名称" path="appName">
            <NInput v-model:value="formModel.appName" placeholder="请输入应用名称" />
          </NFormItem>
          <NFormItem label="应用图标" path="icon">
            <NInput v-model:value="formModel.icon" placeholder="请输入图标URL" />
            <!-- TODO: Image Upload -->
          </NFormItem>
          <NFormItem label="应用类型" path="appType">
            <NSelect v-model:value="formModel.appType" :options="appTypeOptions" />
          </NFormItem>
          <NFormItem label="应用描述" path="description">
            <NInput v-model:value="formModel.description" placeholder="请输入应用描述" type="textarea" />
          </NFormItem>
          <NFormItem label="开场白" path="prologue">
            <NInput v-model:value="formModel.prologue" placeholder="请输入开场白" type="textarea" />
          </NFormItem>
        </NTabPane>

        <NTabPane name="model" tab="模型配置">
          <NFormItem label="关联模型" path="modelId">
            <NSelect
              v-model:value="formModel.modelId"
              :options="modelOptions"
              clearable
              filterable
              placeholder="请选择模型"
            />
          </NFormItem>
          <NFormItem label="提示词" path="modelSetting.prompt">
            <NInput
              v-model:value="formModel.modelSetting.prompt"
              :rows="5"
              placeholder="System Prompt"
              type="textarea"
            />
          </NFormItem>
          <NFormItem label="随机性(Temperature)">
            <div class="flex flex-1 items-center gap-2">
              <NSlider
                v-model:value="formModel.modelSetting.temperature"
                :max="1"
                :min="0"
                :step="0.1"
                class="flex-1"
              />
              <NInputNumber v-model:value="formModel.modelSetting.temperature" class="w-20" size="small" />
            </div>
          </NFormItem>
          <NFormItem label="核采样(Top P)">
            <div class="flex flex-1 items-center gap-2">
              <NSlider v-model:value="formModel.modelSetting.top_p" :max="1" :min="0" :step="0.1" class="flex-1" />
              <NInputNumber v-model:value="formModel.modelSetting.top_p" class="w-20" size="small" />
            </div>
          </NFormItem>
          <NFormItem label="最大Token">
            <NInputNumber v-model:value="formModel.modelSetting.max_tokens" />
          </NFormItem>
        </NTabPane>

        <NTabPane name="knowledge" tab="知识库配置">
          <!-- TODO: Knowledge Selection -->
          <NFormItem label="检索模式">
            <NSelect v-model:value="formModel.knowledgeSetting.searchMode" :options="searchModeOptions" />
          </NFormItem>
          <NFormItem label="Top K">
            <NInputNumber v-model:value="formModel.knowledgeSetting.topK" />
          </NFormItem>
          <NFormItem label="相似度阈值">
            <div class="flex flex-1 items-center gap-2">
              <NSlider
                v-model:value="formModel.knowledgeSetting.similarityThreshold"
                :max="1"
                :min="0"
                :step="0.1"
                class="flex-1"
              />
              <NInputNumber v-model:value="formModel.knowledgeSetting.similarityThreshold" class="w-20" size="small" />
            </div>
          </NFormItem>
          <NFormItem label="显示引用">
            <NSwitch v-model:value="formModel.knowledgeSetting.showCitation" />
          </NFormItem>
        </NTabPane>
      </NTabs>
    </NForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton @click="handleClose">取消</NButton>
        <NButton type="primary" @click="handleSubmit">确定</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
