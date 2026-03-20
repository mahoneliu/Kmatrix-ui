<script setup lang="ts">
/**
 * MCP Server 新增/编辑 Drawer 表单
 * @author Mahone
 * @date 2026-03-15
 */
import { ref, watch } from 'vue';
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui';
import type { FormInst } from 'naive-ui';
import { addMcpServer, updateMcpServer } from '@/service/api/ai/mcp-server';
import { $t } from '@/locales';

interface Props {
  show: boolean;
  server: Api.Ai.McpServerVo | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const isEdit = ref(false);

const defaultForm = (): Api.Ai.McpServerBo => ({
  serverName: '',
  description: '',
  transportType: 'sse',
  serverConfig: '',
  status: '0',
  remark: ''
});

const form = ref<Api.Ai.McpServerBo>(defaultForm());

const rules = {
  serverName: [{ required: true, message: () => $t('ai.mcp.form.serverNameRequired'), trigger: 'blur' }],
  transportType: [{ required: true, message: () => $t('ai.mcp.form.transportTypeRequired'), trigger: 'change' }]
};

const statusOptions = [
  { label: $t('common.enable'), value: '0' },
  { label: $t('common.disable'), value: '1' }
];

watch(
  () => props.show,
  val => {
    if (val) {
      if (props.server) {
        isEdit.value = true;
        form.value = {
          serverId: props.server.serverId,
          serverName: props.server.serverName,
          description: props.server.description ?? '',
          transportType: props.server.transportType,
          serverConfig: props.server.serverConfig ?? '',
          status: props.server.status,
          remark: props.server.remark ?? ''
        };
      } else {
        isEdit.value = false;
        form.value = defaultForm();
      }
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateMcpServer(form.value);
      message.success($t('common.updateSuccess'));
    } else {
      await addMcpServer(form.value);
      message.success($t('common.addSuccess'));
    }
    emit('success');
  } catch {
    message.error($t('common.error'));
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  emit('update:show', false);
}
</script>

<template>
  <NDrawer :show="show" :width="520" @update:show="emit('update:show', $event)">
    <NDrawerContent :title="isEdit ? $t('ai.mcp.editTitle') : $t('ai.mcp.addTitle')" closable>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem :label="$t('ai.mcp.serverName')" path="serverName">
          <NInput v-model:value="form.serverName" :placeholder="$t('ai.mcp.form.serverNamePlaceholder')" />
        </NFormItem>

        <NFormItem :label="$t('ai.mcp.description')" path="description">
          <NInput
            v-model:value="form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('ai.mcp.form.descriptionPlaceholder')"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.mcp.transportType')" path="transportType">
          <NRadioGroup v-model:value="form.transportType">
            <NRadioButton value="sse">SSE</NRadioButton>
            <NRadioButton value="streamable_http">Streamable HTTP</NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <NFormItem :label="$t('ai.mcp.serverConfig')" path="serverConfig">
          <NInput
            v-model:value="form.serverConfig"
            type="textarea"
            :rows="5"
            :placeholder="$t('ai.mcp.form.serverConfigPlaceholder')"
            font-size="13px"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.mcp.status')" path="status">
          <NSelect v-model:value="form.status" :options="statusOptions" class="w-150px" />
        </NFormItem>

        <NFormItem :label="$t('common.remark')" path="remark">
          <NInput v-model:value="form.remark" type="textarea" :rows="2" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleClose">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">
            {{ $t('common.save') }}
          </NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
