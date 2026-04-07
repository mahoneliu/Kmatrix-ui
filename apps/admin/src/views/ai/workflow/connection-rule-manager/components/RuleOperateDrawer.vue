<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { addConnectionRule, editConnectionRule, fetchEnabledNodeTypes } from '@/service/api/ai/connection-rule';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';

defineOptions({ name: 'RuleOperateDrawer' });

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.AI.ConnectionRule.Rule | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => (props.operateType === 'add' ? '新增规则' : '编辑规则'));

const nodeTypeOptions = ref<{ label: string; value: string }[]>([]);

async function loadNodeTypes() {
  const { data } = await fetchEnabledNodeTypes();
  if (data) {
    nodeTypeOptions.value = data.map(n => ({ label: `${n.nodeLabel} (${n.nodeType})`, value: n.nodeType }));
  }
}

type Model = Api.AI.ConnectionRule.SaveBo;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    sourceNodeType: '',
    targetNodeType: '',
    ruleType: '0',
    priority: 10,
    isEnabled: '1',
    remark: ''
  };
}

const rules = computed(() => ({
  sourceNodeType: defaultRequiredRule,
  targetNodeType: defaultRequiredRule,
  ruleType: defaultRequiredRule
}));

const ruleTypeOptions = [
  { label: '允许连接', value: '0' },
  { label: '禁止连接', value: '1' }
];

const isEnabledOptions = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' }
];

function handleInitModel() {
  Object.assign(model, createDefaultModel());
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, {
      ruleId: props.rowData.ruleId,
      sourceNodeType: props.rowData.sourceNodeType,
      targetNodeType: props.rowData.targetNodeType,
      ruleType: props.rowData.ruleType,
      priority: props.rowData.priority,
      isEnabled: props.rowData.isEnabled,
      remark: props.rowData.remark || ''
    });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const apiFn = props.operateType === 'add' ? addConnectionRule : editConnectionRule;
  const { error } = await apiFn(model);
  if (!error) {
    window.$message?.success(props.operateType === 'add' ? '新增成功' : '修改成功');
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, val => {
  if (val) {
    handleInitModel();
    restoreValidation();
    loadNodeTypes();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="480">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="left"
        :label-width="100"
        :show-feedback="false"
        class="flex flex-col gap-y-16px"
      >
        <NFormItem label="源节点类型" path="sourceNodeType">
          <NSelect
            v-model:value="model.sourceNodeType"
            :options="nodeTypeOptions"
            :disabled="operateType === 'edit'"
            placeholder="请选择源节点类型"
            filterable
          />
        </NFormItem>

        <NFormItem label="目标节点类型" path="targetNodeType">
          <NSelect
            v-model:value="model.targetNodeType"
            :options="nodeTypeOptions"
            :disabled="operateType === 'edit'"
            placeholder="请选择目标节点类型"
            filterable
          />
        </NFormItem>

        <NFormItem label="规则类型" path="ruleType">
          <NSelect v-model:value="model.ruleType" :options="ruleTypeOptions" />
        </NFormItem>

        <NFormItem label="优先级" path="priority">
          <NInputNumber v-model:value="model.priority" :min="0" :max="999" class="w-full" />
        </NFormItem>

        <NFormItem label="状态" path="isEnabled">
          <NSelect v-model:value="model.isEnabled" :options="isEnabledOptions" />
        </NFormItem>

        <NFormItem label="备注" path="remark">
          <NInput v-model:value="model.remark" type="textarea" :autosize="{ minRows: 2 }" placeholder="备注信息" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">取消</NButton>
          <NButton type="primary" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
