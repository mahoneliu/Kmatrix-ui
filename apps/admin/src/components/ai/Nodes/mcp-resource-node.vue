<script setup lang="ts">
/**
 * MCP资源读取节点
 * 从指定的 MCP Server 动态读取资源内容并注入工作流
 *
 * @author Mahone
 * @date 2026-04-22
 */
import { onMounted, reactive, ref, watch } from 'vue';
import { NCollapse, NCollapseItem, NSelect } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { fetchMcpServerList, fetchMcpServerResources } from '@/service/api/ai/mcp-server';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { $t } from '@/locales';
import BaseNode from './base-node.vue';

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();

// 下拉选项数据
const serverOptions = ref<{ label: string; value: number }[]>([]);
const resourceOptions = ref<{ label: string; value: string }[]>([]);
const loadingResources = ref(false);

// 局部表单数据
const formModel = reactive({
  serverId: null as number | null,
  uri: ''
});

// 初始化数据
function initData() {
  const config = props.data.config as any | undefined;
  if (config) {
    formModel.serverId = config.serverId || null;
    formModel.uri = config.uri || '';

    if (formModel.serverId) {
      loadResources(formModel.serverId);
    }
  }
}

// 加载 MCP Server 列表
async function loadServers() {
  try {
    const res = await fetchMcpServerList({ status: '0' });
    if (res.data) {
      serverOptions.value = res.data.map(server => ({
        label: server.serverName,
        value: server.serverId
      }));
    }
  } catch {
    // console.error('加载 MCP Server 列表失败', error);
  }
}

// 加载指定 Server 的资源列表
async function loadResources(serverId: number) {
  if (!serverId) {
    resourceOptions.value = [];
    return;
  }

  loadingResources.value = true;
  try {
    const res = await fetchMcpServerResources(serverId);
    if (res.data && Array.isArray(res.data)) {
      resourceOptions.value = res.data.map(resource => ({
        // 假设 MCP Resource 有 name/description 和 uri 属性
        label: resource.name || resource.uri,
        value: resource.uri
      }));
    } else {
      resourceOptions.value = [];
    }
  } catch {
    resourceOptions.value = [];
    // console.error('加载 MCP Server 资源失败', error);
  } finally {
    loadingResources.value = false;
  }
}

// 监听局部表单变化，同步到 Store
watch(
  formModel,
  newValue => {
    const currentConfig = props.data.config as any | undefined;
    if (newValue.serverId !== currentConfig?.serverId || newValue.uri !== currentConfig?.uri) {
      workflowStore.updateNodeConfig(props.id, { ...newValue });
    }
  },
  { deep: true }
);

// 监听外部配置变化
watch(
  () => props.data.config,
  newConfig => {
    const config = newConfig as any | undefined;
    if (config) {
      if (config.serverId !== formModel.serverId || config.uri !== formModel.uri) {
        const oldServerId = formModel.serverId;
        formModel.serverId = config.serverId || null;
        formModel.uri = config.uri || '';

        if (formModel.serverId && formModel.serverId !== oldServerId) {
          loadResources(formModel.serverId);
        }
      }
    }
  },
  { deep: true }
);

// 监听 serverId 变化，重置 uri 并加载新的资源
function handleServerChange(serverId: number | null) {
  formModel.uri = '';
  if (serverId) {
    loadResources(serverId);
  } else {
    resourceOptions.value = [];
  }
}

onMounted(() => {
  initData();
  loadServers();
});
</script>

<template>
  <BaseNode v-bind="props" :data="data" class="mcp-resource-node">
    <div class="w-85">
      <NCollapse :default-expanded-names="['config']">
        <template #arrow>
          <SvgIcon local-icon="mdi-play" class="workflow-collapse-icon" />
        </template>
        <!-- 基础配置 -->
        <NCollapseItem :title="$t('ai.workflow_template.base_config')" name="config">
          <div class="workflow-config-section">
            <div class="workflow-config-item">
              <label class="workflow-label">
                MCP Server
                <span class="workflow-label-required">*</span>
              </label>
              <NSelect
                v-model:value="formModel.serverId"
                :options="serverOptions"
                placeholder="请选择 MCP Server"
                size="small"
                filterable
                @update:value="handleServerChange"
              />
            </div>

            <div class="mt-3 workflow-config-item">
              <label class="workflow-label">
                资源 URI
                <span class="workflow-label-required">*</span>
              </label>
              <NSelect
                v-model:value="formModel.uri"
                :options="resourceOptions"
                :loading="loadingResources"
                placeholder="请选择资源或手动输入"
                size="small"
                filterable
                tag
              />
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </div>
  </BaseNode>
</template>

<style scoped>
:deep(.workflow-node) {
  min-width: 380px !important;
}
</style>
