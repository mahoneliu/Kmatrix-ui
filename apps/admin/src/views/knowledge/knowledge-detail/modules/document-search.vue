<script setup lang="ts">
import { computed, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DocumentSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.AI.KB.DocumentQuery>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

const enabledOptions = computed(() => [
  { label: $t('ai.documentSearch.all'), value: undefined },
  { label: $t('ai.documentSearch.enabled'), value: 1 },
  { label: $t('ai.documentSearch.disabled'), value: 0 }
]);

const statusOptions = computed(() => [
  { label: $t('ai.documentSearch.all'), value: undefined },
  { label: $t('ai.documentSearch.unGenerated'), value: 0 },
  { label: $t('ai.documentSearch.generating'), value: 1 },
  { label: $t('ai.documentSearch.generated'), value: 2 },
  { label: $t('ai.documentSearch.generateFailed'), value: 3 }
]);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="document-search">
        <NForm :model="model" label-placement="left" :label-width="100">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('ai.documentSearch.keyword')" path="keyword" class="pr-24px">
              <NInput v-model:value="model.keyword" :placeholder="$t('ai.documentSearch.searchDocName')" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('ai.documentSearch.enableStatus')"
              path="enabled"
              class="pr-24px"
            >
              <NSelect v-model:value="model.enabled" :options="enabledOptions" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('ai.documentSearch.embeddingStatus')"
              path="embeddingStatus"
              class="pr-24px"
            >
              <NSelect v-model:value="model.embeddingStatus" :options="statusOptions" clearable />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('ai.documentSearch.questionStatus')"
              path="questionStatus"
              class="pr-24px"
            >
              <NSelect v-model:value="model.questionStatus" :options="statusOptions" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:24 m:24" class="pr-24px">
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
