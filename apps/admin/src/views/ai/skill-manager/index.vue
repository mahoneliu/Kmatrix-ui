<script setup lang="tsx">
import { computed, ref } from 'vue';
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDataTable,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchDeleteSkill, fetchGetSkillList } from '@/service/api/ai/skill';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SkillFormDrawer from './modules/skill-form-drawer.vue';

const statusOptions = computed(() => [
  { label: $t('dict.sys_normal_disable.normal'), value: '0' },
  { label: $t('dict.sys_normal_disable.disable'), value: '1' }
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
    {
      title: $t('ai.skill.info'),
      width: 200,
      key: 'skillName'
    },
    {
      title: () => $t('ai.skill.description'),
      key: 'spec',
      ellipsis: { tooltip: true }
    },
    {
      title: $t('common.status'),
      key: 'status',
      width: 100,
      render: (row: Api.Ai.Skill.Info) => {
        if (row.status === '0') {
          return <NTag type="success">{$t('dict.sys_normal_disable.normal')}</NTag>;
        }
        return <NTag type="error">{$t('dict.sys_normal_disable.disable')}</NTag>;
      }
    },
    {
      title: $t('common.createTime'),
      key: 'createTime',
      width: 180
    },
    {
      title: $t('common.action'),
      key: 'operate',
      width: 150,
      render: (row: Api.Ai.Skill.Info) => (
        <NSpace justify="center">
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <NButton size="small" type="primary" ghost onClick={() => handleEdit(row.skillId)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.skillId)}>
            {{
              default: () => $t('ai.skill.confirmDelete'),
              trigger: () => (
                <NButton size="small" type="error" ghost>
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </NSpace>
      )
    }
  ]
});

const { drawerVisible, operateType, handleAdd, editingData, handleEdit, checkedRowKeys, onDeleted } = useTableOperate(
  data,
  'skillId',
  getData
);

async function handleDelete(id: string) {
  const { error } = await fetchDeleteSkill(id);
  if (!error) {
    onDeleted();
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <NCard :bordered="false" size="small" class="mb-4 card-wrapper">
      <NCollapse default-expanded-names="search">
        <NCollapseItem :title="$t('common.search')" name="search">
          <NSpace>
            <NInput
              v-model:value="searchParams.skillName"
              clearable
              :placeholder="$t('ai.skill.placeholder.nameSearch')"
              @keyup.enter="getData"
            />
            <NSelect
              v-model:value="searchParams.status"
              :options="statusOptions"
              :placeholder="$t('ai.skill.placeholder.statusSearch')"
              clearable
              class="w-150px"
              @update:value="getData"
            />
            <NButton type="primary" :loading="loading" @click="getData">
              <template #icon>
                <SvgIcon icon="mdi:magnify" />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <NCard
      :title="$t('ai.skill.listTitle')"
      :bordered="false"
      size="small"
      class="flex-1 card-wrapper"
      content-class="flex flex-col h-full overflow-hidden"
    >
      <template #header-extra>
        <NSpace>
          <NButton type="primary" size="small" @click="handleAdd">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
            {{ $t('ai.skill.add') }}
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="(row: any) => row.skillId"
        :pagination="mobilePagination"
        :bordered="false"
        flex-height
        class="h-full"
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
