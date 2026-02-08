<script setup lang="ts">
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({ name: 'HomeAnalysis' });

// Mock data for cards
interface StatCard {
  title: string;
  value: string;
  localIcon: string;
  color: string;
}

const stats: StatCard[] = [
  { title: '总文档数', value: '1,280', localIcon: 'lucide-file-text', color: 'text-blue-600' },
  { title: 'AI 消耗 Token', value: '850K', localIcon: 'lucide-bot', color: 'text-emerald-500' },
  { title: '活跃知识库', value: '12', localIcon: 'lucide-database', color: 'text-purple-600' },
  { title: '昨日新增笔记', value: '34', localIcon: 'lucide-file-plus', color: 'text-orange-500' }
];

// Mock data for recent docs
const recentDocs = [
  { id: 1, title: 'KMatrix 产品需求文档', time: '10 分钟前', tags: ['需求', 'V1.0'] },
  { id: 2, title: '后端接口规范 v2.0', time: '2 小时前', tags: ['开发', '后端'] },
  { id: 3, title: '用户反馈整理 2023-10', time: '5 小时前', tags: ['运营'] },
  { id: 4, title: '前端架构设计图', time: '昨天', tags: ['设计', '架构'] },
  { id: 5, title: 'AI 模型微调日志', time: '昨天', tags: ['AI', '实验'] }
];

// ECharts setup
const { domRef: chartRef } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'line' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#64748b' }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
    axisLabel: { color: '#64748b' }
  },
  series: [
    {
      name: 'Token 消耗',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210],
      itemStyle: { color: '#10b981' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ]
        }
      }
    }
  ]
}));
</script>

<template>
  <div class="h-full flex flex-col gap-6 overflow-hidden bg-[#f8fafc] p-4 dark:bg-dark">
    <!-- Top Cards -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-4 md:grid-cols-2">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="group cursor-default border border-slate-200 rounded-xl bg-white p-6 transition-shadow duration-300 dark:border-dark-700 dark:bg-dark-800 hover:shadow-lg"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="mb-1 text-sm text-slate-500 font-medium">{{ stat.title }}</p>
            <h3 class="text-2xl text-slate-800 font-bold dark:text-white">{{ stat.value }}</h3>
          </div>
          <div class="rounded-lg bg-slate-50 p-3 transition-colors dark:bg-slate-800 group-hover:bg-slate-100">
            <SvgIcon :local-icon="stat.localIcon" class="text-xl" :class="stat.color" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 min-h-0 flex-1 gap-6 lg:grid-cols-3">
      <!-- Left: Recent Docs -->
      <div
        class="flex flex-col border border-slate-200 rounded-xl bg-white p-6 lg:col-span-2 dark:border-dark-700 dark:bg-dark-800"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg text-slate-800 font-bold dark:text-white">
            <div class="rounded-md bg-blue-100 p-1.5 dark:bg-blue-900">
              <SvgIcon local-icon="lucide-clock" class="text-sm text-blue-600 dark:text-blue-400" />
            </div>
            最近编辑文档
          </h2>
          <button class="text-sm text-slate-400 transition-colors hover:text-blue-600">查看全部</button>
        </div>

        <div class="custom-scrollbar flex-1 overflow-y-auto pr-2">
          <div
            v-for="doc in recentDocs"
            :key="doc.id"
            class="group mb-3 flex cursor-pointer items-center justify-between border border-slate-100 rounded-xl p-4 transition-all dark:border-dark-600 hover:border-blue-200 hover:bg-slate-50 dark:hover:bg-dark-700"
          >
            <div class="flex items-center gap-4">
              <div
                class="rounded-xl bg-blue-50 p-3 text-blue-600 shadow-sm transition-all duration-300 dark:bg-blue-900/30 group-hover:bg-blue-600 dark:text-blue-400 group-hover:text-white group-hover:shadow-blue-500/30 group-hover:shadow-md"
              >
                <SvgIcon local-icon="lucide-file-text" class="text-xl" />
              </div>
              <div>
                <h3
                  class="text-slate-800 font-medium transition-colors dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400"
                >
                  {{ doc.title }}
                </h3>
                <div class="mt-1 flex items-center gap-2">
                  <span class="text-xs text-slate-400">{{ doc.time }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <span
                v-for="tag in doc.tags"
                :key="tag"
                class="border border-slate-200 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 font-medium transition-colors dark:border-slate-700 group-hover:border-blue-200 dark:bg-slate-800 group-hover:bg-blue-50 dark:text-slate-400 group-hover:text-blue-600"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: AI Token Chart -->
      <div class="flex flex-col border border-slate-200 rounded-xl bg-white p-6 dark:border-dark-700 dark:bg-dark-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg text-slate-800 font-bold dark:text-white">
            <div class="rounded-md bg-emerald-100 p-1.5 dark:bg-emerald-900">
              <SvgIcon local-icon="lucide-activity" class="text-sm text-emerald-500" />
            </div>
            AI 资源使用
          </h2>
          <select
            class="border border-slate-200 rounded-md bg-transparent px-2 py-1 text-xs text-slate-500 focus:border-emerald-500 focus:outline-none"
          >
            <option>最近7天</option>
            <option>本月</option>
          </select>
        </div>
        <div ref="chartRef" class="min-h-[300px] flex-1" />
      </div>
    </div>

    <!-- Floating Button -->
    <button
      class="group fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-[#1e293b] p-4 text-white shadow-2xl shadow-slate-900/20 transition-all duration-300 active:scale-95 hover:scale-105 dark:bg-blue-600 hover:bg-slate-700 dark:hover:bg-blue-500"
    >
      <SvgIcon local-icon="lucide-plus" class="text-xl transition-transform duration-300 group-hover:rotate-90" />
      <span class="pr-1 font-medium">新建知识库</span>
    </button>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
