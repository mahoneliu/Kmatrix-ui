<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { addApp } from '@/service/api/ai/app';

interface Props {
  visible: boolean;
  appType?: '1' | '2';
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', appId?: CommonType.IdType): void;
}
type AppFormModel = Partial<Api.AI.Admin.App>;

const props = withDefaults(defineProps<Props>(), {
  appType: '1'
});

const emit = defineEmits<Emits>();

const { t } = useI18n();
const formRef = ref<(HTMLElement & { validate: () => Promise<void> }) | null>(null);

const formModel = ref<AppFormModel>({
  appId: undefined,
  appName: '',
  description: '',
  icon: '',
  appType: props.appType,
  status: '0',
  remark: '',
  createTime: '',
  updateTime: ''
});

const rules = {
  appName: { required: true, message: t('ai.app_manager.app_name_placeholder'), trigger: 'blur' }
};

async function handleSubmit() {
  await formRef.value?.validate();

  const res = await addApp(formModel.value);
  const createdAppId = res.data;
  emit('success', createdAppId);
}

watch(
  () => props.visible,
  val => {
    if (val) {
      formModel.value = {
        appId: undefined,
        appName: '',
        description: '',
        appType: props.appType,
        status: '0'
      };
    }
  }
);
</script>

<template>
  <NModal
    :show="visible"
    :title="$t('ai.app_manager.create_app')"
    class="w-800px"
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
