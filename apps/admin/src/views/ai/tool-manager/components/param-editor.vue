<script setup lang="tsx">
import { ref, watch } from 'vue';
import { NButton, NDataTable, NForm, NFormItem, NInput, NModal, NPopconfirm, NSelect, NSpace, NSwitch } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { $t } from '@/locales';

export interface ParamItem {
  name: string;
  type: string;
  description: string;
  required: boolean;
  displayName?: string;
  defaultValue?: string;
}

interface Props {
  value?: ParamItem[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
  title: $t('ai.builtinTool.paramEditor.defaultTitle')
});

const emit = defineEmits<{
  (e: 'update:value', val: ParamItem[]): void;
}>();

const list = ref<ParamItem[]>([...props.value]);

watch(
  () => props.value,
  newVal => {
    list.value = [...newVal];
  },
  { deep: true }
);

function updateList() {
  emit('update:value', [...list.value]);
}

const showModal = ref(false);
const isEdit = ref(false);
const editIndex = ref(-1);
const formRef = ref<FormInst | null>(null);

const defaultForm = (): ParamItem => ({
  name: '',
  type: 'string',
  description: '',
  required: false,
  displayName: '',
  defaultValue: ''
});

const formModel = ref<ParamItem>(defaultForm());

const typeOptions = [
  { label: $t('ai.builtinTool.paramEditor.typeString'), value: 'string' },
  { label: $t('ai.builtinTool.paramEditor.typeNumber'), value: 'number' },
  { label: $t('ai.builtinTool.paramEditor.typeBoolean'), value: 'boolean' },
  { label: $t('ai.builtinTool.paramEditor.typeObject'), value: 'object' },
  { label: $t('ai.builtinTool.paramEditor.typeArray'), value: 'array' }
];

const rules: FormRules = {
  name: [
    { required: true, message: $t('ai.builtinTool.paramEditor.nameRequired'), trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: $t('ai.builtinTool.paramEditor.namePattern'), trigger: 'blur' }
  ]
};

function handleAdd() {
  isEdit.value = false;
  formModel.value = defaultForm();
  showModal.value = true;
}

function handleEdit(index: number, row: ParamItem) {
  isEdit.value = true;
  editIndex.value = index;
  formModel.value = { ...row };
  showModal.value = true;
}

function handleDelete(index: number) {
  list.value.splice(index, 1);
  updateList();
}

async function handleSave() {
  await formRef.value?.validate();
  if (isEdit.value) {
    list.value[editIndex.value] = { ...formModel.value };
  } else {
    // Check for duplicate name
    if (list.value.some(p => p.name === formModel.value.name)) {
      // You should preferably use a message API here, but for simplicity we just return
      return;
    }
    list.value.push({ ...formModel.value });
  }
  showModal.value = false;
  updateList();
}

const columns = [
  { title: $t('ai.builtinTool.paramEditor.name'), key: 'name' },
  { title: $t('ai.builtinTool.paramEditor.type'), key: 'type' },
  {
    title: $t('ai.builtinTool.paramEditor.required'),
    key: 'required',
    render(row: ParamItem) {
      return row.required ? $t('common.yesOrNo.yes') : $t('common.yesOrNo.no');
    }
  },
  {
    title: $t('common.operate'),
    key: 'actions',
    render(row: ParamItem, index: number) {
      return (
        <NSpace>
          <NButton size="small" type="primary" secondary onClick={() => handleEdit(index, row)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(index)}>
            {{
              default: () => $t('ai.builtinTool.paramEditor.deleteConfirm'),
              trigger: () => (
                <NButton size="small" type="error" secondary>
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      );
    }
  }
];
</script>

<template>
  <div>
    <NSpace vertical>
      <NButton dashed block @click="handleAdd">+ {{ $t('ai.builtinTool.paramEditor.addParam', { title }) }}</NButton>
      <NDataTable :columns="columns" :data="list" :bordered="false" />
    </NSpace>

    <NModal
      v-model:show="showModal"
      preset="card"
      :title="
        isEdit
          ? $t('ai.builtinTool.paramEditor.editParam', { title })
          : $t('ai.builtinTool.paramEditor.addParam', { title })
      "
      class="w-600px"
    >
      <NForm ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="120">
        <NFormItem :label="$t('ai.builtinTool.paramEditor.name')" path="name">
          <NInput v-model:value="formModel.name" :placeholder="$t('ai.builtinTool.paramEditor.namePlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('ai.builtinTool.paramEditor.displayName')" path="displayName">
          <NInput
            v-model:value="formModel.displayName"
            :placeholder="$t('ai.builtinTool.paramEditor.displayNamePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('ai.builtinTool.paramEditor.type')" path="type">
          <NSelect v-model:value="formModel.type" :options="typeOptions" />
        </NFormItem>
        <NFormItem :label="$t('ai.builtinTool.paramEditor.required')" path="required">
          <NSwitch v-model:value="formModel.required" />
        </NFormItem>
        <NFormItem :label="$t('ai.builtinTool.paramEditor.description')" path="description">
          <NInput
            v-model:value="formModel.description"
            type="textarea"
            :placeholder="$t('ai.builtinTool.paramEditor.descriptionPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('ai.builtinTool.paramEditor.defaultValue')" path="defaultValue">
          <NInput
            v-model:value="formModel.defaultValue"
            :placeholder="$t('ai.builtinTool.paramEditor.defaultValuePlaceholder')"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSave">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
