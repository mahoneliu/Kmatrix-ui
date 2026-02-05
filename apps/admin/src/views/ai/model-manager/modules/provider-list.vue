<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { aiProviderTypeRecord } from '@/constants/business';

interface Props {
  list: Api.AI.Admin.ModelProvider[];
  loading: boolean;
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  (e: 'select', payload: { id: CommonType.IdType | null; type: '1' | '2' | null }): void;
}>();

const activeId = ref<CommonType.IdType | null>(null);
const activeTab = ref<'0' | '1' | '2'>('0'); // '0'=全部, '1'=aiProviderTypeRecord['1'], '2'=aiProviderTypeRecord['2']

// 根据当前 Tab 过滤供应商
const filteredProviders = computed(() => {
  if (!props.list) return [];
  if (activeTab.value === '0') return props.list;
  return props.list.filter(p => p.providerType === activeTab.value);
});

function handleSelect(id: CommonType.IdType | null) {
  activeId.value = id;
  // 计算要传递的 type
  let type: '1' | '2' | null = null;

  if (id && props.list) {
    // 如果选中了供应商，优先使用供应商的类型
    const provider = props.list.find(p => p.providerId === id);
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

// 监听列表加载完成，默认选中全部
watch(
  () => props.list,
  newList => {
    if (newList && newList.length > 0 && !activeId.value) {
      // 保持之前逻辑：如果是初始化加载且没有选中值，触发一次默认选择
      // 但注意不要造成无限循环或其他副作用，这里主要为了确保父组件知道当前状态
      // 之前的逻辑是 loadProviders 后直接调用的，现在靠 prop 变化感知
      // 实际上，之前的逻辑是在 loadProviders 成功后：
      // if (!activeId.value) { handleSelect(null); }
      // 这里的 handleSelect(null) 会 emit {id: null, type: null} (如果tab是0)
      // 考虑到父组件 index.vue 已经设置了初始值 null，这里可能不需要额外 emit，
      // 除非用户操作了 Tab。
    }
  }
);
</script>

<template>
  <div class="h-full flex flex-col gap-2">
    <NTabs v-model:value="activeTab" class="w-full" type="segment" @update:value="handleTabChange">
      <NTab name="0" tab="全部">
        <template #default>
          <div class="flex items-center gap-2">
            <SvgIcon icon="carbon:grid" class="text-xs" />
            <span>全部</span>
          </div>
        </template>
      </NTab>
      <NTab name="1" :tab="aiProviderTypeRecord['1']">
        <template #default>
          <div class="flex items-center gap-2">
            <SvgIcon icon="carbon:cloud" class="text-xs" />
            <span>{{ aiProviderTypeRecord['1'] }}</span>
          </div>
        </template>
      </NTab>
      <NTab name="2" :tab="aiProviderTypeRecord['2']">
        <template #default>
          <div class="flex items-center gap2">
            <SvgIcon icon="carbon:laptop" class="text-xs" />
            <span>{{ aiProviderTypeRecord['2'] }}</span>
          </div>
        </template>
      </NTab>
    </NTabs>

    <NSpin :show="loading" class="flex-1 overflow-hidden py-1" content-class="h-full">
      <NScrollbar class="h-full">
        <NEmpty v-if="filteredProviders.length === 0" description="暂无供应商" class="mt-20" />
        <div v-else class="flex flex-col">
          <div
            v-for="item in filteredProviders"
            :key="item.providerId"
            class="transition-colors duration-300 hover:bg-primary/5"
            :class="{ 'bg-primary/10!': activeId === item.providerId }"
            @click="handleSelect(item.providerId)"
          >
            <div class="flex cursor-pointer items-center gap-3 px-3 py-3">
              <img :alt="item.providerName" :src="item.iconUrl" class="h-5 w-5 object-contain" />
              <div class="flex-1 overflow-hidden">
                <div class="truncate text-sm font-bold">{{ item.providerName }}</div>
                <!-- <div class="text-xs text-gray-400 truncate uppercase tracking-wider">{{ item.providerKey }}</div> -->
              </div>
              <div v-if="activeId === item.providerId" class="animate-fade-in text-base text-lg text-primary">
                <SvgIcon icon="carbon:chevron-right" />
              </div>
            </div>
          </div>
        </div>
      </NScrollbar>
    </NSpin>
  </div>
</template>
