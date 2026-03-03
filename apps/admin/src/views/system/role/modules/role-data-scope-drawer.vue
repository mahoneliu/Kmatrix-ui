<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { dataScopeOptions } from '@/constants/business';
import { fetchGetRoleDeptTreeSelect, fetchUpdateRoleDataScope } from '@/service/api/system/role';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import DeptTree from '@/components/custom/dept-tree.vue';

defineOptions({
  name: 'RoleDataScopeDrawer'
});

interface Props {
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const deptTreeRef = ref<InstanceType<typeof DeptTree> | null>(null);

const visible = defineModel<boolean>('visible', {
  default: false
});

const deptOptions = ref<Api.System.Dept[]>([]);

const { loading: deptLoading, startLoading: startDeptLoading, endLoading: endDeptLoading } = useLoading();

const { validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => $t('page.system.role.selectDataScope'));

type Model = Api.System.RoleOperateParams;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleId: props.rowData?.roleId,
    roleName: props.rowData?.roleName,
    roleKey: props.rowData?.roleKey,
    roleSort: props.rowData?.roleSort,
    deptIds: [],
    menuIds: [],
    deptCheckStrictly: true,
    dataScope: '1'
  };
}

type RuleKey = Extract<keyof Model, 'dataScope'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  dataScope: createRequiredRule($t('page.system.role.form.dataScope.required'))
};

async function handleUpdateModelWhenEdit() {
  startDeptLoading();
  deptOptions.value = [];
  model.deptIds = [];

  if (props.rowData) {
    Object.assign(model, props.rowData);
    const { error, data } = await fetchGetRoleDeptTreeSelect(props.rowData.roleId!);
    if (error) return;
    deptOptions.value = data.depts;
    model.deptIds = data.checkedKeys;
  }
  endDeptLoading();
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { roleId, roleName, roleKey, roleSort, dataScope, deptIds, menuIds } = model;

  const { error } = await fetchUpdateRoleDataScope({
    roleId,
    roleName,
    roleKey,
    roleSort,
    dataScope,
    deptIds: dataScope === '2' ? deptIds : [],
    menuIds
  });
  if (error) return;

  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm :model="model" :rules="rules">
        <NFormItem :label="$t('page.system.role.roleName')" path="roleName">
          <NInput
            v-model:value="model.roleName"
            disabled
            :placeholder="$t('page.system.role.form.roleName.required')"
          />
        </NFormItem>
        <NFormItem path="roleKey">
          <template #label>
            <div class="flex-center">
              <FormTip :content="$t('page.system.role.form.roleKey.tooltip')" />
              <span class="pl-3px">{{ $t('page.system.role.roleKey') }}</span>
            </div>
          </template>
          <NInput v-model:value="model.roleKey" disabled :placeholder="$t('page.system.role.form.roleKey.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.role.dataScopeScope')" path="dataScope">
          <NSelect v-model:value="model.dataScope" :options="dataScopeOptions" />
        </NFormItem>
        <NFormItem
          v-if="model.dataScope === '2'"
          :label="$t('page.system.role.dataScope')"
          path="deptIds"
          class="pr-24px"
        >
          <DeptTree
            v-if="visible"
            ref="deptTreeRef"
            v-model:value="model.deptIds"
            v-model:options="deptOptions"
            v-model:loading="deptLoading"
            v-model:cascade="model.deptCheckStrictly"
            :immediate="false"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
