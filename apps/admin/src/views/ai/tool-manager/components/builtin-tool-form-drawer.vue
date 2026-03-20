<script setup lang="ts">
/**
 * 内置 Python 工具 新增/编辑 Drawer 表单
 *
 * 使用 Monaco Editor 编辑 Python 脚本，使用纯文本（JSON）编辑输入参数 Schema。
 * @author Mahone
 * @date 2026-03-15
 */
import { defineAsyncComponent, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  useMessage
} from 'naive-ui';
import type { FormInst } from 'naive-ui';
import { addBuiltinTool, updateBuiltinTool } from '@/service/api/ai/builtin-tool';
import { $t } from '@/locales';
import ParamEditor from './param-editor.vue';
import type { ParamItem } from './param-editor.vue';

// Monaco Editor 异步加载（避免打包时严重膨胀）
const MonacoEditor = defineAsyncComponent(() => import('@/components/custom/monaco-editor.vue'));

interface Props {
  show: boolean;
  tool: Api.Ai.BuiltinToolVo | null;
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

const DEFAULT_PYTHON = `# 在这里编写你的 Python 工具脚本
# 脚本接收 JSON 格式的 input 参数（从 stdin 读取或通过参数传入）
# 并将 JSON 格式的 output 结果输出到 stdout

import json, sys

def run(params: dict) -> dict:
    # TODO: 实现你的工具逻辑
    return {"result": "ok"}

if __name__ == "__main__":
    params = json.loads(sys.stdin.read())
    print(json.dumps(run(params)))
`;

const DEFAULT_SCHEMA = JSON.stringify(
  {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '查询内容'
      }
    },
    required: ['query']
  },
  null,
  2
);

const defaultForm = (): Api.Ai.BuiltinToolBo => ({
  toolName: '',
  spec: '',
  initParams: '[]',
  inputSchema: DEFAULT_SCHEMA,
  outputSchema: '{}',
  pythonCode: DEFAULT_PYTHON,
  status: '0',
  remark: ''
});

const form = ref<Api.Ai.BuiltinToolBo>(defaultForm());

const rules = {
  toolName: [
    {
      required: true,
      message: () => $t('ai.builtinTool.form.toolNameRequired'),
      trigger: 'blur'
    },
    {
      pattern: /^[a-z_][a-z0-9_]*$/,
      message: () => $t('ai.builtinTool.form.toolNamePattern'),
      trigger: 'blur'
    }
  ]
};

const statusOptions = [
  { label: $t('common.enable'), value: '0' },
  { label: $t('common.disable'), value: '1' }
];

const initParamsList = ref<ParamItem[]>([]);
const inputSchemaList = ref<ParamItem[]>([]);
const outputSchemaList = ref<ParamItem[]>([]);

function parseSchemaToList(schemaStr: string): ParamItem[] {
  try {
    const schema = JSON.parse(schemaStr);
    if (schema.type !== 'object' || !schema.properties) return [];
    const params: ParamItem[] = [];
    const requiredList = Array.isArray(schema.required) ? schema.required : [];
    for (const [name, prop] of Object.entries<any>(schema.properties)) {
      params.push({
        name,
        type: prop.type || 'string',
        description: prop.description || '',
        required: requiredList.includes(name),
        displayName: prop.title || '',
        defaultValue: prop.default || ''
      });
    }
    return params;
  } catch {
    return [];
  }
}

function parseInitParams(jsonStr: string): ParamItem[] {
  try {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => ({
      name: item.name || '',
      type: item.type || 'string',
      description: item.description || '',
      required: Boolean(item.required),
      displayName: item.displayName || '',
      defaultValue: item.defaultValue || ''
    }));
  } catch {
    return [];
  }
}

function listToSchema(list: ParamItem[]): string {
  if (list.length === 0) return '{}';
  const schema: any = { type: 'object', properties: {}, required: [] };
  for (const item of list) {
    if (item.name) {
      schema.properties[item.name] = {
        type: item.type,
        description: item.description
      };
      if (item.displayName) schema.properties[item.name].title = item.displayName;
      if (item.defaultValue) schema.properties[item.name].default = item.defaultValue;
      if (item.required) schema.required.push(item.name);
    }
  }
  if (schema.required.length === 0) delete schema.required;
  return JSON.stringify(schema, null, 2);
}

watch(
  () => props.show,
  val => {
    if (val) {
      if (props.tool) {
        isEdit.value = true;
        form.value = {
          toolId: props.tool.toolId,
          toolName: props.tool.toolName,
          spec: props.tool.spec ?? '',
          initParams: props.tool.initParams ?? '[]',
          inputSchema: props.tool.inputSchema ?? DEFAULT_SCHEMA,
          outputSchema: props.tool.outputSchema ?? '{}',
          pythonCode: props.tool.pythonCode ?? DEFAULT_PYTHON,
          status: props.tool.status,
          remark: props.tool.remark ?? ''
        };
      } else {
        isEdit.value = false;
        form.value = defaultForm();
      }
      initParamsList.value = parseInitParams(form.value.initParams || '[]');
      inputSchemaList.value = parseSchemaToList(form.value.inputSchema || '{}');
      outputSchemaList.value = parseSchemaToList(form.value.outputSchema || '{}');
    }
  }
);

async function handleSubmit() {
  await formRef.value?.validate();

  // Convert lists back to JSON strings before saving
  form.value.initParams = JSON.stringify(initParamsList.value);
  form.value.inputSchema = listToSchema(inputSchemaList.value);
  form.value.outputSchema = listToSchema(outputSchemaList.value);

  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateBuiltinTool(form.value);
      message.success($t('common.updateSuccess'));
    } else {
      await addBuiltinTool(form.value);
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
  <NDrawer :show="show" :width="720" @update:show="emit('update:show', $event)">
    <NDrawerContent :title="isEdit ? $t('ai.builtinTool.editTitle') : $t('ai.builtinTool.addTitle')" closable>
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <!-- 基本信息 -->
        <NFormItem :label="$t('ai.builtinTool.toolName')" path="toolName">
          <NInput
            v-model:value="form.toolName"
            :placeholder="$t('ai.builtinTool.form.toolNamePlaceholder')"
            :disabled="isEdit"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.builtinTool.description')" path="spec">
          <NInput
            v-model:value="form.spec"
            type="textarea"
            :rows="2"
            :placeholder="$t('ai.builtinTool.form.descriptionPlaceholder')"
          />
        </NFormItem>

        <NFormItem :label="$t('ai.builtinTool.status')" path="status">
          <NSelect v-model:value="form.status" :options="statusOptions" class="w-150px" />
        </NFormItem>

        <!-- 脚本 & Schema 多标签页编辑 -->
        <NTabs type="line" animated>
          <NTabPane name="code" :tab="$t('ai.builtinTool.pythonCode')">
            <NAlert type="warning" :title="$t('ai.builtinTool.securityWarningTitle')" class="mb-3">
              {{ $t('ai.builtinTool.securityWarning') }}
            </NAlert>
            <!-- Monaco Editor fallback: 如果 Monaco Editor 组件不存在则使用 NInput -->
            <Suspense>
              <MonacoEditor
                :value="form.pythonCode || ''"
                language="python"
                :height="320"
                @update:value="val => (form.pythonCode = val)"
              />
              <template #fallback>
                <NInput
                  v-model:value="form.pythonCode"
                  type="textarea"
                  :rows="14"
                  :placeholder="$t('ai.builtinTool.form.codePlaceholder')"
                />
              </template>
            </Suspense>
          </NTabPane>

          <NTabPane name="initParams" :tab="$t('ai.builtinTool.initParamsTab')">
            <ParamEditor v-model:value="initParamsList" :title="$t('ai.builtinTool.initParamsTab')" />
          </NTabPane>

          <NTabPane name="schema" :tab="$t('ai.builtinTool.inputSchema')">
            <ParamEditor v-model:value="inputSchemaList" :title="$t('ai.builtinTool.inputSchemaTab')" />
          </NTabPane>

          <NTabPane name="outputSchema" :tab="$t('ai.builtinTool.outputSchemaTab')">
            <ParamEditor v-model:value="outputSchemaList" :title="$t('ai.builtinTool.outputSchemaTab')" />
          </NTabPane>

          <NTabPane name="remark" :tab="$t('common.remark')">
            <NInput v-model:value="form.remark" type="textarea" :rows="5" />
          </NTabPane>
        </NTabs>
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
