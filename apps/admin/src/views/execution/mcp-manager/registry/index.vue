<script setup lang="ts">
/**
 * MCP 注册源集成主页面
 * 包含：注册源浏览（搜索/导入）+ 手工添加 + 注册源配置管理
 * @author Mahone
 */
import { ref } from 'vue';
import { NButton, NCard, NSpace, NTab, NTabs } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { $t } from '@/locales';
import McpRegistryBrowser from './McpRegistryBrowser.vue';
import McpManualAddDialog from './McpManualAddDialog.vue';
import McpRegistrySourceConfig from './McpRegistrySourceConfig.vue';

const activeTab = ref('browser');
const showManualAdd = ref(false);
const browserRef = ref<InstanceType<typeof McpRegistryBrowser> | null>(null);

function handleManualAddSuccess() {
  showManualAdd.value = false;
}
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <template #header>
        <span>{{ $t('ai.mcp.registry') }}</span>
      </template>
      <template #header-extra>
        <NSpace>
          <NButton size="small" type="primary" @click="showManualAdd = true">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
            {{ $t('ai.mcp.manualAdd.title') }}
          </NButton>
        </NSpace>
      </template>

      <NTabs v-model:value="activeTab" type="line" animated>
        <NTab name="browser" :tab="$t('ai.mcp.registryBrowser.title')">
          <div class="pt-4">
            <McpRegistryBrowser ref="browserRef" />
          </div>
        </NTab>
        <NTab name="config" :tab="$t('ai.mcp.registryConfig.title')">
          <div class="pt-4">
            <McpRegistrySourceConfig />
          </div>
        </NTab>
      </NTabs>
    </NCard>

    <!-- 手工添加对话框 -->
    <McpManualAddDialog v-model:show="showManualAdd" @success="handleManualAddSuccess" />
  </div>
</template>
