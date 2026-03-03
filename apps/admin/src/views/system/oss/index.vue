<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import type { DataTableSortState } from 'naive-ui';
import { NButton, NDivider, NEllipsis, NImage, NTag, NTooltip } from 'naive-ui';
import { useBoolean, useLoading } from '@sa/hooks';
import { fetchBatchDeleteOss, fetchGetOssList } from '@/service/api/system/oss';
import { fetchGetConfigByKey, fetchUpdateConfigByKey } from '@/service/api/system/config';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useRouterPush } from '@/hooks/common/router';
import { isImage } from '@/utils/common';
import { handleCopy } from '@/utils/copy';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import OssSearch from './modules/oss-search.vue';
import OssUploadModal from './modules/oss-upload-modal.vue';

defineOptions({
  name: 'OssList'
});

const { routerPushByKey } = useRouterPush();
const { hasAuth } = useAuth();
const { oss } = useDownload();
const appStore = useAppStore();

const fileUploadType = ref<'file' | 'image'>('file');
const { bool: preview, setBool: setPreview } = useBoolean(true);
const { loading: previewLoading, startLoading: startPreviewLoading, endLoading: endPreviewLoading } = useLoading(false);
const { bool: uploadVisible, setTrue: showFUploadModal } = useBoolean(false);

const searchParams = ref<Api.System.OssSearchParams>({
  pageNum: 1,
  pageSize: 10,
  fileName: null,
  originalName: null,
  fileSuffix: null,
  service: null,
  isAsc: 'desc',
  orderByColumn: 'createTime',
  params: {}
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, scrollX } =
  useNaivePaginatedTable({
    api: () => fetchGetOssList(searchParams.value),
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.pageNum = params.page;
      searchParams.value.pageSize = params.pageSize;
    },
    columns: () => [
      {
        type: 'selection',
        align: 'center',
        width: 48
      },
      {
        key: 'index',
        title: $t('common.index'),
        align: 'center',
        width: 64,
        render: (_, index) => index + 1
      },
      {
        key: 'ossId',
        title: $t('page.system.oss.ossId'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'fileName',
        title: $t('page.system.oss.fileName'),
        align: 'center',
        ellipsis: {
          tooltip: true,
          lineClamp: 3
        },
        minWidth: 120
      },
      {
        key: 'originalName',
        title: $t('page.system.oss.originalName'),
        align: 'center',
        ellipsis: {
          tooltip: true,
          lineClamp: 3
        },
        minWidth: 120
      },
      {
        key: 'fileSuffix',
        title: $t('page.system.oss.fileSuffix'),
        align: 'center',
        minWidth: 100
      },
      {
        key: 'url',
        title: $t('page.system.oss.url'),
        align: 'center',
        minWidth: 120,
        render: row => {
          if (preview.value && isImage(row.fileSuffix)) {
            return <NImage class="h-40px w-40px object-contain" src={row.url} />;
          }
          return (
            <NTooltip>
              {{
                default: () => <span>{$t('common.copy')}</span>,
                trigger: () => (
                  <div class="cursor-pointer" onClick={async () => await handleCopy(row.url)}>
                    <NEllipsis line-clamp={3} tooltip={false}>
                      {row.url}
                    </NEllipsis>
                  </div>
                )
              }}
            </NTooltip>
          );
        }
      },
      {
        key: 'createTime',
        title: $t('page.system.oss.createTime'),
        align: 'center',
        minWidth: 120,
        sorter: true,
        defaultSortOrder: 'descend'
      },
      {
        key: 'createByName',
        title: $t('page.system.oss.createByName'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'service',
        title: $t('page.system.oss.service'),
        align: 'center',
        minWidth: 100,
        render: row => {
          return <NTag type="primary">{row.service}</NTag>;
        }
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 130,
        render: row => {
          const divider = () => {
            if (!hasAuth('system:oss:download') || !hasAuth('system:oss:delete')) {
              return null;
            }
            return <NDivider vertical />;
          };

          const downloadBtn = () => {
            if (!hasAuth('system:oss:download')) {
              return null;
            }
            return (
              <ButtonIcon
                text
                type="primary"
                local-icon="material-symbols-download-rounded"
                class="text-20px"
                tooltipContent={$t('common.download')}
                onClick={() => download(row.ossId!)}
              />
            );
          };

          const deleteBtn = () => {
            if (!hasAuth('system:oss:delete')) {
              return null;
            }
            return (
              <ButtonIcon
                text
                type="error"
                local-icon="material-symbols-delete-outline"
                class="text-20px"
                tooltipContent={$t('common.delete')}
                popconfirmContent={$t('common.confirmDelete')}
                onPositiveClick={() => handleDelete(row.ossId!)}
              />
            );
          };

          return (
            <div class="flex-center gap-8px">
              {downloadBtn()}
              {divider()}
              {deleteBtn()}
            </div>
          );
        }
      }
    ]
  });

const { handleAdd, checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'ossId', getData);

async function handleBatchDelete() {
  // request
  const { error } = await fetchBatchDeleteOss(checkedRowKeys.value);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(ossId: CommonType.IdType) {
  // request
  const { error } = await fetchBatchDeleteOss([ossId]);
  if (error) return;
  onDeleted();
}

function download(ossId: CommonType.IdType) {
  oss(ossId);
}

function handleUpdateSorter(sorters: DataTableSortState) {
  if (!sorters.order) {
    searchParams.value.orderByColumn = null;
    searchParams.value.isAsc = null;
  } else {
    searchParams.value.orderByColumn = sorters.columnKey as keyof Api.System.Oss;
    searchParams.value.isAsc = sorters.order === 'ascend' ? 'asc' : 'desc';
  }
  getDataByPage();
}

function handleUpload(type: 'file' | 'image') {
  fileUploadType.value = type;
  showFUploadModal();
}

async function getConfigKey() {
  const { data: previewStr, error } = await fetchGetConfigByKey('sys.oss.previewListResource');
  if (error) return;
  setPreview(previewStr === 'true');
}

onMounted(() => {
  getConfigKey();
});

async function handleUpdatePreview(checked: boolean) {
  setPreview(!checked);
  window.$dialog?.warning({
    title: $t('common.tip'),
    content: $t('page.system.oss.confirmPreview', { action: checked ? $t('common.enable') : $t('common.disable') }),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      startPreviewLoading();
      const { error } = await fetchUpdateConfigByKey({
        configKey: 'sys.oss.previewListResource',
        configValue: String(checked)
      });
      if (error) {
        setPreview(!checked);
        endPreviewLoading();
        return;
      }
      setPreview(checked);
      window.$message?.success($t('common.updateSuccess'));
      endPreviewLoading();
    },
    onNegativeClick: () => {
      setPreview(!checked);
    }
  });
}

function handleToOssConfig() {
  routerPushByKey('system_oss-config');
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <OssSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.system.oss.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="hasAuth('system:oss:delete')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #prefix>
            <NSwitch
              v-model:value="preview"
              class="mt-1px"
              :loading="previewLoading"
              size="large"
              :round="false"
              @update:value="handleUpdatePreview"
            >
              <template #checked>
                <span class="text-14px">{{ $t('page.system.oss.previewDisable') }}</span>
              </template>
              <template #unchecked>
                <span class="text-14px">{{ $t('page.system.oss.previewEnable') }}</span>
              </template>
            </NSwitch>

            <NButton size="small" ghost @click="handleUpload('file')">
              <template #icon>
                <icon-material-symbols-upload-rounded />
              </template>
              {{ $t('page.system.oss.upload') }}
            </NButton>
            <NButton size="small" ghost @click="handleUpload('image')">
              <template #icon>
                <icon-material-symbols-image-outline />
              </template>
              {{ $t('page.system.oss.uploadImage') }}
            </NButton>
            <NButton type="primary" size="small" ghost @click="handleToOssConfig">
              <template #icon>
                <icon-hugeicons-configuration-01 />
              </template>
              {{ $t('page.system.oss.configManage') }}
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="scrollX"
        :loading="loading"
        remote
        :row-key="row => row.ossId"
        :pagination="mobilePagination"
        class="sm:h-full"
        @update:sorter="handleUpdateSorter"
      />
      <OssUploadModal v-model:visible="uploadVisible" :upload-type="fileUploadType" @close="getDataByPage" />
    </NCard>
  </div>
</template>

<style scoped>
.n-switch {
  --n-rail-height: 27px !important;
}
</style>
