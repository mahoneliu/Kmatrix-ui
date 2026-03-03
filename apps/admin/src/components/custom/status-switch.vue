<script setup lang="ts">
import { useBoolean } from '@sa/hooks';
import { enableStatusRecord } from '@/constants/business';
import { $t } from '@/locales';

defineOptions({
  name: 'StatusSwitch'
});

interface Props {
  disabled?: boolean;
  info?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  info: ''
});

const value = defineModel<Api.Common.EnableStatus>('value', { default: '0' });

interface Emits {
  (e: 'submitted', value: Api.Common.EnableStatus, callback: (flag: boolean) => void): void;
}

const emit = defineEmits<Emits>();

/** 状态切换过程的 loading 状态 */
const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean();

const handleUpdateValue = (val: Api.Common.EnableStatus) => {
  value.value = val === '0' ? '1' : '0';
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('common.confirmAction', { action: enableStatusRecord[val], info: props.info }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: () => {
      startLoading();
      emit('submitted', val, flag => {
        if (flag) value.value = val;
        endLoading();
      });
    },
    onNegativeClick: () => {}
  });
};
</script>

<template>
  <NSwitch
    v-model:value="value"
    :loading="loading"
    :rubber-band="false"
    checked-value="0"
    unchecked-value="1"
    :disabled="props.disabled"
    @update:value="handleUpdateValue"
  >
    <template #checked>
      {{ $t('common.enable') }}
    </template>
    <template #unchecked>
      {{ $t('common.disable') }}
    </template>
  </NSwitch>
</template>

<style scoped></style>
