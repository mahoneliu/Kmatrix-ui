<script setup lang="ts">
import { toRaw } from 'vue';
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

const enabledOptions = [
  { label: '全部', value: undefined },
  { label: '已启用', value: 1 },
  { label: '已禁用', value: 0 }
];

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '未生成', value: 0 },
  { label: '生成中', value: 1 },
  { label: '已生成', value: 2 },
  { label: '生成失败', value: 3 }
];
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="document-search">
        <NForm :model="model" label-placement="left" :label-width="100">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="关键词" path="keyword" class="pr-24px">
              <NInput v-model:value="model.keyword" placeholder="搜索文档名称" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="启用状态" path="enabled" class="pr-24px">
              <NSelect v-model:value="model.enabled" :options="enabledOptions" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="向量化状态" path="embeddingStatus" class="pr-24px">
              <NSelect v-model:value="model.embeddingStatus" :options="statusOptions" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="问题生成状态" path="questionStatus" class="pr-24px">
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
