<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'OssSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { validate, restoreValidation } = useNaiveForm();

const dateRangeCreateTime = ref<[string, string] | null>(null);

const model = defineModel<Api.System.OssSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function onDateRangeCreateTimeUpdate(value: [string, string] | null) {
  const params = model.value.params!;
  if (value && value.length === 2) {
    [params.beginTime, params.endTime] = value;
  } else {
    params.beginTime = undefined;
    params.endTime = undefined;
  }
}

function resetModel() {
  dateRangeCreateTime.value = null;
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
        <NForm :model="model" label-placement="left" :label-width="100">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.oss.fileName')" path="fileName" class="pr-24px">
              <NInput v-model:value="model.fileName" :placeholder="$t('page.system.oss.form.fileName.required')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.system.oss.originalName')"
              path="originalName"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.originalName"
                :placeholder="$t('page.system.oss.form.originalName.required')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.oss.fileSuffix')" path="fileSuffix" class="pr-24px">
              <NInput v-model:value="model.fileSuffix" :placeholder="$t('page.system.oss.form.fileSuffix.required')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.system.oss.service')" path="service" class="pr-24px">
              <NInput v-model:value="model.service" :placeholder="$t('page.system.oss.form.service.required')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:12"
              :label="$t('page.system.oss.createTime')"
              path="createTime"
              class="pr-24px"
            >
              <NDatePicker
                v-model:formatted-value="dateRangeCreateTime"
                type="datetimerange"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
                @update:formatted-value="onDateRangeCreateTimeUpdate"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:12" class="pr-24px">
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
