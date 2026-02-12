<script lang="ts" setup>
import { computed, h, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NCollapseTransition,
  NDropdown,
  NGrid,
  NGridItem,
  NInput,
  NInputGroup,
  NModal,
  NSelect,
  NSwitch,
  NTooltip,
  useDialog,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { copyToClipboard } from '@km/shared';
import { fetchAppDetail, fetchAppStatistics, publishApp, updateApp, updatePublicAccess } from '@/service/api/ai/app';
import { fetchAppTokenList, refreshAppToken } from '@/service/api/ai/app-token';
import { useEcharts } from '@/hooks/common/echarts';
import { validateGraph } from '@/utils/ai/dsl-converter';
import { formatValidationErrors, validateWorkflow } from '@/utils/ai/validation';
import AppOperateModal from '@/views/ai/app-manager/modules/app-operate-modal.vue';
import DebugChatDialog from '@/components/ai/chat/debug-chat-dialog.vue';
import SystemTemplateConfigPanel from './modules/system-template-config-panel.vue';

// const SvgIcon = resolveComponent('SvgIcon');

const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const appId = ref<string>(route.query.appId as string);
const appInfo = ref<Api.AI.Admin.App | null>(null);
const tokenList = ref<any[]>([]);
const loading = ref(false);
const showConfigPanel = ref(true);

// 调试对话窗口
const showDebugDialog = ref(false);

// 是否已发布
const isPublished = computed(() => appInfo.value?.status === '1');

// 是否系统模板应用 (sourceTemplateScope === '0')
const isSystemTemplateApp = computed(() => appInfo.value?.sourceTemplateScope === '0');

// 公开访问开关 (computed getter/setter 绑定后端数据)
const publicAccessEnabled = computed({
  get: () => appInfo.value?.publicAccess === '1',
  set: async (val: boolean) => {
    if (!appInfo.value?.appId) return;
    try {
      await updatePublicAccess(appInfo.value.appId, val ? '1' : '0');
      appInfo.value.publicAccess = val ? '1' : '0';
      message.success(val ? '已开启公开访问' : '已关闭公开访问');
    } catch {
      message.error('更新失败');
    }
  }
});

// 监控统计时间范围
const statsPeriod = ref('7d');
const statsPeriodOptions = [
  { label: '过去7天', value: '7d' },
  { label: '过去30天', value: '30d' },
  { label: '过去90天', value: '90d' }
];

// 统计数据
const statsData = ref<Api.AI.Admin.AppStatistics>({
  userCount: 0,
  userCountDelta: 0,
  questionCount: 0,
  tokensTotal: 0,
  satisfaction: { like: 0, dislike: 0 },
  userTrend: {},
  questionTrend: {}
});

// 图表 DOM
const userChartRef = ref<HTMLElement | null>(null);
const questionChartRef = ref<HTMLElement | null>(null);

// 初始化 ECharts
const { domRef: userDom, updateOptions: updateUserChart } = useEcharts(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] as string[] },
  yAxis: { type: 'value' },
  series: [{ name: '用户数', type: 'line', smooth: true, areaStyle: {}, data: [] as number[] }]
}));

const { domRef: questionDom, updateOptions: updateQuestionChart } = useEcharts(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] as string[] },
  yAxis: { type: 'value' },
  series: [{ name: '提问数', type: 'line', smooth: true, areaStyle: {}, color: '#f97316', data: [] as number[] }]
}));

// 加载统计数据
async function loadStats() {
  try {
    const { data } = await fetchAppStatistics(appId.value, statsPeriod.value);
    if (data) {
      statsData.value = data;
      // 更新图表
      const dates = Object.keys(data.userTrend).sort();
      const userValues = dates.map(d => data.userTrend[d]);
      const questionValues = dates.map(d => data.questionTrend[d]);

      updateUserChart(opts => {
        opts.xAxis.data = dates;
        opts.series[0].data = userValues;
        return opts;
      });

      updateQuestionChart(opts => {
        opts.xAxis.data = dates;
        opts.series[0].data = questionValues;
        return opts;
      });
    }
  } catch {
    // ignore
  }
}

// 监听周期变化
watch(statsPeriod, () => {
  loadStats();
});

// 计算公开访问链接
const publicAccessUrl = computed(() => {
  if (!appInfo.value) return '';
  const token = tokenList.value.find(t => t.status === '1');
  if (!token) return '';
  return `${window.location.origin}/chat/${token.token}`;
});

// 获取应用信息
async function loadAppInfo() {
  loading.value = true;
  try {
    const { data } = await fetchAppDetail(appId.value);
    if (data) {
      appInfo.value = data;
    }
  } catch {
    message.error('加载应用信息失败');
  } finally {
    loading.value = false;
  }
}

// 获取Token列表
async function loadTokenList() {
  try {
    const { data } = await fetchAppTokenList(appId.value);
    if (data) {
      tokenList.value = data;
    }
  } catch {
    // ignore
  }
}

// 刷新Token
async function handleRefreshToken(tokenId: string) {
  try {
    await refreshAppToken(tokenId);
    message.success('Token已刷新');
    await loadTokenList();
  } catch {
    message.error('刷新Token失败');
  }
}

// 复制到剪贴板
// 复制到剪贴板
// 复制到剪贴板
// 使用 shared 库中的 copyToClipboard，无需在此重复定义

// 跳转去对话
function handleGoToChat() {
  router.push({ name: 'ai_chat', query: { appId: appId.value } });
}

// 跳转工作流设置
function handleSettings() {
  if (!appInfo.value || appInfo.value.appType !== '2') return;
  router.push({
    name: 'ai_workflow',
    query: { appId: appId.value }
  });
}

// 发布应用 - 复用 useWorkflowPersistence 的校验逻辑
async function handlePublish() {
  if (!appInfo.value) return;

  // 系统模版应用：只校验配置面板参数，跳过工作流校验
  if (isSystemTemplateApp.value) {
    // 校验大模型
    if (!appInfo.value.modelId) {
      message.warning('请先选择大模型');
      return;
    }
    // 发布确认
    dialog.create({
      title: '发布应用',
      content: '确认发布该应用？发布后可通过对话入口访问。',
      positiveText: '确认发布',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await publishApp(appId.value, '从APP详情页发布');
          message.success('发布成功');
          await loadAppInfo();
        } catch (error: any) {
          const errorMsg = error?.response?.data?.msg || error?.message || '发布失败';
          message.error(errorMsg);
        }
      }
    });
    return;
  }

  // 非系统模版应用：走工作流校验逻辑
  // 1. 解析 graphData
  let graphData;
  try {
    if (appInfo.value.graphData) {
      graphData = JSON.parse(appInfo.value.graphData);
    }
  } catch {
    // parse error
  }

  // 没有 graphData
  if (!graphData) {
    dialog.warning({
      title: '工作流未完善',
      content: '应用尚未配置工作流，是否现在配置？',
      positiveText: '去配置',
      negativeText: '取消',
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 2. 准备工作流节点（过滤 APP_INFO 节点）
  const workflowNodes = graphData.nodes
    .filter((n: any) => n.data?.nodeType !== 'APP_INFO')
    .map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data }
    }));

  // 3. 校验图结构
  const graphValidation = validateGraph(graphData);
  if (!graphValidation.valid) {
    dialog.warning({
      title: '工作流未完善',
      content: `${graphValidation.errors.join(', ')}。是否现在配置工作流？`,
      positiveText: '去配置',
      negativeText: '取消',
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 4. 校验节点参数绑定
  const paramValidation = validateWorkflow(workflowNodes);
  if (!paramValidation.valid) {
    const errorMessage = formatValidationErrors(paramValidation);
    dialog.warning({
      title: '工作流未完善',
      content: `${errorMessage}。是否现在配置工作流？`,
      positiveText: '去配置',
      negativeText: '取消',
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 5. 校验应用基础配置（modelId）
  if (!appInfo.value.modelId) {
    dialog.warning({
      title: '工作流未完善',
      content: '缺少必填配置: 推理模型。是否现在配置工作流？',
      positiveText: '去配置',
      negativeText: '取消',
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 6. 发布确认
  dialog.create({
    title: '发布应用',
    content: '确认发布该应用？发布后可通过对话入口访问。',
    positiveText: '确认发布',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await publishApp(appId.value, '从APP详情页发布');
        message.success('发布成功');
        await loadAppInfo();
      } catch (error: any) {
        const errorMsg = error?.response?.data?.msg || error?.message || '发布失败';
        message.error(errorMsg);
      }
    }
  });
}

// 调试应用
function handleDebug() {
  if (!appInfo.value) return;
  showDebugDialog.value = true;
}

// 嵌入第三方弹窗
const showEmbedModal = ref(false);

// 嵌入代码 - 全屏模式
const embedFullscreenCode = computed(() => {
  if (!tokenList.value.length) return '';
  const token = tokenList.value.find(t => t.status === '1') || tokenList.value[0];
  if (!token?.token) return '';
  const chatAppUrl = import.meta.env.VITE_CHAT_APP_URL || `${window.location.origin}/chat`;
  return `<iframe
  src="${chatAppUrl}/?appToken=${token.token}&appId=${appId.value}"
  style="width: 100%; height: 100%;"
  frameborder="0"
  allow="microphone">
</iframe>`;
});

// 嵌入代码 - 移动端模式
const embedMobileCode = computed(() => {
  if (!tokenList.value.length) return '';
  const token = tokenList.value.find(t => t.status === '1') || tokenList.value[0];
  if (!token?.token) return '';
  const chatAppUrl = import.meta.env.VITE_CHAT_APP_URL || `${window.location.origin}/chat`;
  return `<iframe
  src="${chatAppUrl}/?appToken=${token.token}&appId=${appId.value}&mode=mobile"
  style="width: 100%; height: 100%;"
  frameborder="0"
  allow="microphone">
</iframe>`;
});

// 嵌入代码 - 浮窗模式
const embedFloatCode = computed(() => {
  if (!tokenList.value.length) return '';
  const token = tokenList.value.find(t => t.status === '1') || tokenList.value[0];
  if (!token?.token) return '';
  const chatAppUrl = import.meta.env.VITE_CHAT_APP_URL || `${window.location.origin}/chat`;
  const scriptEnd = '<' + '/script>'; // eslint-disable-line no-useless-concat
  return `<script
  async
  defer
  src="${chatAppUrl}/loader.js?appToken=${token.token}&appId=${appId.value}">
${scriptEnd}`;
});

// 运行菜单选项
const runOptions = computed(() => {
  return [
    {
      label: '去对话',
      key: 'chat',
      icon: () => h(SvgIcon, { localIcon: 'carbon-chat' })
    },
    {
      label: '嵌入第三方',
      key: 'embed',
      icon: () => h(SvgIcon, { localIcon: 'mdi-code-tags' })
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      label: appInfo.value?.enableExecutionDetail === '1' ? '禁用执行详情' : '启用执行详情',
      key: 'enableExecutionDetail',
      icon: () =>
        appInfo.value?.enableExecutionDetail === '1'
          ? h(SvgIcon, { localIcon: 'mdi-bug-check-outline', class: 'text-primary' })
          : h(SvgIcon, { localIcon: 'mdi-close-circle-outline', class: 'text-gray-500' })
    }
  ];
});

async function handleRunSelect(key: string) {
  if (key === 'chat') {
    handleGoToChat();
  } else if (key === 'embed') {
    handleShowEmbedModal();
  } else if (key === 'enableExecutionDetail') {
    if (!appInfo.value) return;
    const newValue = appInfo.value.enableExecutionDetail === '1' ? '0' : '1';
    try {
      await updateApp({
        appId: appId.value,
        appName: appInfo.value.appName,
        enableExecutionDetail: newValue
      });
      appInfo.value.enableExecutionDetail = newValue;
      message.success(newValue === '1' ? '已启用执行详情' : '已禁用执行详情');
    } catch {
      message.error('设置失败');
    }
  }
}

function handleShowEmbedModal() {
  showEmbedModal.value = true;
}

const modalVisible = ref(false);
const appType = computed(() => (appInfo.value?.appType as '1' | '2') || '1');

function onModalClose(_id?: any, _type?: any) {
  modalVisible.value = false;
  loadAppInfo();
}

onMounted(async () => {
  await loadAppInfo();
  await loadTokenList();
  // chart refs binding
  userDom.value = userChartRef.value;
  questionDom.value = questionChartRef.value;
  await loadStats();
});
</script>

<template>
  <div class="h-full flex flex-col overflow-auto p-4">
    <!-- 应用信息卡片 -->
    <NCard class="mb-4" size="small">
      <div class="flex gap-8">
        <div class="min-w-0 flex-1">
          <div class="mb-3 flex items-center justify-start gap-3">
            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-xl text-primary">
              <SvgIcon local-icon="carbon-application" />
            </div>
            <div class="min-w-0 flex-1 truncate text-base font-bold">{{ appInfo?.appName }}</div>
            <div class="ml-auto">
              <NTag :type="isPublished ? 'success' : 'error'">{{ isPublished ? '已发布' : '未发布' }}</NTag>
            </div>
          </div>

          <div v-if="isPublished && publicAccessEnabled" class="mt-2 flex items-center gap-2">
            <NInputGroup>
              <NInput :value="publicAccessUrl" readonly size="small" placeholder="" class="w-80" />
              <NButton size="small" @click="copyToClipboard(publicAccessUrl, '链接')">
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" />
                </template>
              </NButton>
            </NInputGroup>
            <NTooltip>
              <template #trigger>
                <NButton type="primary" size="small" @click="handleRefreshToken(tokenList[0]?.tokenId)">刷新</NButton>
              </template>
              重新生成访问链接，会导致已经嵌入第三方的对话框无法使用，需要重新嵌入新的脚本。
            </NTooltip>
          </div>
          <!-- 操作按钮组 -->
          <div class="mt-4 flex gap-2">
            <!-- 系统模版应用配置按钮（放在最左边） -->
            <NButton v-if="isSystemTemplateApp" size="small" @click="showConfigPanel = !showConfigPanel">
              <template #icon>
                <SvgIcon :icon="showConfigPanel ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
              </template>
              应用配置
            </NButton>

            <NButton v-else size="small" @click="handleSettings">
              <template #icon>
                <SvgIcon local-icon="mdi-settings" />
              </template>
              流程设置
            </NButton>

            <!-- 已发布时显示运行下拉菜单 -->
            <template v-if="isPublished">
              <NDropdown trigger="hover" :options="runOptions" @select="handleRunSelect">
                <NButton size="small">
                  <template #icon>
                    <SvgIcon local-icon="mdi-play" />
                  </template>
                  运行
                </NButton>
              </NDropdown>
            </template>

            <!-- 调试按钮 -->
            <NButton v-if="appInfo?.appType === '1'" size="small" @click="handleDebug">
              <template #icon>
                <SvgIcon local-icon="mdi-bug-outline" />
              </template>
              调试
            </NButton>

            <!-- 显示发布按钮 -->
            <NButton type="primary" size="small" @click="handlePublish">
              <template #icon>
                <SvgIcon local-icon="mdi-rocket-launch" />
              </template>
              发布应用
            </NButton>

            <div v-if="isPublished">
              <NSwitch
                v-model:value="publicAccessEnabled"
                class="rounded-none pt-1"
                title="开启公开访问则无需鉴权即可匿名访问，否则需要鉴权"
                size="large"
              >
                <template #checked>公开访问</template>
                <template #unchecked>公开访问</template>
              </NSwitch>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统模版应用配置面板 -->
      <div v-if="isSystemTemplateApp" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
        <NCollapseTransition :show="showConfigPanel">
          <SystemTemplateConfigPanel
            v-if="appInfo"
            :app-id="appId"
            :app-name="appInfo.appName"
            :model-id="appInfo.modelId"
            :knowledge-ids="appInfo.knowledgeIds"
            :model-setting="appInfo.modelSetting"
            :graph-data="appInfo.graphData"
            @update="loadAppInfo"
          />
        </NCollapseTransition>
      </div>
    </NCard>

    <!-- 监控统计卡片 -->
    <NCard size="small">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <div class="h-1 w-1 rounded-full bg-primary" />
            <span class="text-sm font-medium">监控统计</span>
          </div>
          <NSelect v-model:value="statsPeriod" :options="statsPeriodOptions" size="small" class="w-28" />
        </div>
      </template>

      <!-- 统计数字 -->
      <NGrid :cols="4" :x-gap="16" class="mb-6">
        <NGridItem>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div class="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
              <SvgIcon local-icon="mdi-account-group" class="text-xl" />
            </div>
            <div>
              <div class="text-xs text-gray-500">用户总数</div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-bold">{{ statsData.userCount }}</span>
                <span v-if="statsData.userCountDelta > 0" class="text-xs text-success">
                  +{{ statsData.userCountDelta }}
                </span>
              </div>
            </div>
          </div>
        </NGridItem>
        <NGridItem>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div class="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <SvgIcon local-icon="mdi-message-text" class="text-xl" />
            </div>
            <div>
              <div class="text-xs text-gray-500">提问次数</div>
              <span class="text-xl font-bold">{{ statsData.questionCount }}</span>
            </div>
          </div>
        </NGridItem>
        <NGridItem>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div class="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-500">
              <SvgIcon local-icon="mdi-key-variant" class="text-xl" />
            </div>
            <div>
              <div class="text-xs text-gray-500">Tokens 总数</div>
              <span class="text-xl font-bold">{{ statsData.tokensTotal }}</span>
            </div>
          </div>
        </NGridItem>
        <NGridItem>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div class="h-10 w-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-500">
              <SvgIcon local-icon="mdi-emoticon-happy" class="text-xl" />
            </div>
            <div>
              <div class="text-xs text-gray-500">用户满意度</div>
              <div class="flex items-center gap-2">
                <span class="text-success">👍 {{ statsData.satisfaction.like }}</span>
                <span class="text-error">👎 {{ statsData.satisfaction.dislike }}</span>
              </div>
            </div>
          </div>
        </NGridItem>
      </NGrid>

      <!-- 图表占位 -->
      <NGrid :cols="2" :x-gap="16">
        <NGridItem>
          <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
            <div class="mb-2 text-sm font-medium">用户总数</div>
            <div ref="userChartRef" class="h-48 w-full"></div>
          </div>
        </NGridItem>
        <NGridItem>
          <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
            <div class="mb-2 text-sm font-medium">提问次数</div>
            <div ref="questionChartRef" class="h-48 w-full"></div>
          </div>
        </NGridItem>
      </NGrid>
    </NCard>
    <AppOperateModal v-model:visible="modalVisible" :app-type="appType" @success="id => onModalClose(id, appType)" />
    <DebugChatDialog v-model:visible="showDebugDialog" :app-id="appId" :app-name="appInfo?.appName || ''" />

    <!-- 嵌入第三方弹窗 -->
    <NModal v-model:show="showEmbedModal" preset="card" title="嵌入第三方" class="w-240" :bordered="false">
      <div class="grid grid-cols-3 gap-4">
        <!-- 全屏模式 -->
        <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div class="mb-3 text-base font-medium">全屏模式</div>
          <div
            class="mb-4 h-24 flex items-center justify-center rounded-lg from-blue-100 to-blue-50 bg-gradient-to-b dark:from-blue-900 dark:to-blue-800"
          >
            <div class="h-16 w-28 rounded bg-white shadow-sm dark:bg-gray-700">
              <div class="h-2 rounded-t bg-primary/20" />
              <div class="p-2 space-y-1">
                <div class="h-1.5 w-12 rounded bg-gray-200 dark:bg-gray-600" />
                <div class="h-1.5 w-16 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          </div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-gray-500">复制以下代码进行嵌入</span>
            <NButton text size="tiny" @click="copyToClipboard(embedFullscreenCode, '全屏模式代码')">
              <template #icon>
                <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
              </template>
            </NButton>
          </div>
          <div class="rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
            <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{ embedFullscreenCode }}</pre>
          </div>
        </div>

        <!-- 移动端模式 -->
        <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div class="mb-3 text-base font-medium">移动端模式</div>
          <div
            class="mb-4 h-24 flex items-center justify-center rounded-lg from-blue-100 to-blue-50 bg-gradient-to-b dark:from-blue-900 dark:to-blue-800"
          >
            <div class="h-20 w-12 rounded-lg bg-white shadow-sm dark:bg-gray-700">
              <div class="h-1.5 rounded-t bg-primary/20" />
              <div class="p-1.5 space-y-1">
                <div class="h-1 w-6 rounded bg-gray-200 dark:bg-gray-600" />
                <div class="h-1 w-8 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          </div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-gray-500">复制以下代码进行嵌入</span>
            <NButton text size="tiny" @click="copyToClipboard(embedMobileCode, '移动端模式代码')">
              <template #icon>
                <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
              </template>
            </NButton>
          </div>
          <div class="rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
            <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{ embedMobileCode }}</pre>
          </div>
        </div>

        <!-- 浮窗模式 -->
        <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div class="mb-3 text-base font-medium">浮窗模式</div>
          <div
            class="mb-4 h-24 flex items-end justify-end rounded-lg from-blue-100 to-blue-50 bg-gradient-to-b p-2 dark:from-blue-900 dark:to-blue-800"
          >
            <div class="h-14 w-14 rounded-lg bg-white p-1 shadow-sm dark:bg-gray-700">
              <div class="h-1.5 rounded-t bg-primary/20" />
              <div class="p-1 space-y-0.5">
                <div class="h-0.5 w-6 rounded bg-gray-200 dark:bg-gray-600" />
                <div class="h-0.5 w-8 rounded bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          </div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-xs text-gray-500">复制以下代码进行嵌入</span>
            <NButton text size="tiny" @click="copyToClipboard(embedFloatCode, '浮窗模式代码')">
              <template #icon>
                <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
              </template>
            </NButton>
          </div>
          <div class="rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
            <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{ embedFloatCode }}</pre>
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped></style>
