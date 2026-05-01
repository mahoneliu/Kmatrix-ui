<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { NButton, NCard, NForm, NFormItem, NGrid, NGridItem, NInputNumber, NPopconfirm, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import {
  fetchClearUserConfig,
  fetchGetSystemDefaultConfig,
  fetchGetUserLimitList,
  fetchUpdateSystemDefaultConfig
} from '@/service/api/ai/rate-limit';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import RateLimitFormDrawer from './modules/rate-limit-form-drawer.vue';

const { t } = useI18n();
const appStore = useAppStore();

// ======================== System Default Config ========================
const systemConfigLoading = ref(false);
const defaultModel = ref<Api.Ai.RateLimit.Config>({
  minute: { requests: null, tokens: null },
  hour: { requests: null, tokens: null },
  day: { requests: null, tokens: null }
});

async function loadSystemConfig() {
  systemConfigLoading.value = true;
  requestAnimationFrame(async () => {
    try {
      const { error, data } = await fetchGetSystemDefaultConfig();
      if (!error && data) {
        try {
          // Backend returns JSON string
          const parsed = JSON.parse(data as string);
          if (parsed) {
            defaultModel.value = {
              minute: parsed.minute || { requests: null, tokens: null },
              hour: parsed.hour || { requests: null, tokens: null },
              day: parsed.day || { requests: null, tokens: null }
            };
          }
        } catch {
          window.$message?.error('Parse System Default Config Error');
        }
      }
    } finally {
      systemConfigLoading.value = false;
    }
  });
}

async function handleSaveSystemConfig() {
  const { error } = await fetchUpdateSystemDefaultConfig(defaultModel.value);
  if (!error) {
    window.$message?.success(t('page.ai_rateLimit.msg.updateSuccess'));
  }
}

// ======================== User Personalized Configs (Table) ========================
const searchParams = ref<Api.Ai.RateLimit.UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  status: ''
});

const { columns, data, loading, mobilePagination, getData } = useNaivePaginatedTable({
  api: () => fetchGetUserLimitList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.pageNum = params.page || 1;
    searchParams.value.pageSize = params.pageSize || 10;
  },
  columns: () => [
    { title: t('page.ai_rateLimit.table.userId'), key: 'userId', width: 80 },
    { title: t('page.ai_rateLimit.table.userName'), key: 'userName', width: 120 },
    { title: t('page.ai_rateLimit.table.nickName'), key: 'nickName', width: 150 },
    {
      title: t('page.ai_rateLimit.table.minuteLimit'),
      key: 'minuteLimit',
      width: 150,
      render: (row: Api.Ai.RateLimit.UserInfo) => renderConfigCell(row, 'minute')
    },
    {
      title: t('page.ai_rateLimit.table.hourLimit'),
      key: 'hourLimit',
      width: 150,
      render: (row: Api.Ai.RateLimit.UserInfo) => renderConfigCell(row, 'hour')
    },
    {
      title: t('page.ai_rateLimit.table.dayLimit'),
      key: 'dayLimit',
      width: 150,
      render: (row: Api.Ai.RateLimit.UserInfo) => renderConfigCell(row, 'day')
    },
    {
      title: t('common.action'),
      key: 'operate',
      width: 180,
      render: (row: Api.Ai.RateLimit.UserInfo) => (
        <NSpace justify="end">
          {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
          <NButton size="small" type="primary" ghost onClick={() => handleEdit(row.userId)}>
            {t('common.edit')}
          </NButton>
          {row.rateLimitConfig && (
            <NPopconfirm onPositiveClick={() => handleClearCustom(row.userId)}>
              {{
                default: () => t('page.ai_rateLimit.msg.clearConfirm'),
                trigger: () => (
                  <NButton size="small" type="error" ghost>
                    {t('common.clear')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          )}
        </NSpace>
      )
    }
  ]
});

const { drawerVisible, operateType, editingData, handleEdit } = useTableOperate(data, 'userId', getData);

function safelyParseConfig(configStr?: string | null): Api.Ai.RateLimit.Config | null {
  if (!configStr) return null;
  try {
    return JSON.parse(configStr);
  } catch {
    return null;
  }
}

function renderConfigCell(row: Api.Ai.RateLimit.UserInfo, field: 'minute' | 'hour' | 'day') {
  const config = safelyParseConfig(row.rateLimitConfig);
  if (!config || !config[field]) return <span class="text-gray-400">{t('page.ai_rateLimit.table.useDefault')}</span>;
  const q = config[field];
  if (q!.requests === null && q!.tokens === null) {
    return <span class="text-gray-400">{t('page.ai_rateLimit.table.useDefault')}</span>;
  }
  return (
    <div class="flex flex-col gap-1 text-xs">
      <div>R: {q!.requests !== null ? q!.requests : t('page.ai_rateLimit.form.reqPlaceholder')}</div>
      <div>T: {q!.tokens !== null ? q!.tokens : t('page.ai_rateLimit.form.tokenPlaceholder')}</div>
    </div>
  );
}

async function handleClearCustom(userId: number) {
  const { error } = await fetchClearUserConfig(userId);
  if (!error) {
    window.$message?.success(t('page.ai_rateLimit.msg.clearSuccess'));
    getData();
  }
}

onMounted(() => {
  loadSystemConfig();
});
</script>

<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden p-[16px]">
    <!-- 全局系统默认设置面板 -->
    <NCard
      :loading="systemConfigLoading"
      :title="t('page.ai_rateLimit.systemDefault')"
      :bordered="false"
      size="small"
      class="card-wrapper"
    >
      <template #header-extra>
        <NButton type="primary" size="small" @click="handleSaveSystemConfig">
          <template #icon>
            <icon-ic-round-save class="text-icon" />
          </template>
          {{ t('common.save') }}
        </NButton>
      </template>
      <NForm :model="defaultModel" label-placement="left" label-width="120" :show-feedback="false">
        <NGrid :cols="3" :x-gap="24">
          <!-- 分钟 -->
          <NGridItem>
            <NCard :title="t('page.ai_rateLimit.quota.minute')" size="small">
              <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
                <NInputNumber
                  v-model:value="defaultModel.minute!.requests"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
                <NInputNumber
                  v-model:value="defaultModel.minute!.tokens"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
                />
              </NFormItem>
            </NCard>
          </NGridItem>
          <!-- 小时 -->
          <NGridItem>
            <NCard :title="t('page.ai_rateLimit.quota.hour')" size="small">
              <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
                <NInputNumber
                  v-model:value="defaultModel.hour!.requests"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
                <NInputNumber
                  v-model:value="defaultModel.hour!.tokens"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
                />
              </NFormItem>
            </NCard>
          </NGridItem>

          <NGridItem>
            <NCard :title="t('page.ai_rateLimit.quota.day')" size="small">
              <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
                <NInputNumber
                  v-model:value="defaultModel.day!.requests"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
                <NInputNumber
                  v-model:value="defaultModel.day!.tokens"
                  clearable
                  min="1"
                  :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
                />
              </NFormItem>
            </NCard>
          </NGridItem>
        </NGrid>
      </NForm>
    </NCard>

    <!-- 用户个性化设置面板 -->
    <NCard
      :title="t('page.ai_rateLimit.userCustom')"
      :bordered="false"
      size="small"
      class="flex-1-hidden card-wrapper"
      content-class="flex-col"
    >
      <div class="flex-1-hidden">
        <NDataTable
          :columns="columns"
          :data="data"
          size="small"
          :flex-height="!appStore.isMobile"
          :scroll-x="962"
          :loading="loading"
          remote
          :row-key="row => row.userId"
          :pagination="mobilePagination"
          class="h-full"
        />
      </div>

      <RateLimitFormDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
