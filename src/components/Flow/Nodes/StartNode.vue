<script setup lang="ts">
import { computed } from 'vue';
import { NCollapse, NCollapseItem } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { useWorkflowStore } from '@/store/modules/workflow';
import ParamTag from '../ParamTag.vue';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 获取 APP_INFO 节点的配置
const appInfoConfig = computed(() => {
  const appInfoNode = workflowStore.nodes.find(n => n.data.nodeType === 'APP_INFO');
  return appInfoNode?.data.config as Workflow.AppInfoConfig | undefined;
});

// 全局参数
const globalParams = computed(() => appInfoConfig.value?.globalParams || []);

// 接口参数
const interfaceParams = computed(() => appInfoConfig.value?.interfaceParams || []);

// 会话参数
const sessionParams = computed(() => appInfoConfig.value?.sessionParams || []);

// 是否有任何参数
const hasAnyParams = computed(
  () => globalParams.value.length > 0 || interfaceParams.value.length > 0 || sessionParams.value.length > 0
);
</script>

<template>
  <BaseNode v-bind="props" :data="data">
    <div class="w-60">
      <NCollapse v-if="hasAnyParams" :default-expanded-names="['params']">
        <template #arrow>
          <SvgIcon icon="mdi:play" class="text-4 c-gray-5" />
        </template>
        <NCollapseItem title="应用参数" name="params">
          <div class="flex flex-col gap-3">
            <!-- 全局参数 -->
            <div v-if="globalParams.length > 0" class="flex flex-col gap-1.5">
              <div class="text-11px c-gray-5 font-600">全局参数</div>
              <div class="min-w-full w-0 flex flex-wrap gap-1.5">
                <ParamTag v-for="param in globalParams" :key="param.key" :param="param" source-type="global" />
              </div>
            </div>

            <!-- 接口参数 -->
            <div v-if="interfaceParams.length > 0" class="flex flex-col gap-1.5">
              <div class="text-11px c-gray-5 font-600">接口参数</div>
              <div class="flex flex-wrap gap-1.5">
                <ParamTag v-for="param in interfaceParams" :key="param.key" :param="param" source-type="interface" />
              </div>
            </div>

            <!-- 会话参数 -->
            <div v-if="sessionParams.length > 0" class="flex flex-col gap-1.5">
              <div class="text-11px c-gray-5 font-600">会话参数</div>
              <div class="flex flex-wrap gap-1.5">
                <ParamTag v-for="param in sessionParams" :key="param.key" :param="param" source-type="session" />
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>

      <!-- 无参数时的提示 -->
      <!--
 <div v-else class="text-xs c-gray-5">
        入口节点,接收用户输入并启动工作流。<br>
        在 APP_INFO 节点中定义参数后,将在此处显示。
      </div> 
-->
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 420px !important;
  max-width: 450px;
}
</style>
