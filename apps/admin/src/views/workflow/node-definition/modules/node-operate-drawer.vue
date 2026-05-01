<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { NODE_CATEGORY_OPTIONS } from '@/constants/workflow';
import { addNodeDefinition, copyNodeDefinition, updateNodeDefinition } from '@/service/api/ai/node';
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
    allowCustomInputParams: '0',
    allowCustomOutputParams: '0',
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
const categoryOptions = NODE_CATEGORY_OPTIONS;

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

  let errorObj = null;
  if (props.operateType === 'add') {
    const { error } = await addNodeDefinition(model);
    errorObj = error;
    if (!error) window.$message?.success($t('common.addSuccess'));
  } else if (props.operateType === 'edit') {
    const { error } = await updateNodeDefinition(model);
    errorObj = error;
    if (!error) window.$message?.success($t('common.updateSuccess'));
  } else if (props.operateType === 'copy') {
    if (props.rowData && model.newNodeType) {
      const id = (props.rowData as any).nodeDefId || (props.rowData as any).id;
      const { error } = await copyNodeDefinition(id, model.newNodeType);
      errorObj = error;
      if (!error) window.$message?.success($t('common.addSuccess'));
    }
  }

  if (!errorObj) {
    closeDrawer();
    emit('submitted');
  }
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
      <NForm
        ref="formRef"
        :model="model"
        class="flex flex-col gap-y-15px"
        :rules="rules"
        :show-feedback="false"
        label-placement="left"
        :label-width="100"
      >
        <template v-if="operateType === 'copy'">
          <NFormItem :label="$t('ai.node_definition.source_node')" path="nodeType">
            <NInput v-model:value="model.nodeType" disabled />
          </NFormItem>
          <NFormItem :label="$t('ai.node_definition.new_node_type')" path="newNodeType">
            <NInput v-model:value="model.newNodeType" :placeholder="$t('ai.node_definition.input_new_node_type')" />
          </NFormItem>
        </template>
        <template v-else>
          <NFormItem :label="$t('ai.node_definition.node_type')" path="nodeType">
            <NInput
              v-model:value="model.nodeType"
              :disabled="operateType === 'edit'"
              :placeholder="$t('ai.node_definition.unique_id_placeholder')"
            />
          </NFormItem>
        </template>

        <NFormItem :label="$t('ai.node_definition.node_name')" path="nodeLabel">
          <NInput v-model:value="model.nodeLabel" :placeholder="$t('ai.node_definition.display_name')" />
        </NFormItem>

        <NFormItem :label="$t('ai.node_definition.category_label')" path="category">
          <NSelect v-model:value="model.category" :options="categoryOptions" />
        </NFormItem>

        <NFormItem :label="$t('ai.node_definition.icon')" path="nodeIcon">
          <NInput v-model:value="model.nodeIcon" :placeholder="$t('ai.node_definition.icon_placeholder')">
            <template #prefix>
              <SvgIcon :local-icon="model.nodeIcon" class="text-lg" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem :label="$t('ai.node_definition.color')" path="nodeColor">
          <NColorPicker v-model:value="model.nodeColor" />
        </NFormItem>

        <NFormItem :label="$t('common.status')" path="isEnabled">
          <NRadioGroup v-model:value="model.isEnabled">
            <NRadio value="1">{{ $t('common.enable') }}</NRadio>
            <NRadio value="0">{{ $t('common.disable') }}</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem :label="$t('common.description')" path="description">
          <NInput
            v-model:value="model.description"
            type="textarea"
            :autosize="{ minRows: 2 }"
            :placeholder="$t('ai.node_definition.node_desc_placeholder')"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.node_definition.custom_input_params')" path="allowCustomInputParams">
          <NRadioGroup v-model:value="model.allowCustomInputParams">
            <NRadio value="1">{{ $t('ai.node_definition.allow') }}</NRadio>
            <NRadio value="0">{{ $t('ai.node_definition.forbid') }}</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem :label="$t('ai.node_definition.custom_output_params')" path="allowCustomOutputParams">
          <NRadioGroup v-model:value="model.allowCustomOutputParams">
            <NRadio value="1">{{ $t('ai.node_definition.allow') }}</NRadio>
            <NRadio value="0">{{ $t('ai.node_definition.forbid') }}</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NDivider class="!my-12px">{{ $t('ai.node_definition.parameter_config') }}</NDivider>

        <NAlert type="warning" closable>
          <template #icon>
            <icon-ic-round-info class="text-icon" />
          </template>
          <template #header>
            <span class="text-sm font-medium">{{ $t('ai.node_definition.prompt') }}</span>
          </template>
          <template #default>
            <span class="text-sm">
              {{ $t('ai.node_definition.param_config_warning1') }}
              <br />
            </span>
            <span class="text-sm">{{ $t('ai.node_definition.param_config_warning2') }}</span>
          </template>
        </NAlert>

        <NodeParamEditor v-model="model.inputParams" :title="$t('ai.node_definition.input_params')" />

        <div class="mt-4">
          <NodeParamEditor v-model="model.outputParams" :title="$t('ai.node_definition.output_params')" />
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
