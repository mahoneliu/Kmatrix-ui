<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import ParamTag from './add-in/param-tag.vue';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 获取 APP_INFO 节点的配置
const appInfoConfig = computed(() => {
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  return appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;
});

// 全局参数
const globalParams = ref<Workflow.ParamDefinition[]>();

onMounted(() => {
  globalParams.value = [
    { key: 'userId', label: $t('ai.workflow_node.user_id'), type: 'string', required: true },
    { key: 'userName', label: $t('ai.workflow_node.user_name'), type: 'string', required: true },
    { key: 'sessionId', label: $t('ai.workflow_node.session_id'), type: 'string', required: true },
    { key: 'historyContext', label: $t('ai.workflow_node.history_context'), type: 'array', required: true }
    // ,
    // ...(appInfoConfig.value?.globalParams || [])
  ];

  workflowStore.updateNodeConfig(props.id, { globalParams });
});

// 应用参数
const appParams = computed(() => appInfoConfig.value?.appParams || []);

// 接口参数
const interfaceParams = computed(() => appInfoConfig.value?.interfaceParams || []);

// 会话参数
const sessionParams = computed(() => appInfoConfig.value?.sessionParams || []);

// 是否有任何参数
const hasAnyParams = computed(
  () => appParams.value.length > 0 || interfaceParams.value.length > 0 || sessionParams.value.length > 0
);
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-60">
      <NCollapse :default-expanded-names="['globalParams']">
        <NCollapseItem :title="$t('ai.workflow_node.global_params')" name="globalParams">
          <template #arrow>
            <SvgIcon local-icon="mdi-play" class="text-4 c-gray-5" />
          </template>
          <div class="workflow-config-item-section">
            <div class="min-w-full w-0 flex flex-wrap gap-1.5">
              <ParamTag
                v-for="param in globalParams"
                :key="param.key"
                :param="param"
                source-type="global"
                :node-data="data"
              />
            </div>
          </div>
        </NCollapseItem>

        <NCollapseItem v-if="hasAnyParams" :title="$t('ai.workflow_node.custom_parameters')" name="params">
          <template #arrow>
            <SvgIcon local-icon="mdi-play" class="text-4 c-gray-5" />
          </template>
          <div class="flex flex-col gap-3">
            <!-- 应用参数 -->
            <div v-if="appParams.length > 0" class="workflow-config-item-section">
              <div class="text-11px c-gray-5 font-600">{{ $t('ai.workflow_node.app_params') }}</div>
              <div class="min-w-full w-0 flex flex-wrap gap-1.5">
                <ParamTag v-for="param in appParams" :key="param.key" :param="param" source-type="app" />
              </div>
            </div>

            <!-- 接口参数 -->
            <div v-if="interfaceParams.length > 0" class="workflow-config-item-section">
              <div class="text-11px c-gray-5 font-600">{{ $t('ai.workflow_node.interface_params') }}</div>
              <div class="flex flex-wrap gap-1.5">
                <ParamTag v-for="param in interfaceParams" :key="param.key" :param="param" source-type="interface" />
              </div>
            </div>

            <!-- 会话参数 -->
            <div v-if="sessionParams.length > 0" class="workflow-config-item-section">
              <div class="text-11px c-gray-5 font-600">{{ $t('ai.workflow_node.session_params') }}</div>
              <div class="flex flex-wrap gap-1.5">
                <ParamTag v-for="param in sessionParams" :key="param.key" :param="param" source-type="session" />
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
