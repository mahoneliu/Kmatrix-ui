<script setup lang="ts">
/**
 * MCP 注册源条目导入确认对话框
 * @author Mahone
 */
import { computed, ref, watch } from 'vue';
import { NAlert, NButton, NCheckbox, NForm, NFormItem, NInput, NModal, NSpace, useMessage } from 'naive-ui';
import { importRegistryEntry } from '@/service/api/ai/mcp-registry';
import { $t } from '@/locales';

const props = defineProps<{
  show: boolean;
  entry: Api.Ai.McpRegistryEntryVo;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const loading = ref(false);
const serverName = ref('');
const overwrite = ref(false);
const showConflict = ref(false);

const show = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
});

// 每次打开时重置表单，预填充名称
watch(
  () => props.show,
  val => {
    if (val) {
      serverName.value = props.entry.displayName || props.entry.entryName;
      overwrite.value = false;
      showConflict.value = false;
    }
  }
);

async function handleConfirm() {
  loading.value = true;
  try {
    await importRegistryEntry(props.entry.entryId, {
      serverName: serverName.value || undefined,
      overwrite: overwrite.value
    });
    message.success($t('ai.mcp.registryImport.importSuccess'));
    emit('success');
  } catch (err: any) {
    const msg: string = err?.response?.data?.msg ?? err?.message ?? '';
    // 409 冲突：已存在，提示覆盖
    if (msg.includes('已存在') || err?.response?.status === 409) {
      showConflict.value = true;
    } else {
      message.error(`${$t('ai.mcp.registryImport.importFail')}: ${msg}`);
    }
  } finally {
    loading.value = false;
  }
}

async function handleOverwriteConfirm() {
  overwrite.value = true;
  showConflict.value = false;
  await handleConfirm();
}
</script>

<template>
  <NModal
    v-model:show="show"
    preset="dialog"
    :title="$t('ai.mcp.registryImport.title')"
    :positive-text="$t('common.confirm')"
    :negative-text="$t('common.cancel')"
    :loading="loading"
    @positive-click="handleConfirm"
  >
    <NForm label-placement="left" label-width="100">
      <NFormItem :label="$t('ai.mcp.registryImport.serverName')">
        <NInput v-model:value="serverName" :placeholder="$t('ai.mcp.registryImport.serverNamePlaceholder')" clearable />
      </NFormItem>
      <NFormItem :label="$t('ai.mcp.registryImport.overwrite')">
        <NCheckbox v-model:checked="overwrite">
          {{ $t('ai.mcp.registryImport.overwriteTip') }}
        </NCheckbox>
      </NFormItem>
    </NForm>

    <!-- 冲突提示 -->
    <NAlert v-if="showConflict" type="warning" class="mt-3">
      {{ $t('ai.mcp.registryImport.alreadyImported') }}
      <NSpace class="mt-2">
        <NButton size="small" type="warning" @click="handleOverwriteConfirm">
          {{ $t('common.confirm') }}
        </NButton>
        <NButton size="small" @click="showConflict = false">
          {{ $t('common.cancel') }}
        </NButton>
      </NSpace>
    </NAlert>
  </NModal>
</template>
