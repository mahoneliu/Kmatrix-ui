<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { fetchAddSkill, fetchUpdateSkill } from '@/service/api/ai/skill';
import { fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { fetchMcpServerList } from '@/service/api/ai/mcp-server';
import ParamEditor from '../../tool-manager/components/param-editor.vue';
import type { ParamItem } from '../../tool-manager/components/param-editor.vue';

defineOptions({ name: 'SkillFormDrawer' });

interface Props {
  operateType: 'add' | 'edit';
  rowData?: Api.Ai.Skill.Info | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  submitted: [];
}>();
const visible = defineModel<boolean>('visible', { default: false });

const { t } = useI18n();

const title = computed(() => (props.operateType === 'add' ? t('ai.skill.add') : t('ai.skill.edit')));

const formRef = ref<FormInst | null>(null);
const submitLoading = ref(false);

interface ToolBindingItem {
  type: 'builtin' | 'mcp';
  id?: number | string;
}

const builtinToolOptions = ref<{ label: string; value: string | number }[]>([]);
const mcpServerOptions = ref<{ label: string; value: string | number }[]>([]);
const toolBindingsList = ref<ToolBindingItem[]>([]);

function onCreateToolBinding(): ToolBindingItem {
  return { type: 'builtin', id: undefined };
}

async function fetchToolOptions() {
  const [builtinRes, mcpRes] = await Promise.all([fetchBuiltinToolList(), fetchMcpServerList()]);

  if (!builtinRes.error && builtinRes.data) {
    builtinToolOptions.value = builtinRes.data.map((item: any) => ({
      label: item.toolName || `(Builtin) ${item.toolId}`,
      value: item.toolId
    }));
  }

  if (!mcpRes.error && mcpRes.data) {
    mcpServerOptions.value = mcpRes.data.map((item: any) => ({
      label: item.serverName || `(MCP) ${item.serverId}`,
      value: item.serverId
    }));
  }
}

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

const defaultModel: Partial<Api.Ai.Skill.Info> = {
  skillName: '',
  spec: '',
  toolBindings: '[]',
  inputSchema: DEFAULT_SCHEMA,
  outputSchema: '{}',
  status: '0',
  remark: ''
};

const model = reactive<Partial<Api.Ai.Skill.Info>>({ ...defaultModel });

const inputSchemaList = ref<ParamItem[]>([]);
const outputSchemaList = ref<ParamItem[]>([]);

const rules: FormRules = {
  skillName: [{ required: true, message: t('ai.skill.placeholder.nameSearch'), trigger: 'blur' }]
};

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

function initModel() {
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, {
      ...props.rowData,
      inputSchema: props.rowData.inputSchema || DEFAULT_SCHEMA,
      outputSchema: props.rowData.outputSchema || '{}'
    });
  } else {
    Object.assign(model, defaultModel);
  }
  inputSchemaList.value = parseSchemaToList(model.inputSchema as string);
  outputSchemaList.value = parseSchemaToList(model.outputSchema as string);

  try {
    const parsed = JSON.parse(model.toolBindings as string);
    if (Array.isArray(parsed)) {
      toolBindingsList.value = parsed.map((v: any) => ({
        type: v.type || 'builtin',
        id: v.id
      }));
    } else {
      toolBindingsList.value = [];
    }
  } catch {
    toolBindingsList.value = [];
  }
}

watch(visible, val => {
  if (val) {
    initModel();
    fetchToolOptions();
  }
});

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await formRef.value?.validate();

  model.inputSchema = listToSchema(inputSchemaList.value);
  model.outputSchema = listToSchema(outputSchemaList.value);

  const validBindings = toolBindingsList.value.filter(b => Boolean(b.id));
  model.toolBindings = JSON.stringify(validBindings.map(b => ({ type: b.type, id: b.id })));

  submitLoading.value = true;
  try {
    const fn = props.operateType === 'add' ? fetchAddSkill : fetchUpdateSkill;
    const { error } = await fn(model);
    if (!error) {
      window.$message?.success(t('common.saveSuccess'));
      emit('submitted');
      closeDrawer();
    }
  } finally {
    submitLoading.value = false;
  }
}
</script>

<template>
  <NDrawer v-model:show="visible" :width="720" placement="right">
    <NDrawerContent :title="title" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
        <NTabs type="line" animated>
          <NTabPane name="basic" :tab="$t('common.basicInfo')">
            <NFormItem :label="$t('ai.skill.name')" path="skillName">
              <NInput v-model:value="model.skillName" :placeholder="$t('ai.skill.placeholder.name')" />
            </NFormItem>
            <NFormItem :label="$t('ai.skill.description')" path="spec">
              <NInput
                v-model:value="model.spec"
                type="textarea"
                :rows="2"
                :placeholder="$t('ai.skill.placeholder.description')"
              />
            </NFormItem>

            <NFormItem :label="$t('ai.skill.toolBindings')" path="toolBindings">
              <NDynamicInput v-model:value="toolBindingsList" :on-create="onCreateToolBinding">
                <template #create-button-default>添加工具绑定</template>
                <template #default="{ value }">
                  <div class="w-full flex items-center gap-4">
                    <NSelect
                      v-model:value="value.type"
                      :options="[
                        { label: '内置工具(Builtin)', value: 'builtin' },
                        { label: 'MCP服务器(MCP)', value: 'mcp' }
                      ]"
                      class="w-180px"
                    />
                    <NSelect
                      v-if="value.type === 'builtin'"
                      v-model:value="value.id"
                      :options="builtinToolOptions"
                      class="flex-1"
                      placeholder="请选择内置工具"
                    />
                    <NSelect
                      v-if="value.type === 'mcp'"
                      v-model:value="value.id"
                      :options="mcpServerOptions"
                      class="flex-1"
                      placeholder="请选择 MCP 服务器"
                    />
                  </div>
                </template>
              </NDynamicInput>
            </NFormItem>

            <NFormItem :label="$t('common.status')" path="status">
              <NSwitch v-model:value="model.status" checked-value="0" unchecked-value="1">
                <template #checked>
                  {{
                    $t('dict.sys_normal_disable.name') === '正常'
                      ? $t('dict.sys_normal_disable.normal')
                      : $t('dict.sys_normal_disable.normal')
                  }}
                </template>
                <template #unchecked>{{ $t('dict.sys_normal_disable.disable') }}</template>
              </NSwitch>
            </NFormItem>

            <NFormItem :label="$t('common.remark')" path="remark">
              <NInput v-model:value="model.remark" type="textarea" :rows="3" :placeholder="$t('common.remark')" />
            </NFormItem>
          </NTabPane>

          <NTabPane name="inputSchema" :tab="$t('ai.skill.inputSchema')">
            <ParamEditor v-model:value="inputSchemaList" :title="$t('ai.skill.inputSchema')" />
          </NTabPane>

          <NTabPane name="outputSchema" :tab="$t('ai.skill.outputSchema')">
            <ParamEditor v-model:value="outputSchemaList" :title="$t('ai.skill.outputSchema')" />
          </NTabPane>
        </NTabs>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.save') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
