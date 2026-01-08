<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { addNodeDefinition, copyNodeDefinition, updateNodeDefinition } from '@/service/api/ai/workflow/node';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import NodeParamEditor from './node-param-editor.vue';

defineOptions({
  name: 'NodeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType | 'copy';
  /** the edit or copy row data */
  rowData?: Api.AI.Workflow.KmNodeDefinitionBo | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType | 'copy', string> = {
    add: $t('common.add'),
    edit: $t('common.edit'),
    copy: $t('common.copy')
  };
  return titles[props.operateType];
});

type Model = Api.AI.Workflow.KmNodeDefinitionBo & {
  newNodeType?: string; // For copy operation
};

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    nodeType: '',
    nodeLabel: '',
    nodeIcon: 'mdi:code-json',
    nodeColor: '#10b981',
    category: 'basic',
    description: '',
    isEnabled: '1',
    inputParams: [],
    outputParams: [],
    newNodeType: ''
  };
}

const rules = computed<Record<string, App.Global.FormRule[]>>(() => {
  return {
    nodeType: defaultRequiredRule,
    nodeLabel: defaultRequiredRule,
    category: defaultRequiredRule,
    newNodeType: defaultRequiredRule
  } as unknown as Record<string, App.Global.FormRule[]>;
});

// Category options from typings: 'basic' | 'ai' | 'logic' | 'action'
const categoryOptions = [
  { label: '基础', value: 'basic' },
  { label: 'AI', value: 'ai' },
  { label: '逻辑', value: 'logic' },
  { label: '动作', value: 'action' }
];

function handleInitModel() {
  Object.assign(model, createDefaultModel());

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    model.inputParams = props.rowData.inputParams || [];
    model.outputParams = props.rowData.outputParams || [];
  } else if (props.operateType === 'copy' && props.rowData) {
    Object.assign(model, props.rowData);
    model.nodeLabel = `${props.rowData.nodeLabel} (副本)`;
    model.inputParams = props.rowData.inputParams || [];
    model.outputParams = props.rowData.outputParams || [];
    model.newNodeType = '';
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (props.operateType === 'add') {
    await addNodeDefinition(model);
    window.$message?.success($t('common.addSuccess'));
  } else if (props.operateType === 'edit') {
    await updateNodeDefinition(model);
    window.$message?.success($t('common.updateSuccess'));
  } else if (props.operateType === 'copy') {
    if (props.rowData && model.newNodeType) {
      const id = (props.rowData as any).nodeDefId || (props.rowData as any).id;
      await copyNodeDefinition(id, model.newNodeType);
      window.$message?.success($t('common.addSuccess'));
    }
  }

  closeDrawer();
  emit('submitted');
}

watch(visible, val => {
  if (val) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" title="Title" display-directive="show" :width="600">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <template v-if="operateType === 'copy'">
          <NFormItem label="源节点" path="nodeType">
            <NInput v-model:value="model.nodeType" disabled />
          </NFormItem>
          <NFormItem label="新节点类型" path="newNodeType">
            <NInput v-model:value="model.newNodeType" placeholder="输入新的唯一节点类型" />
          </NFormItem>
        </template>
        <template v-else>
          <NFormItem label="节点类型" path="nodeType">
            <NInput
              v-model:value="model.nodeType"
              :disabled="operateType === 'edit'"
              placeholder="唯一标识符 (例如: LLM_CHAT)"
            />
          </NFormItem>
        </template>

        <NFormItem label="节点名称" path="nodeLabel">
          <NInput v-model:value="model.nodeLabel" placeholder="显示名称" />
        </NFormItem>

        <NFormItem label="分类" path="category">
          <NSelect v-model:value="model.category" :options="categoryOptions" />
        </NFormItem>

        <NFormItem label="图标" path="nodeIcon">
          <NInput v-model:value="model.nodeIcon" placeholder="例如: mdi:robot">
            <template #prefix>
              <SvgIcon :icon="model.nodeIcon" class="text-lg" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem label="颜色" path="nodeColor">
          <NColorPicker v-model:value="model.nodeColor" />
        </NFormItem>

        <NFormItem label="状态" path="isEnabled">
          <NRadioGroup v-model:value="model.isEnabled">
            <NRadio value="1">启用</NRadio>
            <NRadio value="0">禁用</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem label="描述" path="description">
          <NInput v-model:value="model.description" type="textarea" />
        </NFormItem>

        <NDivider>参数配置</NDivider>

        <NodeParamEditor v-model="model.inputParams" title="输入参数" />

        <div class="mt-4">
          <NodeParamEditor v-model="model.outputParams" title="输出参数" />
        </div>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
