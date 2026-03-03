<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { fetchCreateRole, fetchUpdateRole } from '@/service/api/system/role';
import { fetchGetRoleMenuTreeSelect } from '@/service/api/system';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import MenuTree from '@/components/custom/menu-tree.vue';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Role | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);

const visible = defineModel<boolean>('visible', {
  default: false
});

const { options: sysNormalDisableOptions } = useDict('sys_normal_disable', false);

const menuOptions = ref<Api.System.MenuList>([]);

const { loading: menuLoading, startLoading: startMenuLoading, endLoading: stopMenuLoading } = useLoading();

const { validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.role.addRole'),
    edit: $t('page.system.role.editRole')
  };
  return titles[props.operateType];
});

type Model = Api.System.RoleOperateParams;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    menuIds: [],
    roleName: '',
    roleKey: '',
    roleSort: 1,
    menuCheckStrictly: true,
    status: '0',
    remark: ''
  };
}

type RuleKey = Extract<keyof Model, 'roleName' | 'roleKey' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  roleName: createRequiredRule($t('page.system.role.form.roleName.required')),
  roleKey: createRequiredRule($t('page.system.role.form.roleKey.required')),
  status: createRequiredRule($t('page.system.role.form.status.required'))
};

async function handleUpdateModelWhenEdit() {
  menuOptions.value = [];
  model.value = createDefaultModel();
  model.value.menuIds = [];

  if (props.operateType === 'add') {
    menuTreeRef.value?.refresh();
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    startMenuLoading();
    Object.assign(model.value, jsonClone(props.rowData));
    const { data, error } = await fetchGetRoleMenuTreeSelect(model.value.roleId!);
    if (error) return;
    model.value.menuIds = data.checkedKeys;
    menuOptions.value = data.menus;
    stopMenuLoading();
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const { roleId, roleName, roleKey, roleSort, menuCheckStrictly, status, remark } = model.value;
  const menuIds = menuTreeRef.value?.getCheckedMenuIds();
  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreateRole({
      roleName,
      roleKey,
      roleSort,
      menuCheckStrictly,
      status,
      remark,
      menuIds
    });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateRole({
      roleId,
      roleName,
      roleKey,
      roleSort,
      menuCheckStrictly,
      status,
      remark,
      menuIds
    });
    if (error) return;
  }

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
          <NInput v-model:value="model.roleName" :placeholder="$t('page.system.role.form.roleName.required')" />
        </NFormItem>
        <NFormItem path="roleKey">
          <template #label>
            <div class="flex-center">
              <FormTip :content="$t('page.system.role.form.roleKey.tooltip')" />
              <span class="pl-3px">{{ $t('page.system.role.roleKey') }}</span>
            </div>
          </template>
          <NInput v-model:value="model.roleKey" :placeholder="$t('page.system.role.form.roleKey.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.role.roleSort')" path="roleSort">
          <NInputNumber v-model:value="model.roleSort" :placeholder="$t('page.system.role.form.roleSort.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.role.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in sysNormalDisableOptions" :key="item.value" :value="item.value" :label="item.label" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.system.role.menuPermission')" path="menuIds" class="pr-24px">
          <MenuTree
            v-if="visible"
            ref="menuTreeRef"
            v-model:checked-keys="model.menuIds"
            v-model:options="menuOptions"
            v-model:cascade="model.menuCheckStrictly"
            v-model:loading="menuLoading"
            :immediate="operateType === 'add'"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.role.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            :rows="3"
            type="textarea"
            :placeholder="$t('page.system.role.form.remark.required')"
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
