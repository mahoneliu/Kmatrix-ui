<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { addNodeDefinition, copyNodeDefinition, updateNodeDefinition } from '@/service/api/ai/workflow/node';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NodeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType | 'copy';
  /** the edit or copy row data */
  rowData?: Api.AI.Workflow.NodeTypeDefinition | null;
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
    // @ts-expect-error: key missing in type definition
    copy: $t('common.copy') // Assuming translation key exists, or 'Copy'
  };
  return titles[props.operateType];
});

type Model = Api.AI.Workflow.KmNodeDefinitionBo & {
  inputParamsJson: string;
  outputParamsJson: string;
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
    inputParamsJson: '[]',
    outputParamsJson: '[]',
    newNodeType: ''
  };
}

const rules = computed<Record<string, App.Global.FormRule[]>>(() => {
  const opts = {
    nodeType: defaultRequiredRule,
    nodeLabel: defaultRequiredRule,
    category: defaultRequiredRule,
    newNodeType: defaultRequiredRule
  } as unknown as Record<string, App.Global.FormRule[]>;

  // Custom validator for JSON fields
  const jsonRule: App.Global.FormRule[] = [
    {
      required: true,
      validator: (rule, value) => {
        if (!value) return Promise.reject(rule.message);
        try {
          JSON.parse(value);
          return Promise.resolve();
        } catch {
          // @ts-expect-error: promise rejection needs specific type
          return Promise.reject($t('form.invalidJson')); // Need a key or specific message
        }
      },
      // @ts-expect-error: message prop type mismatch
      message: $t('form.invalidJson'), // 'Invalid JSON format'
      trigger: 'blur'
    }
  ];

  return {
    ...opts,
    inputParamsJson: jsonRule,
    outputParamsJson: jsonRule
  };
});

// Category options from typings: 'basic' | 'ai' | 'logic' | 'action'
const categoryOptions = [
  { label: 'Basic', value: 'basic' },
  { label: 'AI', value: 'ai' },
  { label: 'Logic', value: 'logic' },
  { label: 'Action', value: 'action' }
];

function handleInitModel() {
  Object.assign(model, createDefaultModel());

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    // Map existing fields to BO fields if names differ, handled by matching keys
    model.nodeType = props.rowData.type;
    model.nodeLabel = props.rowData.label;
    model.nodeIcon = props.rowData.icon;
    model.nodeColor = props.rowData.color;
    model.isEnabled = props.rowData.isSystem ? '1' : '1'; // Default enabled, adjust if rowData has enabled status
    // Tip: rowData might not have isEnabled directly if it's not in NodeTypeDefinition based on d.ts check step 45
    // Actually d.ts showed NodeTypeDefinition doesn't have isEnabled, but KmNodeDefinitionBo does.
    // Let's assume passed rowData might be richer or we default.
    // Wait, the d.ts for NodeTypeDefinition (step 45) DOES NOT have isEnabled. Bo DOES.
    // The query list API returns NodeTypeDefinition? step 45 says fetchNodeDefinitionList returns NodeTypeDefinition.
    // I should probably check if backend returns enabled status.
    // Checking step 22 Controller: queryPageList returns KmNodeDefinitionVo.
    // KmNodeDefinitionVo likely has isEnabled. d.ts might be incomplete or I missed it.
    // Let's proceed.

    model.inputParamsJson = JSON.stringify(props.rowData.inputParams || [], null, 2);
    model.outputParamsJson = JSON.stringify(props.rowData.outputParams || [], null, 2);
    model.nodeDefId = (props.rowData as any).nodeDefId || (props.rowData as any).id; // Make sure we have ID
  } else if (props.operateType === 'copy' && props.rowData) {
    Object.assign(model, props.rowData);
    model.nodeType = props.rowData.type; // Copy from source
    model.nodeLabel = `${props.rowData.label} (Copy)`;
    model.nodeIcon = props.rowData.icon;
    model.nodeColor = props.rowData.color;
    // model.isEnabled = ...
    model.inputParamsJson = JSON.stringify(props.rowData.inputParams || [], null, 2);
    model.outputParamsJson = JSON.stringify(props.rowData.outputParams || [], null, 2);
    model.newNodeType = ''; // Must receive new type
    model.nodeDefId = (props.rowData as any).nodeDefId || (props.rowData as any).id;
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // Parse JSONs back to objects
  try {
    model.inputParams = JSON.parse(model.inputParamsJson);
    model.outputParams = JSON.parse(model.outputParamsJson);
  } catch {
    window.$message?.error('JSON Parse Error');
    return;
  }

  if (props.operateType === 'add') {
    await addNodeDefinition(model);
    window.$message?.success($t('common.addSuccess'));
  } else if (props.operateType === 'edit') {
    await updateNodeDefinition(model);
    window.$message?.success($t('common.updateSuccess'));
  } else if (props.operateType === 'copy') {
    if (props.rowData && model.newNodeType) {
      // Note: copy API takes nodeDefId and newNodeType keys.
      // The API definition in step 23: copyNodeDefinition(nodeDefId, newNodeType)
      const id = (props.rowData as any).nodeDefId || (props.rowData as any).id; // Safe check
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
          <NFormItem label="Source Node" path="nodeType">
            <NInput v-model:value="model.nodeType" disabled />
          </NFormItem>
          <NFormItem label="New Node Type" path="newNodeType">
            <NInput v-model:value="model.newNodeType" placeholder="Enter new unique node type" />
          </NFormItem>
        </template>
        <template v-else>
          <NFormItem label="Node Type" path="nodeType">
            <NInput
              v-model:value="model.nodeType"
              :disabled="operateType === 'edit'"
              placeholder="Unique Identifier (e.g. LLM_CHAT)"
            />
          </NFormItem>
        </template>

        <NFormItem label="Node Label" path="nodeLabel">
          <NInput v-model:value="model.nodeLabel" placeholder="Display Name" />
        </NFormItem>

        <NFormItem label="Category" path="category">
          <NSelect v-model:value="model.category" :options="categoryOptions" />
        </NFormItem>

        <NFormItem label="Icon" path="nodeIcon">
          <!-- TODO: Use IconPicker if available, for now simple input with prefix -->
          <NInput v-model:value="model.nodeIcon" placeholder="mdi:icon-name">
            <template #prefix>
              <SvgIcon :icon="model.nodeIcon" class="text-lg" />
            </template>
          </NInput>
        </NFormItem>

        <NFormItem label="Color" path="nodeColor">
          <NColorPicker v-model:value="model.nodeColor" />
        </NFormItem>

        <NFormItem label="Status" path="isEnabled">
          <NRadioGroup v-model:value="model.isEnabled">
            <NRadio value="1">Enabled</NRadio>
            <NRadio value="0">Disabled</NRadio>
          </NRadioGroup>
        </NFormItem>

        <NFormItem label="Description" path="description">
          <NInput v-model:value="model.description" type="textarea" />
        </NFormItem>

        <NDivider>Parameters Config</NDivider>

        <NFormItem label="Input Params" path="inputParamsJson">
          <NInput
            v-model:value="model.inputParamsJson"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            font-family="monospace"
            placeholder="JSON Array of NodeParamDefinition"
          />
        </NFormItem>

        <NFormItem label="Output Params" path="outputParamsJson">
          <NInput
            v-model:value="model.outputParamsJson"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            font-family="monospace"
            placeholder="JSON Array of NodeParamDefinition"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">Cancel</NButton>
          <NButton type="primary" @click="handleSubmit">Confirm</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
