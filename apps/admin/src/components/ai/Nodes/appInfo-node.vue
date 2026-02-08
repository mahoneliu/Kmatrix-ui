<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { NButton, NCollapse, NCollapseItem, NForm, NFormItem, NInput, NModal, NSelect, NSwitch } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { PARAM_TYPE_MAP, PARAM_TYPE_OPTIONS } from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import ModelSelector from '@/components/ai/public/model-selector.vue';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 局部表单数据,避免直接与 Store 双向绑定导致的循环更新
const formModel = reactive<Workflow.AppInfoConfig>({
  appName: '',
  description: '',
  icon: '',
  modelId: null as any,
  prologue: '',
  appParams: [],
  interfaceParams: [],
  sessionParams: []
});

// 参数类型选项已移除，现使用常量 PARAM_TYPE_OPTIONS
// 参数类型映射已移除，现使用常量 PARAM_TYPE_MAP

// 编辑参数弹窗
const showParamModal = ref(false);
const editingParamIndex = ref<number | null>(null);
const editingParamType = ref<'app' | 'interface' | 'session'>('app');
const editingParam = reactive<Workflow.ParamDefinition>({
  key: '',
  label: '',
  type: 'string',
  required: false,
  defaultValue: '',
  description: ''
});

// 参数类型名称映射
const paramTypeNameMap: Record<string, string> = {
  app: '应用参数',
  interface: '接口参数',
  session: '会话参数'
};

// 弹窗标题
const paramModalTitle = computed(() => {
  const typeName = paramTypeNameMap[editingParamType.value];
  return editingParamIndex.value !== null ? `编辑${typeName}` : `添加${typeName}`;
});

// 初始化数据
function initData() {
  const config = props.data.config as Workflow.AppInfoConfig | undefined;
  if (config) {
    formModel.appName = config.appName || '';
    formModel.description = config.description || '';
    formModel.icon = config.icon || '';
    formModel.modelId = (config.modelId || null) as any;
    formModel.prologue = config.prologue || '';
    formModel.appParams = config.appParams || [];
    formModel.interfaceParams = config.interfaceParams || [];
    formModel.sessionParams = config.sessionParams || [];
  }
}

// 添加参数(通用)
function addParam(type: 'app' | 'interface' | 'session') {
  let paramsKey: 'appParams' | 'interfaceParams' | 'sessionParams' = 'appParams';
  if (type === 'interface') paramsKey = 'interfaceParams';
  else if (type === 'session') paramsKey = 'sessionParams';
  if (!formModel[paramsKey]) {
    formModel[paramsKey] = [];
  }
  editingParamType.value = type;
  editingParamIndex.value = null;
  Object.assign(editingParam, {
    key: `param${formModel[paramsKey]!.length + 1}`,
    label: '新参数',
    type: 'string',
    required: false,
    defaultValue: '',
    description: ''
  });
  showParamModal.value = true;
}

// 添加应用参数
function addAppParam() {
  addParam('app');
}

// 添加接口参数
function addInterfaceParam() {
  addParam('interface');
}

// 添加会话参数
function addSessionParam() {
  addParam('session');
}

// 编辑参数(通用)
function editParam(type: 'app' | 'interface' | 'session', index: number) {
  let paramsKey: 'appParams' | 'interfaceParams' | 'sessionParams' = 'appParams';
  if (type === 'interface') paramsKey = 'interfaceParams';
  else if (type === 'session') paramsKey = 'sessionParams';
  editingParamType.value = type;
  editingParamIndex.value = index;
  const param = formModel[paramsKey]![index];
  Object.assign(editingParam, { ...param });
  showParamModal.value = true;
}

// 编辑应用参数
function editAppParam(index: number) {
  editParam('app', index);
}

// 编辑接口参数
function editInterfaceParam(index: number) {
  editParam('interface', index);
}

// 编辑会话参数
function editSessionParam(index: number) {
  editParam('session', index);
}

// 保存参数
function saveParam() {
  let paramsKey: 'appParams' | 'interfaceParams' | 'sessionParams' = 'appParams';
  if (editingParamType.value === 'interface') paramsKey = 'interfaceParams';
  else if (editingParamType.value === 'session') paramsKey = 'sessionParams';

  if (!formModel[paramsKey]) {
    formModel[paramsKey] = [];
  }

  if (editingParamIndex.value !== null) {
    // 编辑现有参数
    formModel[paramsKey]![editingParamIndex.value] = { ...editingParam };
  } else {
    // 添加新参数
    formModel[paramsKey]!.push({ ...editingParam });
  }

  showParamModal.value = false;
}

// 删除参数(通用)
function removeParam(type: 'app' | 'interface' | 'session', index: number) {
  let paramsKey: 'appParams' | 'interfaceParams' | 'sessionParams' = 'appParams';
  if (type === 'interface') paramsKey = 'interfaceParams';
  else if (type === 'session') paramsKey = 'sessionParams';
  formModel[paramsKey]?.splice(index, 1);
}

// 删除全局参数
function removeAppParam(index: number) {
  removeParam('app', index);
}

// 删除接口参数
function removeInterfaceParam(index: number) {
  removeParam('interface', index);
}

// 删除会话参数
function removeSessionParam(index: number) {
  removeParam('session', index);
}

// 监听局部表单变化, 同步到 Store
watch(
  formModel,
  newValue => {
    // 检查是否有实际变化, 避免不必要的 Store 更新
    const currentConfig = props.data.config as Workflow.AppInfoConfig | undefined;
    const hasChanged =
      newValue.appName !== currentConfig?.appName ||
      newValue.description !== currentConfig?.description ||
      newValue.icon !== currentConfig?.icon ||
      newValue.modelId !== currentConfig?.modelId ||
      newValue.prologue !== currentConfig?.prologue ||
      JSON.stringify(newValue.appParams) !== JSON.stringify(currentConfig?.appParams) ||
      JSON.stringify(newValue.interfaceParams) !== JSON.stringify(currentConfig?.interfaceParams) ||
      JSON.stringify(newValue.sessionParams) !== JSON.stringify(currentConfig?.sessionParams);

    if (hasChanged) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化 (如 DSL 加载时), 同步到局部表单
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as Workflow.AppInfoConfig | undefined;
    if (config) {
      // 只有当外部数据真的与当前表单不同时才更新,防止循环
      const hasChanged =
        config.appName !== formModel.appName ||
        config.description !== formModel.description ||
        config.icon !== formModel.icon ||
        config.modelId !== formModel.modelId ||
        config.prologue !== formModel.prologue ||
        JSON.stringify(config.appParams) !== JSON.stringify(formModel.appParams) ||
        JSON.stringify(config.interfaceParams) !== JSON.stringify(formModel.interfaceParams) ||
        JSON.stringify(config.sessionParams) !== JSON.stringify(formModel.sessionParams);

      if (hasChanged) {
        formModel.appName = config.appName || '';
        formModel.description = config.description || '';
        formModel.icon = config.icon || '';
        formModel.modelId = (config.modelId || null) as any;
        formModel.prologue = config.prologue || '';
        formModel.appParams = config.appParams || [];
        formModel.interfaceParams = config.interfaceParams || [];
        formModel.sessionParams = config.sessionParams || [];
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  initData();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-60">
      <NCollapse :default-expanded-names="['basic']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem title="基础配置" name="basic">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">
                应用名称
                <span class="workflow-label-required">*</span>
              </label>
              <NInput v-model:value="formModel.appName" class="workflow-input" placeholder="请输入应用名称" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">应用描述</label>
              <NInput
                v-model:value="formModel.description"
                class="workflow-textarea"
                type="textarea"
                :rows="2"
                placeholder="请输入应用描述"
              />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">
                选择模型
                <span class="workflow-label-required">*</span>
              </label>
              <ModelSelector v-model:model-value="formModel.modelId" class="workflow-input" />
            </div>

            <div class="workflow-config-item">
              <label class="workflow-label">开场白</label>
              <NInput
                v-model:value="formModel.prologue"
                class="workflow-textarea"
                type="textarea"
                :rows="2"
                placeholder="请输入开场白"
              />
            </div>
          </div>
        </NCollapseItem>

        <!-- 参数 -->
        <NCollapseItem title="自定义参数" name="params">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-between text-12px c-gray-5 font-600">应用参数</div>
                <NButton secondary size="tiny" @click="addAppParam">
                  <template #icon>
                    <SvgIcon local-icon="mdi-plus" />
                  </template>
                </NButton>
              </div>

              <!-- 参数列表 -->
              <div v-if="formModel.appParams && formModel.appParams.length > 0" class="flex flex-col gap-1">
                <div
                  v-for="(param, index) in formModel.appParams"
                  :key="index"
                  class="group flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 text-12px hover:bg-gray-1 dark:hover:bg-dark-3"
                  @click="editAppParam(index)"
                >
                  <div class="flex flex-1 items-center gap-2 overflow-hidden">
                    <span class="c-primary font-500 font-mono">{{ param.key }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="c-gray-5">{{ PARAM_TYPE_MAP[param.type] || param.type }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="flex-1 truncate c-gray-6">{{ param.label }}</span>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <NButton text size="tiny" @click.stop="editAppParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-pencil" />
                      </template>
                    </NButton>
                    <NButton text type="error" size="tiny" @click.stop="removeAppParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-delete" />
                      </template>
                    </NButton>
                  </div>
                </div>
              </div>
              <!-- <div v-else class="py-2 text-center text-11px c-gray-4">暂无全局参数</div> -->
            </div>

            <!-- 接口参数 -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-between text-12px c-gray-5 font-600">接口参数</div>
                <NButton secondary size="tiny" @click="addInterfaceParam">
                  <template #icon>
                    <SvgIcon local-icon="mdi-plus" />
                  </template>
                </NButton>
              </div>

              <!-- 参数列表 -->
              <div v-if="formModel.interfaceParams && formModel.interfaceParams.length > 0" class="flex flex-col gap-1">
                <div
                  v-for="(param, index) in formModel.interfaceParams"
                  :key="index"
                  class="group flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 text-12px hover:bg-gray-1 dark:hover:bg-dark-3"
                  @click="editInterfaceParam(index)"
                >
                  <div class="flex flex-1 items-center gap-1 overflow-hidden">
                    <span class="c-blue-6 font-500 font-mono">{{ param.key }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="c-gray-5">{{ PARAM_TYPE_MAP[param.type] || param.type }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="flex-1 truncate c-gray-6">{{ param.label }}</span>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <NButton text size="tiny" @click.stop="editInterfaceParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-pencil" />
                      </template>
                    </NButton>
                    <NButton text type="error" size="tiny" @click.stop="removeInterfaceParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-delete" />
                      </template>
                    </NButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- 会话参数 -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-between text-12px c-gray-5 font-600">会话参数</div>
                <NButton secondary size="tiny" @click="addSessionParam">
                  <template #icon>
                    <SvgIcon local-icon="mdi-plus" />
                  </template>
                </NButton>
              </div>

              <!-- 参数列表 -->
              <div v-if="formModel.sessionParams && formModel.sessionParams.length > 0" class="flex flex-col gap-1">
                <div
                  v-for="(param, index) in formModel.sessionParams"
                  :key="index"
                  class="group flex cursor-pointer items-center gap-1 rounded px-2 py-1.5 text-12px hover:bg-gray-1 dark:hover:bg-dark-3"
                  @click="editSessionParam(index)"
                >
                  <div class="flex flex-1 items-center gap-1 overflow-hidden">
                    <span class="c-orange-6 font-500 font-mono">{{ param.key }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="c-gray-5">{{ PARAM_TYPE_MAP[param.type] || param.type }}</span>
                    <span class="c-gray-4">·</span>
                    <span class="flex-1 truncate c-gray-6">{{ param.label }}</span>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <NButton text size="tiny" @click.stop="editSessionParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-pencil" />
                      </template>
                    </NButton>
                    <NButton text type="error" size="tiny" @click.stop="removeSessionParam(index)">
                      <template #icon>
                        <SvgIcon local-icon="mdi-delete" />
                      </template>
                    </NButton>
                  </div>
                </div>
              </div>
              <!-- <div v-else class="py-2 text-center text-11px c-gray-4">暂无会话参数</div> -->
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>

    <!-- 参数编辑弹窗 -->
    <NModal v-model:show="showParamModal" preset="card" :title="paramModalTitle" class="w-120">
      <NForm :model="editingParam" label-placement="left" label-width="80" size="medium">
        <NFormItem label="参数键" required>
          <NInput v-model:value="editingParam.key" placeholder="例如: userName" />
        </NFormItem>
        <NFormItem label="参数名称" required>
          <NInput v-model:value="editingParam.label" placeholder="例如: 用户名称" />
        </NFormItem>
        <NFormItem label="数据类型" required>
          <NSelect v-model:value="editingParam.type" :options="PARAM_TYPE_OPTIONS" />
        </NFormItem>
        <NFormItem label="是否必填">
          <NSwitch v-model:value="editingParam.required">
            <template #checked>必填</template>
            <template #unchecked>可选</template>
          </NSwitch>
        </NFormItem>
        <NFormItem label="默认值">
          <NInput v-model:value="editingParam.defaultValue" placeholder="参数默认值" />
        </NFormItem>
        <NFormItem label="参数描述">
          <NInput v-model:value="editingParam.description" type="textarea" :rows="3" placeholder="描述参数的用途" />
        </NFormItem>
      </NForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <NButton @click="showParamModal = false">取消</NButton>
          <NButton type="primary" @click="saveParam">保存</NButton>
        </div>
      </template>
    </NModal>
  </BaseNode>
</template>

<style scoped>
/* 覆盖 BaseNode 的默认宽度限制,允许更宽 */
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
