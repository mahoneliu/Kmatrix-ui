<script setup lang="ts">
/**
 * MCP Server 新增/编辑 Drawer 表单
 * 支持表单模式与 JSON 导入/导出模式切换
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
  NPopover,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import type { FormInst } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
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

/** 编辑模式: form = 表单模式, json = JSON 导入/导出模式 */
const editMode = ref<'form' | 'json'>('form');

/** JSON 编辑区文本（导入/导出共用） */
const jsonText = ref('');

const defaultForm = (): Api.Ai.McpServerBo => ({
  serverName: '',
  description: '',
  transportType: 'streamable_http',
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

// ========== JSON 导入/导出 ==========

/**
 * 将当前表单数据导出为标准 MCP JSON 格式（带 mcpServers 包装）
 *
 * 导出时使用 baseUrl（与云端 MCP 配置格式一致），
 * 同时保留 serverConfig 中的其他字段（headers 等）
 */
function exportToJson(): string {
  const serverName = form.value.serverName || 'mcp-server';
  const serverConf: Record<string, unknown> = {
    type: form.value.transportType === 'sse' ? 'sse' : 'streamableHttp',
    isActive: form.value.status !== '1'
  };

  // 解析 serverConfig，将内部字段映射到导出格式
  if (form.value.serverConfig) {
    try {
      const config = JSON.parse(form.value.serverConfig);
      // url → baseUrl（云端格式）
      if (config.url) {
        serverConf.baseUrl = config.url;
      } else if (config.baseUrl) {
        serverConf.baseUrl = config.baseUrl;
      }
      // 其他字段直接透传
      Object.keys(config).forEach(key => {
        if (key !== 'url' && key !== 'baseUrl') {
          serverConf[key] = config[key];
        }
      });
    } catch {
      // serverConfig 不是有效 JSON，原样放入
      serverConf.baseUrl = form.value.serverConfig;
    }
  }

  if (form.value.description) {
    serverConf.description = form.value.description;
  }

  return JSON.stringify({ mcpServers: { [serverName]: serverConf } }, null, 2);
}

/**
 * 切换到 JSON 模式时：
 * - 编辑模式：自动将当前表单数据序列化到 JSON 编辑区（方便导出/修改）
 * - 新增模式：JSON 编辑区留空，仅通过 placeholder 提示用户粘贴配置
 */
function switchToJsonMode() {
  if (isEdit.value) {
    jsonText.value = exportToJson();
  } else {
    jsonText.value = '';
  }
}

/**
 * 解析 JSON 编辑区中的 MCP JSON 配置并填充表单
 *
 * 支持两种常见格式：
 * 1. 标准 MCP 配置（带 mcpServers 包装）:
 *    { "mcpServers": { "name": { "type": "streamableHttp", "baseUrl": "...", "headers": {...} } } }
 * 2. 单个服务配置（无 mcpServers 包装）:
 *    { "type": "streamableHttp", "baseUrl": "...", "headers": {...} }
 */
function handleJsonImport() {
  const text = jsonText.value.trim();
  if (!text) {
    message.warning($t('ai.mcp.form.jsonRequired'));
    return;
  }

  try {
    const parsed = JSON.parse(text);
    let serverConf: Record<string, unknown>;
    let serverKey = '';

    if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
      const keys = Object.keys(parsed.mcpServers);
      if (keys.length === 0) {
        message.error($t('ai.mcp.form.noServerConfig'));
        return;
      }
      serverKey = keys[0];
      serverConf = parsed.mcpServers[serverKey];
    } else {
      serverConf = parsed;
    }

    // 服务名：优先取 name 字段，其次取 mcpServers 下的 key
    form.value.serverName = (serverConf.name as string) || serverKey || '';
    form.value.description = (serverConf.description as string) || '';

    // 解析 type 字段
    const type = ((serverConf.type as string) || '').toLowerCase();
    form.value.transportType = type === 'sse' ? 'sse' : 'streamable_http';

    // 构建 serverConfig: 将云端格式转回内部格式（baseUrl → url）
    const configObj: Record<string, unknown> = {};
    const url = (serverConf.baseUrl || serverConf.url || '') as string;
    if (url) {
      configObj.url = url;
    }

    // 其他字段（headers 等）直接透传，排除已处理的顶层字段
    const skipKeys = new Set(['type', 'baseUrl', 'url', 'name', 'description', 'isActive']);
    Object.keys(serverConf).forEach(key => {
      if (!skipKeys.has(key)) {
        configObj[key] = serverConf[key];
      }
    });

    form.value.serverConfig = Object.keys(configObj).length > 0 ? JSON.stringify(configObj, null, 2) : '';
    form.value.status = serverConf.isActive === false ? '1' : '0';

    // 切换到表单模式让用户确认
    editMode.value = 'form';
    message.success($t('ai.mcp.form.jsonParseSuccess'));
  } catch {
    message.error($t('ai.mcp.form.jsonParseError'));
  }
}

/** 复制 JSON 到剪贴板 */
async function handleCopyJson() {
  try {
    await navigator.clipboard.writeText(jsonText.value);
    message.success($t('common.copySuccess'));
  } catch {
    message.error($t('common.copyFailed'));
  }
}

/** 格式化 serverConfig JSON */
function handleFormatConfig() {
  if (!form.value.serverConfig?.trim()) return;
  try {
    const obj = JSON.parse(form.value.serverConfig);
    form.value.serverConfig = JSON.stringify(obj, null, 2);
  } catch {
    message.error($t('ai.mcp.form.jsonFormatError'));
  }
}

// ========== 生命周期 ==========

watch(
  () => props.show,
  val => {
    if (val) {
      editMode.value = 'form';
      jsonText.value = '';
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
  <NDrawer :show="show" :width="560" @update:show="emit('update:show', $event)">
    <NDrawerContent :title="isEdit ? $t('ai.mcp.editTitle') : $t('ai.mcp.addTitle')" closable>
      <NSpace vertical :size="16">
        <!-- 编辑模式切换 -->
        <NTabs
          v-model:value="editMode"
          type="segment"
          size="small"
          @update:value="
            (v: string | number) => {
              if (v === 'json') switchToJsonMode();
            }
          "
        >
          <NTabPane name="form" :tab="$t('ai.mcp.formMode')" />
          <NTabPane name="json" :tab="$t('ai.mcp.jsonMode')" />
        </NTabs>

        <!-- ===== 表单模式 ===== -->
        <NForm v-if="editMode === 'form'" ref="formRef" :model="form" :rules="rules" label-placement="top">
          <NFormItem :label="$t('ai.mcp.serverName')" path="serverName">
            <NInput v-model:value="form.serverName" :placeholder="$t('ai.mcp.form.serverNamePlaceholder')" />
          </NFormItem>

          <NFormItem :label="$t('ai.mcp.description')" path="description">
            <NInput
              v-model:value="form.description"
              type="textarea"
              :rows="4"
              :placeholder="$t('ai.mcp.form.descriptionPlaceholder')"
            />
          </NFormItem>

          <NFormItem :label="$t('ai.mcp.transportType')" path="transportType">
            <NRadioGroup v-model:value="form.transportType">
              <NRadioButton value="sse">SSE</NRadioButton>
              <NRadioButton value="streamable_http">Streamable HTTP</NRadioButton>
            </NRadioGroup>
          </NFormItem>

          <!-- serverConfig: 整体 JSON 编辑 -->
          <NFormItem :label="$t('ai.mcp.serverConfig')" path="serverConfig">
            <NSpace vertical :size="4" class="w-full">
              <NInput
                v-model:value="form.serverConfig"
                type="textarea"
                :rows="8"
                placeholder='JSON 格式，如：&#10;{&#10;  "url": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp",&#10;  "headers": {&#10;    "Authorization": "Bearer your-api-key"&#10;  }&#10;}'
                font-size="13px"
              />
              <NButton size="tiny" @click="handleFormatConfig">
                {{ $t('ai.mcp.form.formatJson') }}
              </NButton>
            </NSpace>
          </NFormItem>

          <NFormItem :label="$t('ai.mcp.status')" path="status">
            <NSelect v-model:value="form.status" :options="statusOptions" class="w-150px" />
          </NFormItem>

          <NFormItem :label="$t('common.remark')" path="remark">
            <NInput v-model:value="form.remark" type="textarea" :rows="2" />
          </NFormItem>
        </NForm>

        <!-- ===== JSON 导入/导出模式 ===== -->
        <template v-else>
          <div class="mb-1 flex items-center gap-1.5">
            <span class="text-13px text-base-text">JSON 导入/导出</span>
            <NPopover trigger="hover" :width="380" placement="bottom-start">
              <template #trigger>
                <SvgIcon icon="mdi:information-outline" class="cursor-help text-16px text-gray-400" />
              </template>
              <div class="text-13px leading-relaxed">
                <p class="m-0 mb-2 font-semibold">支持两种 JSON 格式：</p>
                <p class="m-0 mb-1 text-gray-600 font-medium">1. 标准 MCP 配置（带 mcpServers 包装）</p>
                <pre class="m-0 mb-3 overflow-x-auto rounded bg-gray-100 p-2 text-12px">
{
  "mcpServers": {
    "WebSearch": {
      "type": "streamableHttp",
      "baseUrl": "https://...",
      "headers": { "Authorization": "Bearer xxx" }
    }
  }
}</pre
                >
                <p class="m-0 mb-1 text-gray-600 font-medium">2. 单个服务配置（无 mcpServers 包装）</p>
                <pre class="m-0 overflow-x-auto rounded bg-gray-100 p-2 text-12px">
{
  "type": "streamableHttp",
  "baseUrl": "https://...",
  "headers": { "Authorization": "Bearer xxx" }
}</pre
                >
              </div>
            </NPopover>
          </div>
          <NInput
            v-model:value="jsonText"
            type="textarea"
            :rows="24"
            placeholder='粘贴云端 MCP JSON 配置，或查看当前配置的 JSON 导出&#10;&#10;支持两种格式：&#10;&#10;1. 标准 MCP 配置（带 mcpServers 包装）:&#10;{&#10;  "mcpServers": {&#10;    "WebSearch": {&#10;      "type": "streamableHttp",&#10;      "baseUrl": "https://...",&#10;      "headers": { "Authorization": "Bearer xxx" }&#10;    }&#10;  }&#10;}&#10;&#10;2. 单个服务配置:&#10;{&#10;  "type": "streamableHttp",&#10;  "baseUrl": "https://...",&#10;  "headers": { "Authorization": "Bearer xxx" }&#10;}'
            font-size="13px"
          />
          <NSpace>
            <NButton type="primary" @click="handleJsonImport">
              {{ $t('ai.mcp.form.parseAndFill') }}
            </NButton>
            <NButton @click="handleCopyJson">
              {{ $t('common.copy') }}
            </NButton>
          </NSpace>
        </template>
      </NSpace>

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
