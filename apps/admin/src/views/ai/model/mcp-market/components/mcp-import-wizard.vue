<script setup lang="ts">
/**
 * MCP 市场导入向导
 * 支持预填充市场条目信息、动态参数输入、配置模板占位符高亮、连接测试、同名检测
 * @author Mahone
 * @date 2026-03-15
 */
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NSpin,
  NTag,
  useDialog,
  useMessage
} from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { addMcpServer, fetchMcpServerList, testMcpConnection, updateMcpServer } from '@/service/api/ai/mcp-server';

interface Props {
  show: boolean;
  item: Api.Ai.McpMarketItemVo | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const dialog = useDialog();
const router = useRouter();
const formRef = ref<FormInst | null>(null);

// ============ 表单数据 ============

const formName = ref('');
const formDescription = ref('');
/** 参数值映射：key -> value */
const paramValues = ref<Record<string, string>>({});

// ============ 连接测试状态 ============

const testing = ref(false);
const testResult = ref<Api.Ai.McpConnectionTestResultVo | null>(null);

// ============ 提交状态 ============

const submitting = ref(false);

// ============ 表单校验规则（动态生成） ============

const rules = computed<FormRules>(() => {
  const r: FormRules = {
    formName: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
  };
  if (props.item?.params) {
    for (const param of props.item.params) {
      if (param.required) {
        r[`param_${param.key}`] = [{ required: true, message: `${param.label} 不能为空`, trigger: 'blur' }];
      }
    }
  }
  return r;
});

// ============ 占位符替换：生成最终 serverConfig ============

/**
 * 将 configTemplate 中的 ${KEY} 替换为用户填写的参数值
 */
function buildServerConfig(): string {
  if (!props.item?.configTemplate) return '';
  let config = props.item.configTemplate;
  for (const [key, value] of Object.entries(paramValues.value)) {
    config = config.replaceAll(`\${${key}}`, value);
  }
  return config;
}

// ============ 配置模板占位符高亮 ============

/**
 * 将配置模板中的 ${KEY} 占位符用高亮 span 包裹
 * 返回 HTML 字符串，用于 v-html 渲染
 */
function highlightTemplate(template: string): string {
  if (!template) return '';
  // 先转义 HTML 特殊字符，防止 XSS
  const escaped = template.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // 高亮 ${KEY} 格式占位符
  return escaped.replace(
    /\$\{([^}]+)\}/g,
    // eslint-disable-next-line no-template-curly-in-string
    '<span class="placeholder-highlight">${$1}</span>'
  );
}

const highlightedTemplate = computed(() => {
  return props.item?.configTemplate ? highlightTemplate(props.item.configTemplate) : '';
});

// ============ 连接测试 ============

async function handleTestConnection() {
  const serverConfig = buildServerConfig();
  if (!serverConfig) {
    message.warning('配置模板为空，无法测试连接');
    return;
  }

  testing.value = true;
  testResult.value = null;
  try {
    const res = await testMcpConnection({
      serverConfig,
      transportType: props.item?.transportType
    });
    testResult.value = (res as any)?.data ?? res;
  } catch {
    testResult.value = {
      success: false,
      tools: [],
      errorMessage: '请求失败，请检查网络连接',
      elapsedMs: 0
    };
  } finally {
    testing.value = false;
  }
}

// ============ 确认导入 ============

async function handleImport() {
  // 1. 表单校验
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    // 2. 查询是否存在同名 Server
    const listRes = await fetchMcpServerList({ serverName: formName.value });
    const existingList: Api.Ai.McpServerVo[] = (listRes as any)?.data ?? listRes ?? [];
    const existing = existingList.find(s => s.serverName === formName.value);

    if (existing) {
      // 3. 存在同名，弹出确认对话框
      submitting.value = false;
      dialog.warning({
        title: '同名服务已存在',
        content: `已存在名为「${formName.value}」的 MCP Server，是否覆盖更新？`,
        positiveText: '覆盖更新',
        negativeText: '取消',
        onPositiveClick: () => doSave(existing.serverId)
      });
    } else {
      // 4. 不存在同名，直接新增
      await doSave();
    }
  } catch {
    message.error('查询同名服务失败，请重试');
    submitting.value = false;
  }
}

async function doSave(existingServerId?: CommonType.IdType) {
  submitting.value = true;
  try {
    const serverConfig = buildServerConfig();
    const bo: Api.Ai.McpServerBo = {
      serverName: formName.value,
      description: formDescription.value,
      transportType: props.item?.transportType as 'sse' | 'streamable_http',
      serverConfig,
      status: '0'
    };

    if (existingServerId) {
      bo.serverId = existingServerId;
      await updateMcpServer(bo);
      message.success('更新成功');
    } else {
      await addMcpServer(bo);
      message.success('导入成功');
    }

    emit('success');
    emit('update:show', false);
    // 跳转到 MCP Manager 页面
    router.push('/ai/model/mcp-manager');
  } catch {
    message.error('保存失败，请重试');
  } finally {
    submitting.value = false;
  }
}

// ============ 关闭 ============

function handleClose() {
  emit('update:show', false);
}

// ============ 监听 show，初始化表单 ============

watch(
  () => props.show,
  val => {
    if (val && props.item) {
      formName.value = props.item.name;
      formDescription.value = props.item.description ?? '';
      // 初始化参数值为空
      const values: Record<string, string> = {};
      for (const param of props.item.params ?? []) {
        values[param.key] = '';
      }
      paramValues.value = values;
      testResult.value = null;
    }
  }
);
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="`导入 MCP 服务：${item?.name ?? ''}`"
    style="width: 600px"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <NForm ref="formRef" :model="{ formName, formDescription, ...paramValues }" :rules="rules" label-placement="top">
      <!-- 名称 -->
      <NFormItem label="名称" path="formName">
        <NInput v-model:value="formName" placeholder="请输入 MCP Server 名称" />
      </NFormItem>

      <!-- 描述 -->
      <NFormItem label="描述" path="formDescription">
        <NInput v-model:value="formDescription" type="textarea" :rows="2" placeholder="可选，服务描述" />
      </NFormItem>

      <!-- 传输类型（只读） -->
      <NFormItem label="传输类型">
        <NTag :type="item?.transportType === 'sse' ? 'success' : 'info'" size="medium">
          {{ item?.transportType === 'sse' ? 'SSE' : 'Streamable HTTP' }}
        </NTag>
      </NFormItem>

      <!-- 动态参数输入 -->
      <template v-if="item?.params && item.params.length > 0">
        <NFormItem v-for="param in item.params" :key="param.key" :path="`param_${param.key}`">
          <template #label>
            <span>
              {{ param.label }}
              <span v-if="param.required" class="ml-0.5 text-error">*</span>
            </span>
          </template>
          <NInput v-model:value="paramValues[param.key]" :placeholder="param.description || `请输入 ${param.label}`" />
        </NFormItem>
      </template>

      <!-- 配置模板预览（占位符高亮） -->
      <NFormItem v-if="item?.configTemplate" label="配置模板预览">
        <div class="config-template-preview w-full border border-gray-200 rounded-lg bg-gray-50 p-3">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <pre
            class="m-0 overflow-auto whitespace-pre-wrap text-xs text-gray-700 leading-relaxed"
            v-html="highlightedTemplate"
          />
        </div>
      </NFormItem>

      <!-- 连接测试结果 -->
      <NFormItem v-if="testResult" label="测试结果">
        <NAlert
          :type="testResult.success ? 'success' : 'error'"
          class="w-full"
          :title="testResult.success ? `连接成功（${testResult.elapsedMs}ms）` : '连接失败'"
        >
          <template v-if="testResult.success && testResult.tools.length > 0">
            <p class="mb-1 text-xs text-gray-600">发现 {{ testResult.tools.length }} 个工具：</p>
            <div class="flex flex-wrap gap-1">
              <NTag v-for="tool in testResult.tools" :key="tool.name" size="small" type="success" :bordered="false">
                {{ tool.name }}
              </NTag>
            </div>
          </template>
          <template v-else-if="!testResult.success">
            <p class="text-xs">{{ testResult.errorMessage }}</p>
          </template>
        </NAlert>
      </NFormItem>
    </NForm>

    <template #footer>
      <NSpace justify="space-between">
        <!-- 左侧：测试连接 -->
        <NSpin :show="testing" size="small">
          <NButton :loading="testing" :disabled="submitting" @click="handleTestConnection">测试连接</NButton>
        </NSpin>

        <!-- 右侧：取消 + 确认导入 -->
        <NSpace>
          <NButton :disabled="submitting || testing" @click="handleClose">取消</NButton>
          <NButton type="primary" :loading="submitting" :disabled="testing" @click="handleImport">确认导入</NButton>
        </NSpace>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.config-template-preview {
  max-height: 200px;
  overflow-y: auto;
}

:deep(.placeholder-highlight) {
  color: var(--primary-color, #18a058);
  background-color: color-mix(in srgb, var(--primary-color, #18a058) 10%, transparent);
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
}
</style>
