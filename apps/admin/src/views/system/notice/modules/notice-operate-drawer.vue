<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import type { UmoEditor } from '@umoteam/editor';
import { fetchCreateNotice, fetchUpdateNotice } from '@/service/api/system/notice';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NoticeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.System.Notice | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const umoEditorRef = ref<InstanceType<typeof UmoEditor>>();
const { validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.notice.addNotice'),
    edit: $t('page.system.notice.editNotice')
  };
  return titles[props.operateType];
});

type Model = Api.System.NoticeOperateParams;

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  return {
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    status: '0'
  };
}

type RuleKey = Extract<keyof Model, 'noticeId' | 'noticeTitle' | 'noticeType' | 'noticeContent' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  noticeId: createRequiredRule($t('page.system.notice.form.noticeId.required')),
  noticeTitle: createRequiredRule($t('page.system.notice.form.noticeTitle.required')),
  noticeType: createRequiredRule($t('page.system.notice.form.noticeType.required')),
  noticeContent: createRequiredRule($t('page.system.notice.form.noticeContent.required')),
  status: createRequiredRule($t('page.system.notice.form.status.required'))
};

function handleUpdateModelWhenEdit() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  umoEditorRef.value?.saveContent();
  await validate();

  const { noticeId, noticeTitle, noticeType, noticeContent, status } = model.value;

  // request
  if (props.operateType === 'add') {
    const { error } = await fetchCreateNotice({ noticeTitle, noticeType, noticeContent, status });
    if (error) return;
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchUpdateNotice({ noticeId, noticeTitle, noticeType, noticeContent, status });
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
  <NDrawer
    v-model:show="visible"
    :trap-focus="false"
    :title="title"
    display-directive="show"
    :width="1000"
    class="max-w-90%"
  >
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm :model="model" :rules="rules">
        <div class="grid grid-cols-1 gap-16px md:grid-cols-4">
          <NFormItem class="col-span-2" :label="$t('page.system.notice.noticeTitle')" path="noticeTitle">
            <NInput
              v-model:value="model.noticeTitle"
              :placeholder="$t('page.system.notice.form.noticeTitle.required')"
            />
          </NFormItem>
          <NFormItem class="col-span-1" :label="$t('page.system.notice.noticeType')" path="noticeType">
            <DictRadio v-model:value="model.noticeType" dict-code="sys_notice_type" />
          </NFormItem>
          <NFormItem class="col-span-1" :label="$t('page.system.notice.status')" path="status">
            <DictRadio v-model:value="model.status" dict-code="sys_normal_disable" />
          </NFormItem>
        </div>
        <NFormItem :show-label="false" path="noticeContent">
          <UmoDocEditor ref="umoEditorRef" v-model:value="model.noticeContent!" />
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
