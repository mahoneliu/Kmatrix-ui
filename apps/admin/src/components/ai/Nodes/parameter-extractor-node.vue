<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSwitch } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { PARAM_TYPE_MAP, PARAM_TYPE_OPTIONS } from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useAiNodeConfig } from '@/composables/ai/workflow/use-ai-node';
import { getTagBackground } from '@/utils/color';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  updateNodeInternals: [];
  deleteNode: [id: string];
  duplicateNode: [id: string];
  sourceHandleClick: [event: MouseEvent, id: string];
}>();

const workflowStore = useWorkflowStore();

// 参数类型选项（复用全局常量，含中文 label�?
// typeOptions 直接�?PARAM_TYPE_OPTIONS computed

const { formModel, initData } = useAiNodeConfig(props.id, () => props.data, {
  parameters: [] as Workflow.ExtractorParamDef[],
  extractionInstructions: ''
});

onMounted(() => {
  initData();
  syncOutputParams();
});

// ── 弹窗状�?──────────────────────────────────────────────
const showModal = ref(false);
const editingIndex = ref<number | null>(null);

const emptyParam = (): Workflow.ExtractorParamDef => ({
  name: '',
  type: 'string',
  description: '',
  required: false
});

const draftParam = ref<Workflow.ExtractorParamDef>(emptyParam());

function openAddModal() {
  editingIndex.value = null;
  draftParam.value = emptyParam();
  showModal.value = true;
}

function openEditModal(index: number) {
  editingIndex.value = index;
  draftParam.value = { ...formModel.parameters[index] };
  showModal.value = true;
}

function confirmModal() {
  if (!draftParam.value.name.trim()) return;
  if (editingIndex.value !== null) {
    formModel.parameters[editingIndex.value] = { ...draftParam.value };
  } else {
    formModel.parameters.push({ ...draftParam.value });
  }
  showModal.value = false;
}

function removeParameter(index: number) {
  formModel.parameters.splice(index, 1);
}

// ── 同步 customOutputParams ───────────────────────────────
// �?parameters 映射�?ParamDefinition[] 写入节点�?customOutputParams
// 这样下游节点的参数选择器就能看到这些输出变�?
function syncOutputParams() {
  const outputs: Workflow.ParamDefinition[] = formModel.parameters
    .filter(p => p.name && p.name.trim() !== '')
    .map(p => ({
      key: p.name,
      label: p.name,
      type: p.type as Workflow.ParamDataType,
      required: p.required,
      description: p.description || ''
    }));

  workflowStore.updateNode(props.id, {
    dynamicOutputParams: outputs,
    customOutputParams: [] // 清理旧数据，归并到动态参数
  });
}

watch(
  () => formModel.parameters,
  () => syncOutputParams(),
  { deep: true }
);
</script>

<template>
  <BaseNode
    v-bind="props"
    :data="data"
    class="parameter-extractor-node"
    @delete-node="id => emit('deleteNode', id)"
    @duplicate-node="id => emit('duplicateNode', id)"
    @source-handle-click="(e, id) => emit('sourceHandleClick', e, id)"
  >
    <div class="w-full">
      <!-- 参数定义区域：标题行 + 参数列表 + 提取指令，使用与"节点参数"控件相同的容器结�?-->
      <div class="workflow-config-item-section dark:bg-white/5">
        <!-- 标题�?-->
        <div class="flex items-center justify-between">
          <span class="text-12px">{{ $t('ai.workflow_node.parameter_extractor.param_definitions') }}</span>
          <NButton secondary size="tiny" @click.stop="openAddModal">
            <template #icon>
              <SvgIcon local-icon="mdi-plus" />
            </template>
          </NButton>
        </div>

        <!-- 空状�?-->
        <div v-if="formModel.parameters.length === 0" class="py-1 text-center text-xs text-gray-4">
          {{ $t('ai.node_definition.no_parameter_click_add') }}
        </div>

        <!-- 参数列表 -->
        <div class="flex flex-col gap-1.5">
          <div
            v-for="(param, index) in formModel.parameters"
            :key="index"
            class="w-full flex cursor-pointer items-center justify-between text-11px"
            @click="openEditModal(index)"
          >
            <!-- 左侧：带颜色边框的键�?tag -->
            <div
              class="inline-flex items-center gap-1 rounded px-2 py-1 font-600 font-mono"
              :style="{
                backgroundColor: getTagBackground(data.nodeColor),
                borderLeft: `1px solid ${data.nodeColor}`,
                color: data.nodeColor
              }"
            >
              {{ param.name || $t('ai.workflow_node.unnamed_param') }}
            </div>

            <!-- 右侧：类�?+ 删除 -->
            <div class="flex items-center gap-2">
              <span class="c-gray-5 dark:c-gray-4">{{ PARAM_TYPE_MAP[param.type] || param.type }}</span>
              <NButton secondary size="tiny" @click.stop="removeParameter(index)">
                <template #icon>
                  <SvgIcon local-icon="mdi-minus" />
                </template>
              </NButton>
            </div>
          </div>
        </div>

        <!-- 提取指令 -->
        <div class="mt-2">
          <span class="mb-1 block text-12px text-gray-5 dark:text-gray-4">
            {{ $t('ai.workflow_node.parameter_extractor.extraction_instructions') }}
          </span>
          <NInput
            v-model:value="formModel.extractionInstructions"
            type="textarea"
            :rows="3"
            :placeholder="$t('ai.workflow_node.parameter_extractor.instructions_placeholder')"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑参数弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="card"
      :title="
        editingIndex !== null
          ? $t('ai.workflow_node.edit_type_name', { typeName: $t('ai.workflow_node.param') })
          : $t('ai.workflow_node.add_type_name2', { typeName: $t('ai.workflow_node.param') })
      "
      style="width: 420px"
      :mask-closable="false"
    >
      <NForm label-placement="top" :show-feedback="false">
        <!-- 参数名称 -->
        <NFormItem :label="$t('ai.workflow_node.parameter_extractor.param_name')" required>
          <NInput
            v-model:value="draftParam.name"
            :placeholder="$t('ai.workflow_node.parameter_extractor.param_name_placeholder')"
            size="small"
          />
        </NFormItem>

        <!-- 数据类型 -->
        <NFormItem :label="$t('ai.workflow_node.parameter_extractor.param_type')">
          <NSelect v-model:value="draftParam.type" :options="PARAM_TYPE_OPTIONS" size="small" />
        </NFormItem>

        <!-- 描述 -->
        <NFormItem :label="$t('ai.workflow_node.parameter_extractor.param_description')">
          <NInput
            v-model:value="draftParam.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('ai.workflow_node.parameter_extractor.param_description_placeholder')"
            size="small"
          />
        </NFormItem>

        <!-- 必填 -->
        <NFormItem :label="$t('ai.workflow_node.parameter_extractor.param_required')">
          <NSwitch v-model:value="draftParam.required" size="small" />
        </NFormItem>
      </NForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <NButton size="small" @click="showModal = false">
            {{ $t('common.cancel') }}
          </NButton>
          <NButton size="small" type="primary" :disabled="!draftParam.name.trim()" @click="confirmModal">
            {{ $t('common.confirm') }}
          </NButton>
        </div>
      </template>
    </NModal>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 360px !important;
  max-width: 400px;
}
</style>
