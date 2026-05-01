<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { NCard, NGrid, NGridItem, NSelect } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { fetchAppStatistics } from '@/service/api/ai/app';
import { useEcharts } from '@/hooks/common/echarts';

interface Props {
  appId: string;
}

const props = defineProps<Props>();

const { t } = useI18n();

// 监控统计时间范围
const statsPeriod = ref('all');
const statsPeriodOptions = computed<CommonType.Option<string>[]>(() => [
  { label: t('ai.app_detail.monitor.period_all'), value: 'all' },
  { label: t('ai.app_detail.monitor.period_7d'), value: '7d' },
  { label: t('ai.app_detail.monitor.period_30d'), value: '30d' },
  { label: t('ai.app_detail.monitor.period_90d'), value: '90d' }
]);

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
  series: [
    { name: t('ai.app_detail.monitor.user_count'), type: 'line', smooth: true, areaStyle: {}, data: [] as number[] }
  ]
}));

const { domRef: questionDom, updateOptions: updateQuestionChart } = useEcharts(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] as string[] },
  yAxis: { type: 'value' },
  series: [
    {
      name: t('ai.app_detail.monitor.question_count'),
      type: 'line',
      smooth: true,
      areaStyle: {},
      color: '#f97316',
      data: [] as number[]
    }
  ]
}));

// 加载统计数据
async function loadStats() {
  if (!props.appId) return;
  try {
    const { data } = await fetchAppStatistics(props.appId, statsPeriod.value);
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

// 监听 appId 变化（应对详情页切换）
watch(
  () => props.appId,
  () => {
    loadStats();
  }
);

onMounted(async () => {
  // 绑定图表 DOM
  userDom.value = userChartRef.value;
  questionDom.value = questionChartRef.value;
  await loadStats();
});
</script>

<template>
  <NCard size="small">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <div class="h-1 w-1 rounded-full bg-primary" />
          <span class="text-sm font-medium">{{ $t('ai.app_detail.monitor.title') }}</span>
        </div>
        <NSelect v-model:value="statsPeriod" :options="statsPeriodOptions" size="small" class="w-32" />
      </div>
    </template>

    <!-- 统计数字 -->
    <NGrid :cols="4" :x-gap="16" class="mb-6" scrollable>
      <NGridItem>
        <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div class="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <SvgIcon local-icon="mdi-account-group" class="text-xl" />
          </div>
          <div>
            <div class="text-xs text-gray-500">{{ $t('ai.app_detail.monitor.user_count') }}</div>
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
            <div class="text-xs text-gray-500">{{ $t('ai.app_detail.monitor.question_count') }}</div>
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
            <div class="text-xs text-gray-500">{{ $t('ai.app_detail.monitor.tokens_total') }}</div>
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
            <div class="text-xs text-gray-500">{{ $t('ai.app_detail.monitor.satisfaction') }}</div>
            <div class="flex items-center gap-2">
              <span class="text-success">👍 {{ statsData.satisfaction.like }}</span>
              <span class="text-error">👎 {{ statsData.satisfaction.dislike }}</span>
            </div>
          </div>
        </div>
      </NGridItem>
    </NGrid>

    <!-- 图表 -->
    <NGrid :cols="2" :x-gap="16" responsive="screen" item-responsive>
      <NGridItem span="2 m:1">
        <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div class="mb-2 text-sm font-medium">{{ $t('ai.app_detail.monitor.user_count') }}</div>
          <div ref="userChartRef" class="h-48 w-full"></div>
        </div>
      </NGridItem>
      <NGridItem span="2 m:1">
        <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <div class="mb-2 text-sm font-medium">{{ $t('ai.app_detail.monitor.question_count') }}</div>
          <div ref="questionChartRef" class="h-48 w-full"></div>
        </div>
      </NGridItem>
    </NGrid>
  </NCard>
</template>
