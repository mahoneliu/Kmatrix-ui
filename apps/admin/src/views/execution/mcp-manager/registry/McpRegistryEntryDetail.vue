<script setup lang="ts">
/**
 * MCP 注册源条目详情抽屉
 * @author Mahone
 */
import { computed } from 'vue';
import { NButton, NDescriptions, NDescriptionsItem, NDrawer, NDrawerContent, NSpace, NTag } from 'naive-ui';
import { $t } from '@/locales';

const props = defineProps<{
  show: boolean;
  entry: Api.Ai.McpRegistryEntryVo;
}>();

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
  (e: 'import', entry: Api.Ai.McpRegistryEntryVo): void;
}>();

const show = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
});

function handleImport() {
  emit('import', props.entry);
  show.value = false;
}
</script>

<template>
  <NDrawer v-model:show="show" :width="480" placement="right">
    <NDrawerContent :title="entry.displayName || entry.entryName" closable>
      <NDescriptions :column="1" label-placement="left" bordered>
        <NDescriptionsItem :label="$t('ai.mcp.registryBrowser.platform')">
          <NTag :type="entry.sourcePlatform === 'official' ? 'info' : 'success'" size="small">
            {{ entry.sourcePlatform === 'official' ? $t('ai.mcp.registryBrowser.filterOfficial') : 'Smithery' }}
          </NTag>
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.author" :label="$t('ai.mcp.registryBrowser.author')">
          {{ entry.author }}
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.version" :label="$t('ai.mcp.registryBrowser.version')">
          {{ entry.version }}
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.transportType" :label="$t('ai.mcp.transportType')">
          <NTag size="small">{{ entry.transportType.toUpperCase() }}</NTag>
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.endpointUrl" :label="$t('ai.mcp.registryBrowser.endpoint')">
          <span class="break-all text-xs font-mono">{{ entry.endpointUrl }}</span>
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.command" :label="$t('ai.mcp.registryBrowser.command')">
          <span class="break-all text-xs font-mono">{{ entry.command }}</span>
        </NDescriptionsItem>

        <NDescriptionsItem :label="$t('ai.mcp.registryBrowser.dnsVerified')">
          <NTag :type="entry.dnsVerified ? 'success' : 'default'" size="small">
            {{ entry.dnsVerified ? $t('common.yesOrNo.yes') : $t('common.yesOrNo.no') }}
          </NTag>
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.rating != null" :label="$t('ai.mcp.registryBrowser.rating')">
          {{ entry.rating }}
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.useCount != null" :label="$t('ai.mcp.registryBrowser.useCount')">
          {{ entry.useCount.toLocaleString() }}
        </NDescriptionsItem>

        <NDescriptionsItem v-if="entry.description" :label="$t('ai.mcp.description')">
          <span class="whitespace-pre-wrap">{{ entry.description }}</span>
        </NDescriptionsItem>
      </NDescriptions>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="show = false">{{ $t('common.close') }}</NButton>
          <NButton v-if="!entry.isImported" type="primary" @click="handleImport">
            {{ $t('ai.mcp.registryBrowser.importBtn') }}
          </NButton>
          <NTag v-else type="success">{{ $t('ai.mcp.registryBrowser.imported') }}</NTag>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
