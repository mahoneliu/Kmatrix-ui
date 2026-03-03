<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import type { SelectProps } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchGetUserSelect } from '@/service/api/system';
import { $t } from '@/locales';

defineOptions({
  name: 'UserSelect'
});

interface Props {
  [key: string]: any;
}

defineProps<Props>();

const value = defineModel<CommonType.IdType | null>('value', { required: false });

const attrs: SelectProps = useAttrs();

const { loading: userLoading, startLoading: startUserLoading, endLoading: endUserLoading } = useLoading();

/** the enabled role options */
const userOptions = ref<CommonType.Option<CommonType.IdType>[]>([]);

async function getUserOptions() {
  startUserLoading();
  const { error, data } = await fetchGetUserSelect();

  if (!error) {
    userOptions.value = data.map(item => ({
      label: `${item.nickName} ( ${item.userName} )`,
      value: item.userId
    }));
  }
  endUserLoading();
}

getUserOptions();
</script>

<template>
  <NSelect
    v-model:value="value"
    :loading="userLoading"
    :options="userOptions"
    v-bind="attrs"
    :placeholder="$t('common.pleaseCheckValue') + $t('page.system.user.userName')"
  />
</template>

<style scoped></style>
