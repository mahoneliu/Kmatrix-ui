<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { fetchDeleteSkill, fetchGetSkillList } from '@/service/api/ai/skill';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import SkillFormDrawer from './modules/skill-form-drawer.vue';

const { t } = useI18n();

const statusOptions = computed(() => [
  { label: t('dict.sys_normal_disable.normal'), value: '0' },
  { label: t('dict.sys_normal_disable.disable'), value: '1' }
]);

const searchParams = ref<Api.Ai.Skill.QueryParams>({
  pageNum: 1,
  pageSize: 10,
  skillName: '',
  status: '',
  params: {}
});

const { columns, data, loading, mobilePagination, getData } = useNaivePaginatedTable({
  api: () => fetchGetSkillList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page || 1;
    searchParams.value.pageSize = params.pageSize || 10;
  },
  columns: () => [
    { type: 'selection', key: 'selection' },
    {
      title: t('ai.skill.info'),
      key: 'skillName',
      render: (row: Api.Ai.Skill.Info) => {
        return (
          <div class="flex-y-center gap-12px">
            <div
              class="h-32px w-32px flex-center rounded-8px text-16px text-white"
              style={{ backgroundColor: '#ef4444' }}
            >
              <i class="i-mdi-brain" />
            </div>
            <div>
              <div class="font-bold">{row.skillName}</div>
              <div class="text-pretty text-12px">{row.spec || '--'}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: t('common.status'),
      key: 'status',
      width: 100,
      render: (row: Api.Ai.Skill.Info) => {
        if (row.status === '0') {
          return <NTag type="success">{t('dict.sys_normal_disable.normal')}</NTag>;
        }
        return <NTag type="error">{t('dict.sys_normal_disable.disable')}</NTag>;
      }
    },
    {
      title: t('common.createTime'),
      key: 'createTime',
      width: 180
    },
    {
      title: t('common.action'),
      key: 'operate',
      width: 150,
      render: (row: Api.Ai.Skill.Info) => (
        <NSpace justify="center">
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <NButton size="small" type="primary" ghost onClick={() => handleEdit(row.skillId)}>
            {t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.skillId)}>
            {{
              default: () => t('ai.skill.confirmDelete'),
              trigger: () => (
                <NButton size="small" type="error" ghost>
                  {t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, editingData, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'skillId', getData);

async function handleDelete(id: string) {
  const { error } = await fetchDeleteSkill(id);
  if (!error) {
    onDeleted();
  }
}

async function handleBatchDelete() {
  if (checkedRowKeys.value.length === 0) return;
  const { error } = await fetchDeleteSkill(checkedRowKeys.value.join(','));
  if (!error) {
    onBatchDeleted();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden sm:p-24px">
    <NCard class="card-wrapper sm:flex-1-hidden" content-class="flex-col">
      <div class="mb-16px flex-y-center justify-between gap-16px">
        <div class="flex-y-center gap-16px">
          <NInput
            v-model:value="searchParams.skillName"
            :placeholder="$t('ai.skill.placeholder.nameSearch')"
            clearable
            @keyup.enter="getData"
          />
          <NSelect
            v-model:value="searchParams.status"
            :options="statusOptions"
            :placeholder="$t('ai.skill.placeholder.statusSearch')"
            clearable
            class="w-120px"
          />
          <NButton type="primary" :loading="loading" @click="getData">
            <template #icon>
              <icon-ic-round-search class="text-icon" />
            </template>
            {{ $t('common.search') }}
          </NButton>
        </div>
        <div class="flex-y-center gap-16px">
          <NButton type="primary" @click="handleAdd">
            <template #icon>
              <icon-ic-round-plus class="text-icon" />
            </template>
            {{ $t('ai.skill.add') }}
          </NButton>
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton type="error" :disabled="checkedRowKeys.length === 0">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('ai.skill.confirmBatchDelete') }}
          </NPopconfirm>
        </div>
      </div>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="(row: any) => row.skillId"
        :pagination="mobilePagination"
        flex-height
        class="flex-1-hidden"
      />
    </NCard>

    <SkillFormDrawer
      v-model:visible="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getData"
    />
  </div>
</template>

<style scoped></style>
