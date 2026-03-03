<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'LoginInforSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { validate, restoreValidation } = useNaiveForm();

const dateRangeLoginTime = ref<[string, string] | null>(null);

const model = defineModel<Api.Monitor.LoginInforSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function onDateRangeLoginTimeUpdate(value: [string, string] | null) {
  if (value?.length) {
    model.value.params!.beginTime = value[0];
    model.value.params!.endTime = value[1];
  }
}

function resetModel() {
  dateRangeLoginTime.value = null;
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="user-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.monitor.logininfor.ipaddr')" path="ipaddr" class="pr-24px">
              <NInput v-model:value="model.ipaddr" :placeholder="$t('page.monitor.logininfor.form.ipaddr.required')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.monitor.logininfor.userName')"
              path="userName"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.userName"
                :placeholder="$t('page.monitor.logininfor.form.userName.required')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.monitor.logininfor.status')" path="status" class="pr-24px">
              <DictSelect
                v-model:value="model.status"
                :placeholder="$t('page.monitor.logininfor.form.status.required')"
                dict-code="sys_common_status"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.monitor.logininfor.loginTime')"
              path="loginTime"
              class="pr-24px"
            >
              <NDatePicker
                v-model:formatted-value="dateRangeLoginTime"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
                @update:formatted-value="onDateRangeLoginTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi span="24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
