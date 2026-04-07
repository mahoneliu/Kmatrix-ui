<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NRadioButton, NRadioGroup } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { addApp, updateApp } from '@/service/api/ai/app';

interface Props {
  visible: boolean;
  appType?: '1' | '2';
  data?: Api.AI.Admin.App | null;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', appId?: CommonType.IdType): void;
}
type AppFormModel = Partial<Api.AI.Admin.App>;

const props = withDefaults(defineProps<Props>(), {
  appType: '1',
  data: null
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const formRef = ref<(HTMLElement & { validate: () => Promise<void> }) | null>(null);

const isEdit = computed(() => Boolean(props.data?.appId));
const title = computed(() => (isEdit.value ? t('common.edit') : t('ai.app_manager.create_app')));

const isCustomWorkflow = computed(() => {
  const type = props.data?.appType || props.appType;
  return type === '2';
});

const formModel = ref<AppFormModel>({
  appId: undefined,
  appName: '',
  description: '',
  icon: '',
  appType: props.appType,
  useType: '1',
  status: '0'
});

const rules = {
  appName: { required: true, message: t('ai.app_manager.app_name_placeholder'), trigger: 'blur' }
};

async function handleSubmit() {
  await formRef.value?.validate();

  if (isEdit.value) {
    await updateApp(formModel.value);
    emit('success', formModel.value.appId);
  } else {
    const res = await addApp(formModel.value);
    emit('success', res.data);
  }
}

watch(
  () => props.visible,
  val => {
    if (val) {
      if (props.data) {
        formModel.value = {
          ...props.data,
          useType: props.data.useType || '1' // 默认值
        };
      } else {
        formModel.value = {
          appId: undefined,
          appName: '',
          description: '',
          appType: props.appType,
          useType: '1',
          status: '0'
        };
      }
    }
  }
);
</script>

<template>
  <NModal
    :show="visible"
    :title="title"
    class="w-600px"
    preset="card"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-placement="left"
      label-width="120"
      require-mark-placement="right-hanging"
    >
      <NFormItem :label="$t('ai.app_manager.app_name')" path="appName">
        <NInput v-model:value="formModel.appName" :placeholder="$t('ai.app_manager.app_name_placeholder')" />
      </NFormItem>
      <NFormItem :label="$t('ai.app_manager.app_desc')" path="description">
        <NInput
          v-model:value="formModel.description"
          :placeholder="$t('ai.app_manager.app_desc_placeholder')"
          type="textarea"
        />
      </NFormItem>
      <!-- useType 仅在自定义工作流时展示 -->
      <NFormItem v-if="isCustomWorkflow" :label="$t('ai.app_manager.use_type')" path="useType">
        <NRadioGroup v-model:value="formModel.useType" :disabled="isEdit">
          <NRadioButton value="1">{{ $t('ai.app_manager.use_type_chat') }}</NRadioButton>
          <NRadioButton value="2">{{ $t('ai.app_manager.use_type_file') }}</NRadioButton>
        </NRadioGroup>
        <template v-if="isEdit" #feedback>
          <span class="text-xs text-gray-400">创建后不可修改应用类型</span>
        </template>
      </NFormItem>
    </NForm>
    <template #footer>
      <div class="flex justify-end gap-2">
        <NButton @click="emit('update:visible', false)">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
