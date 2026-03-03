<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { useLoading } from '@sa/hooks';
import { fetchCreatePost, fetchUpdatePost } from '@/service/api/system/post';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PostOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Post | null;
  /** the dept tree data */
  deptData?: Api.Common.CommonTreeRecord;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();
const { loading: deptLoading, startLoading: startDeptLoading, endLoading: endDeptLoading } = useLoading();
const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.post.addPost'),
    edit: $t('page.system.post.editPost')
  };
  return titles[props.operateType];
});

type Model = Api.System.PostOperateParams;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    deptId: null,
    postCode: '',
    postCategory: '',
    postName: '',
    postSort: null,
    status: '0',
    remark: ''
  };
}

type RuleKey = Extract<keyof Model, 'postId' | 'deptId' | 'postCode' | 'postName' | 'postSort' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  postId: createRequiredRule($t('page.system.post.form.postId.required')),
  deptId: createRequiredRule($t('page.system.post.form.deptId.required')),
  postCode: createRequiredRule($t('page.system.post.form.postCode.required')),
  postName: createRequiredRule($t('page.system.post.form.postName.required')),
  postSort: createRequiredRule($t('page.system.post.form.postSort.required')),
  status: createRequiredRule($t('page.system.post.form.status.required'))
};

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    startDeptLoading();
    Object.assign(model.value, jsonClone(props.rowData));
    endDeptLoading();
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { postId, deptId, postCode, postCategory, postName, postSort, status, remark } = model.value;

  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreatePost({ deptId, postCode, postCategory, postName, postSort, status, remark });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdatePost({
      postId,
      deptId,
      postCode,
      postCategory,
      postName,
      postSort,
      status,
      remark
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
        <NFormItem :label="$t('page.system.dept.deptName')" path="deptId">
          <NTreeSelect
            v-model:value="model.deptId"
            :loading="deptLoading"
            clearable
            :options="deptData as []"
            label-field="label"
            key-field="id"
            :default-expanded-keys="deptData?.length ? [deptData[0].id] : []"
            :placeholder="$t('page.system.post.form.deptId.required')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.postCode')" path="postCode">
          <NInput v-model:value="model.postCode" :placeholder="$t('page.system.post.form.postCode.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.postCategory')" path="postCategory">
          <NInput v-model:value="model.postCategory" :placeholder="$t('page.system.post.form.postCategory.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.postName')" path="postName">
          <NInput v-model:value="model.postName" :placeholder="$t('page.system.post.form.postName.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.postSort')" path="postSort">
          <NInputNumber v-model:value="model.postSort" :placeholder="$t('page.system.post.form.postSort.required')" />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.status')" path="status">
          <DictRadio v-model:value="model.status" dict-code="sys_normal_disable" />
        </NFormItem>
        <NFormItem :label="$t('page.system.post.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            :rows="3"
            type="textarea"
            :placeholder="$t('page.system.post.form.remark.required')"
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
