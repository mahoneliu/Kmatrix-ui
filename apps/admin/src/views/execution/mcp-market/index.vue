<script setup lang="ts">
/**
 * MCP 市场页面
 * @author Mahone
 * @date 2026-03-15
 */
import { computed, onMounted, ref } from 'vue';
import { NButton, NCard, NDrawer, NDrawerContent, NEmpty, NInput, NSpin, NTag, NTooltip, useMessage } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchMcpMarketList } from '@/service/api/ai/mcp-market';
import McpImportWizard from './components/mcp-import-wizard.vue';

const message = useMessage();

// ============ 数据 ============

const allItems = ref<Api.Ai.McpMarketItemVo[]>([]);
const loading = ref(false);

// ============ 搜索 & 分类 ============

const searchKeyword = ref('');
const activeCategory = ref('全部');

const categories = ['全部', '搜索与信息检索', '代码与开发', '文件与存储', '数据库', '通信与协作', 'AI 与模型', '其他'];

const filteredItems = computed(() => {
  let list = allItems.value;

  if (activeCategory.value !== '全部') {
    list = list.filter(item => item.category === activeCategory.value);
  }

  const kw = searchKeyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(item => item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw));
  }

  return list;
});

// ============ 详情抽屉 ============

const showDetail = ref(false);
const detailItem = ref<Api.Ai.McpMarketItemVo | null>(null);

function openDetail(item: Api.Ai.McpMarketItemVo) {
  detailItem.value = item;
  showDetail.value = true;
}

// ============ 导入向导 ============

const showImportWizard = ref(false);
const importItem = ref<Api.Ai.McpMarketItemVo | null>(null);

function handleImport(item: Api.Ai.McpMarketItemVo) {
  importItem.value = item;
  showImportWizard.value = true;
}

function handleImportSuccess() {
  showImportWizard.value = false;
  // 刷新列表（可选）
  loadList();
}

// ============ 传输类型标签 ============

const transportTypeMap: Record<string, { label: string; type: 'success' | 'info' }> = {
  sse: { label: 'SSE', type: 'success' },
  streamable_http: { label: 'HTTP', type: 'info' }
};

function getTransportTag(type: string) {
  return transportTypeMap[type] ?? { label: type, type: 'info' as const };
}

// ============ 加载数据 ============

async function loadList() {
  loading.value = true;
  try {
    const res = await fetchMcpMarketList();
    allItems.value = (res as any)?.data ?? res ?? [];
  } catch {
    message.error('获取 MCP 市场数据失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadList());
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <!-- 顶部搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <div class="flex items-center gap-3">
        <NInput v-model:value="searchKeyword" clearable placeholder="搜索 MCP 服务名称或描述..." class="max-w-80">
          <template #prefix>
            <SvgIcon icon="mdi:magnify" class="text-gray-400" />
          </template>
        </NInput>
        <span class="text-sm text-gray-500">共 {{ filteredItems.length }} 个服务</span>
      </div>
    </NCard>

    <!-- 分类标签栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <div class="flex flex-wrap gap-2">
        <NTag
          v-for="cat in categories"
          :key="cat"
          :type="activeCategory === cat ? 'primary' : 'default'"
          :bordered="activeCategory !== cat"
          class="cursor-pointer select-none"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </NTag>
      </div>
    </NCard>

    <!-- 卡片网格列表 -->
    <div class="flex-1 overflow-auto">
      <NSpin :show="loading">
        <NEmpty v-if="!loading && filteredItems.length === 0" description="暂无匹配的 MCP 服务" class="mt-16" />

        <div v-else class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
          <NCard
            v-for="item in filteredItems"
            :key="item.id"
            :bordered="true"
            size="small"
            class="card-wrapper transition-shadow hover:shadow-md"
            content-class="flex flex-col gap-3"
          >
            <!-- 卡片头部：图标 + 名称 + 传输类型 -->
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <SvgIcon :icon="item.icon" class="text-xl text-primary" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="truncate text-base font-medium">{{ item.name }}</span>
                  <NTag :type="getTransportTag(item.transportType).type" size="small" :bordered="false">
                    {{ getTransportTag(item.transportType).label }}
                  </NTag>
                </div>
                <NTag type="default" size="small" class="mt-1">{{ item.category }}</NTag>
              </div>
            </div>

            <!-- 描述 -->
            <NTooltip trigger="hover" :delay="500">
              <template #trigger>
                <p class="line-clamp-2 text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
              </template>
              {{ item.description }}
            </NTooltip>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-1">
              <NButton size="small" class="flex-1" @click="openDetail(item)">
                <template #icon>
                  <SvgIcon icon="mdi:information-outline" />
                </template>
                查看详情
              </NButton>
              <NButton size="small" type="primary" class="flex-1" @click="handleImport(item)">
                <template #icon>
                  <SvgIcon icon="mdi:download-outline" />
                </template>
                导入
              </NButton>
            </div>
          </NCard>
        </div>
      </NSpin>
    </div>

    <!-- 导入向导 -->
    <McpImportWizard v-model:show="showImportWizard" :item="importItem" @success="handleImportSuccess" />

    <!-- 详情抽屉 -->
    <NDrawer v-model:show="showDetail" :width="480" placement="right">
      <NDrawerContent v-if="detailItem" :title="detailItem.name" closable>
        <div class="flex flex-col gap-5">
          <!-- 基本信息 -->
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 flex flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <SvgIcon :icon="detailItem.icon" class="text-2xl text-primary" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <NTag :type="getTransportTag(detailItem.transportType).type" size="small">
                  {{ getTransportTag(detailItem.transportType).label }}
                </NTag>
                <NTag type="default" size="small">{{ detailItem.category }}</NTag>
              </div>
            </div>
          </div>

          <!-- 完整描述 -->
          <div>
            <p class="mb-2 text-sm text-gray-700 font-medium">服务描述</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detailItem.description }}</p>
          </div>

          <!-- 参数说明 -->
          <div v-if="detailItem.params && detailItem.params.length > 0">
            <p class="mb-3 text-sm text-gray-700 font-medium">配置参数</p>
            <div class="flex flex-col gap-3">
              <div
                v-for="param in detailItem.params"
                :key="param.key"
                class="border border-gray-100 rounded-lg bg-gray-50 p-3"
              >
                <div class="mb-1 flex items-center gap-2">
                  <code class="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary font-mono">
                    {{ param.key }}
                  </code>
                  <span class="text-sm font-medium">{{ param.label }}</span>
                  <NTag v-if="param.required" type="error" size="small" :bordered="false">必填</NTag>
                  <NTag v-else type="default" size="small" :bordered="false">可选</NTag>
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">{{ param.description }}</p>
              </div>
            </div>
          </div>

          <!-- 配置示例 -->
          <div v-if="detailItem.configExample">
            <p class="mb-2 text-sm text-gray-700 font-medium">配置示例</p>
            <div class="rounded-lg bg-gray-50 p-3">
              <p class="text-sm text-gray-600 leading-relaxed">{{ detailItem.configExample }}</p>
            </div>
          </div>

          <!-- 配置模板 -->
          <div v-if="detailItem.configTemplate">
            <p class="mb-2 text-sm text-gray-700 font-medium">配置模板</p>
            <pre
              class="overflow-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-3 text-xs text-gray-100 leading-relaxed"
              >{{ detailItem.configTemplate }}</pre
            >
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <NButton @click="showDetail = false">关闭</NButton>
            <NButton type="primary" @click="handleImport(detailItem!)">
              <template #icon>
                <SvgIcon icon="mdi:download-outline" />
              </template>
              导入此服务
            </NButton>
          </div>
        </template>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
