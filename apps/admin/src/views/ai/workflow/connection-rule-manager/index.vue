<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchConnectionMode, switchConnectionMode } from '@/service/api/ai/connection-rule';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import MatrixView from './components/MatrixView.vue';
import ListView from './components/ListView.vue';

defineOptions({ name: 'ConnectionRuleManager' });

const activeTab = ref<'matrix' | 'list'>('matrix');
const matrixViewRef = ref<InstanceType<typeof MatrixView> | null>(null);

// 当前连接模式
const connectionMode = ref<Api.AI.ConnectionRule.ConnectionMode | null>(null);
const switchingMode = ref(false);

const nodeDefinitionStore = useNodeDefinitionStore();

async function loadConnectionMode() {
  const { data } = await fetchConnectionMode();
  if (data) connectionMode.value = data;
}

async function handleSwitchMode() {
  if (!connectionMode.value) return;
  const newMode = connectionMode.value.mode === 'whitelist' ? 'blacklist' : 'whitelist';
  const oldMode = { ...connectionMode.value };

  switchingMode.value = true;
  try {
    const { error } = await switchConnectionMode(newMode);
    if (error) {
      connectionMode.value = oldMode;
      window.$message?.error('模式切换失败，请重试');
    } else {
      await loadConnectionMode();
      await nodeDefinitionStore.reloadConnectionRules();
      matrixViewRef.value?.reload();
      window.$message?.success(`已切换为${connectionMode.value!.modeLabel}模式`);
    }
  } finally {
    switchingMode.value = false;
  }
}

onMounted(() => {
  loadConnectionMode();
});
</script>

<template>
  <div class="h-full flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 顶部模式栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NSpace align="center" justify="space-between">
        <NSpace align="center">
          <span class="text-sm text-gray-600">当前连接模式：</span>
          <NTag v-if="connectionMode" :type="connectionMode.mode === 'whitelist' ? 'success' : 'warning'" size="medium">
            {{ connectionMode.modeLabel }}
          </NTag>
          <NSkeleton v-else text :width="80" />
          <span v-if="connectionMode" class="text-xs text-gray-400">{{ connectionMode.description }}</span>
        </NSpace>
        <NButton size="small" :loading="switchingMode" @click="handleSwitchMode">
          切换为{{ connectionMode?.mode === 'whitelist' ? '黑名单' : '白名单' }}模式
        </NButton>
      </NSpace>
    </NCard>

    <!-- Tab 切换 -->
    <NTabs
      v-model:value="activeTab"
      type="line"
      animated
      class="flex-1-hidden"
      content-class="flex-1-hidden"
      pane-class="flex-1-hidden"
      content-style="height: 100%;"
      pane-style="height: 100%;"
    >
      <NTabPane name="matrix" tab="矩阵视图" display-directive="show" class="flex-col-area h-full">
        <MatrixView v-if="connectionMode" ref="matrixViewRef" :mode="connectionMode.mode" class="h-full" />
      </NTabPane>
      <NTabPane name="list" tab="列表视图" display-directive="show" class="flex-col-area h-full">
        <ListView class="h-full" />
      </NTabPane>
    </NTabs>
  </div>
</template>
