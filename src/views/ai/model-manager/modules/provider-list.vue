<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchModelProviders } from '@/service/api/ai';
import SvgIcon from '@/components/custom/svg-icon.vue';

// 定义事件
const emit = defineEmits(['select']);

const providers = ref<Api.AI.ModelProvider[]>([]);
const loading = ref(false);
const activeId = ref<number | null>(null);
const activeTab = ref<'0' | '1' | '2'>('0'); // '0'=全部, '1'=公用, '2'=本地

// 根据当前 Tab 过滤供应商
const filteredProviders = computed(() => {
  if (activeTab.value === '0') return providers.value;
  return providers.value.filter(p => p.providerType === activeTab.value);
});

async function loadProviders() {
  loading.value = true;
  const { data } = await fetchModelProviders();
  if (data) {
    providers.value = data;
    // 默认选中全部模型(不选中特定供应商)
    if (!activeId.value) {
      handleSelect(null);
    }
  }
  loading.value = false;
}

function handleSelect(id: number | null) {
  activeId.value = id;
  // 计算要传递的 type
  let type: '1' | '2' | null = null;
  
  if (id) {
    // 如果选中了供应商，优先使用供应商的类型
    const provider = providers.value.find(p => p.providerId === id);
    if (provider) {
      type = provider.providerType as '1' | '2';
    }
  } else {
    // 如果没选中供应商，使用当前 Tab 的类型 (全部模型Tab对应null)
    type = activeTab.value === '0' ? null : (activeTab.value as '1' | '2');
  }
  
  emit('select', { id, type });
}

function handleTabChange(value: '0' | '1' | '2') {
  activeTab.value = value;
  // 切换Tab时，默认重置为不选中特定供应商
  handleSelect(null);
}

// 解析 models JSON 字符串为数组
function parseModels(modelsJson: string | undefined): string[] {
  if (!modelsJson) return [];
  try {
    return JSON.parse(modelsJson);
  } catch {
    return [];
  }
}

onMounted(() => {
  loadProviders();
});
</script>

<template>
  <NCard class="h-full rounded-md shadow-sm flex flex-col" content-style="padding: 0; flex: 1; min-height: 0; display: flex; flex-direction: column;">
    <template #header>
      <div class="px-2">
        <NTabs v-model:value="activeTab" type="segment" @update:value="handleTabChange" class="w-full">
          <NTab name="0" tab="全部">
            <template #default>
              <div class="flex items-center gap-2">
                <SvgIcon icon="carbon:grid" class="text-lg" />
                <span>全部</span>
              </div>
            </template>
          </NTab>
          <NTab name="1" tab="公用">
            <template #default>
              <div class="flex items-center gap-2">
                <SvgIcon icon="carbon:cloud" class="text-lg" />
                <span>公用</span>
              </div>
            </template>
          </NTab>
          <NTab name="2" tab="本地">
            <template #default>
              <div class="flex items-center gap-2">
                <SvgIcon icon="carbon:laptop" class="text-lg" />
                <span>本地</span>
              </div>
            </template>
          </NTab>
        </NTabs>
      </div>
    </template>

    <NSpin :show="loading" class="flex-1 h-full overflow-hidden" content-class="h-full">
      <NScrollbar class="h-full">
        <NEmpty v-if="filteredProviders.length === 0" description="暂无供应商" class="mt-20" />
        <NList v-else hoverable clickable>
          <NListItem
            v-for="item in filteredProviders"
            :key="item.providerId"
            :class="{ 'bg-primary/10!': activeId === item.providerId }"
            @click="handleSelect(item.providerId)"
          >
            <div class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-300">
              <img :src="item.iconUrl" class="w-6 h-6 object-contain" :alt="item.providerName" />
              <div class="flex-1 overflow-hidden">
                <div class="font-bold text-sm truncate">{{ item.providerName }}</div>
                <div class="text-xs text-gray-400 truncate uppercase tracking-wider">{{ item.providerKey }}</div>
              </div>
              <div v-if="activeId === item.providerId" class="text-primary text-base animate-fade-in text-lg">
                <SvgIcon icon="carbon:chevron-right" />
              </div>
            </div>
          </NListItem>
        </NList>
      </NScrollbar>
    </NSpin>
  </NCard>
</template>

<style scoped>
:deep(.n-list-item) {
  padding: 0 !important;
}

:deep(.n-card-header) {
  padding: 16px 16px 12px !important;
}
</style>
