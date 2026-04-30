<script setup lang="ts">
/**
 * 手工添加 MCP Server 对话框
 * @author Mahone
 */
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace, useMessage } from 'naive-ui';
import type { FormInst, FormRules, SelectOption } from 'naive-ui';
import { addMcpServerManual } from '@/service/api/ai/mcp-registry';
import { $t } from '@/locales';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const show = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
});

const form = ref<Api.Ai.McpServerManualParams>({
  serverName: '',
  transportType: 'sse',
  endpointUrl: '',
  command: '',
  args: [],
  description: ''
});

const argsText = ref('');

const transportOptions = computed<SelectOption[]>(() => [
  { label: 'SSE', value: 'sse' },
  { label: 'Streamable HTTP', value: 'streamable_http' },
  { label: 'Stdio', value: 'stdio' }
]);

const isSSE = computed(() => form.value.transportType === 'sse' || form.value.transportType === 'streamable_http');
const isStdio = computed(() => form.value.transportType === 'stdio');

const rules = computed<FormRules>(() => ({
  serverName: [{ required: true, message: $t('ai.mcp.manualAdd.serverNameRequired'), trigger: 'blur' }],
  transportType: [{ required: true, message: $t('ai.mcp.manualAdd.transportTypeRequired'), trigger: 'change' }],
  endpointUrl: isSSE.value
    ? [{ required: true, message: $t('ai.mcp.manualAdd.endpointUrlRequired'), trigger: 'blur' }]
    : [],
  command: isStdio.value ? [{ required: true, message: $t('ai.mcp.manualAdd.commandRequired'), trigger: 'blur' }] : []
}));

// 重置表单
watch(
  () => props.show,
  val => {
    if (val) {
      form.value = { serverName: '', transportType: 'sse', endpointUrl: '', command: '', args: [], description: '' };
      argsText.value = '';
    }
  }
);

async function handleConfirm() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    // 将多行文本转换为 args 数组
    const args = argsText.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    await addMcpServerManual({ ...form.value, args });
    message.success($t('ai.mcp.manualAdd.addSuccess'));
    emit('success');
    show.value = false;
  } catch (err: any) {
    const msg: string = err?.response?.data?.msg ?? err?.message ?? '';
    if (msg.includes('名称已存在') || err?.response?.status === 409) {
      message.warning($t('ai.mcp.manualAdd.nameDuplicate'));
    } else {
      message.error(msg || $t('common.error'));
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <NModal v-model:show="show" preset="card" :title="$t('ai.mcp.manualAdd.title')" :style="{ width: '520px' }">
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="110">
      <NFormItem :label="$t('ai.mcp.manualAdd.serverName')" path="serverName">
        <NInput v-model:value="form.serverName" :placeholder="$t('ai.mcp.manualAdd.serverNamePlaceholder')" />
      </NFormItem>

      <NFormItem :label="$t('ai.mcp.manualAdd.transportType')" path="transportType">
        <NSelect v-model:value="form.transportType" :options="transportOptions" />
      </NFormItem>

      <!-- SSE / Streamable HTTP -->
      <NFormItem v-if="isSSE" :label="$t('ai.mcp.manualAdd.endpointUrl')" path="endpointUrl">
        <NInput v-model:value="form.endpointUrl" :placeholder="$t('ai.mcp.manualAdd.endpointUrlPlaceholder')" />
      </NFormItem>

      <!-- Stdio -->
      <template v-if="isStdio">
        <NFormItem :label="$t('ai.mcp.manualAdd.command')" path="command">
          <NInput v-model:value="form.command" :placeholder="$t('ai.mcp.manualAdd.commandPlaceholder')" />
        </NFormItem>
        <NFormItem :label="$t('ai.mcp.manualAdd.args')">
          <NInput
            v-model:value="argsText"
            type="textarea"
            :rows="3"
            :placeholder="$t('ai.mcp.manualAdd.argsPlaceholder')"
          />
        </NFormItem>
      </template>

      <NFormItem :label="$t('ai.mcp.description')">
        <NInput v-model:value="form.description" type="textarea" :rows="2" />
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="show = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="loading" @click="handleConfirm">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
