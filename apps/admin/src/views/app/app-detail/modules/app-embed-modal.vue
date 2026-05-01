<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NButton, NCard, NModal, NTabPane, NTabs } from 'naive-ui';
import { copyToClipboard } from '@km/shared';
import { SvgIcon } from '@sa/materials';

interface Props {
  show: boolean;
  appId: string;
  appToken: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:show': [show: boolean];
}>();

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
});

// 获取基础聊天 URL
const chatAppUrl = computed(() => import.meta.env.VITE_CHAT_APP_URL || `${window.location.origin}/chat`);

// 嵌入代码 - 全屏模式
const embedFullscreenCode = computed(() => {
  if (!props.appToken) return '';
  return `<iframe
  src="${chatAppUrl.value}/?appToken=${props.appToken}&appId=${props.appId}"
  style="width: 100%; height: 100%;"
  frameborder="0"
  allow="microphone">
</iframe>`;
});

// 嵌入代码 - 移动端模式
const embedMobileCode = computed(() => {
  if (!props.appToken) return '';
  return `<iframe
  src="${chatAppUrl.value}/?appToken=${props.appToken}&appId=${props.appId}&mode=mobile"
  style="width: 100%; height: 100%;"
  frameborder="0"
  allow="microphone">
</iframe>`;
});

// 嵌入代码 - 浮窗模式
const embedFloatCode = computed(() => {
  if (!props.appToken) return '';
  // eslint-disable-next-line no-useless-concat
  return `<script
  async
  defer
  src="${chatAppUrl.value}/loader.js?appToken=${props.appToken}&appId=${props.appId}">
<${'/script'}>`;
});

// 嵌入代码 - 高级脚本
const advancedEmbedCode = computed(() => {
  if (!props.appToken) return '';
  // eslint-disable-next-line no-useless-concat
  const scriptEnd = '<' + '/script>';
  return `<script>
    /**
     * KMatrix 嵌入窗口加载器
     * 通过配置对象动态生成嵌入链接，避免手动进行 URL 编码
     */
    (function() {
        // --- 1. 基础配置 (根据您的实际情况修改) ---
        const config = {
            baseUrl: "${chatAppUrl.value}/loader.js", // 加载器地址
            appToken: "${props.appToken}",
            appId: "${props.appId}", // 应用 ID

            // --- 2. 自定义业务参数 (可读性最强的地方) ---
            customParams: {
                keyword: "123456",        // 匹配接口参数中的 keyword
                source: "ext-website",    // 您还可以添加其他预定义的字段
                themeColor: "#409EFF"     // 示例：其他自定义字段
            },
            // --- 3. UI 表现配置 (可选) ---
            ui: {
                primaryColor: "#18a058",  // 主题色
                theme: "light"            // 亮色/暗色模式
            }
        };
        // --- 4. 自动化拼接与加载逻辑 (无需修改) ---
        function loadKMatrix(options) {
            const url = new URL(options.baseUrl);

            // 添加基础参数
            url.searchParams.append("appToken", options.appToken);
            url.searchParams.append("appId", options.appId);

            // 自动处理自定义参数的 JSON 转换和安全编码
            if (options.customParams) {
                const jsonStr = JSON.stringify(options.customParams);
                url.searchParams.append("customParams", jsonStr);
            }
            // 添加可选的 UI 参数
            if (options.ui) {
                if (options.ui.primaryColor) url.searchParams.append("primaryColor", options.ui.primaryColor);
                if (options.ui.theme) url.searchParams.append("theme", options.ui.theme);
            }
            // 动态创建并注入加载脚本
            const script = document.createElement("script");
            script.async = true;
            script.defer = true;
            script.src = url.toString();

            document.head.appendChild(script);
            console.log("[KMatrix] 正在加载嵌入窗口，参数已注入：", options.customParams);
        }
        // 执行加载
        loadKMatrix(config);
    })();
${scriptEnd}`;
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="$t('ai.app_detail.embed.title')" class="w-240" :bordered="false">
    <NTabs type="line" animated>
      <!-- 快速嵌入 (iframe) -->
      <NTabPane name="quick" :tab="$t('ai.app_detail.embed.quick')">
        <div class="grid grid-cols-3 gap-4 pt-2">
          <!-- 全屏模式 -->
          <NCard
            size="small"
            :title="$t('ai.app_detail.embed.fullscreen')"
            class="border-gray-200 dark:border-gray-700"
          >
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
              <span class="text-xs text-gray-500">{{ $t('ai.app_detail.embed.copy_code_tip') }}</span>
              <NButton
                text
                size="tiny"
                @click="copyToClipboard(embedFullscreenCode, $t('ai.app_detail.fullscreen_code'))"
              >
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
                </template>
              </NButton>
            </div>
            <div class="h-32 overflow-hidden rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
              <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{
                embedFullscreenCode
              }}</pre>
            </div>
          </NCard>

          <!-- 移动端模式 -->
          <NCard size="small" :title="$t('ai.app_detail.embed.mobile')" class="border-gray-200 dark:border-gray-700">
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
              <span class="text-xs text-gray-500">{{ $t('ai.app_detail.embed.copy_code_tip') }}</span>
              <NButton text size="tiny" @click="copyToClipboard(embedMobileCode, $t('ai.app_detail.mobile_code'))">
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
                </template>
              </NButton>
            </div>
            <div class="h-32 overflow-hidden rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
              <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{ embedMobileCode }}</pre>
            </div>
          </NCard>

          <!-- 浮窗模式 -->
          <NCard size="small" :title="$t('ai.app_detail.embed.float')" class="border-gray-200 dark:border-gray-700">
            <div
              class="mb-4 h-24 flex items-center justify-center rounded-lg from-blue-100 to-blue-50 bg-gradient-to-b dark:from-blue-900 dark:to-blue-800"
            >
              <div class="h-16 w-28 rounded-lg bg-white shadow-sm dark:bg-gray-700">
                <div class="h-1.5 rounded-t bg-primary/20" />
                <div class="flex justify-end p-2">
                  <div class="h-4 w-4 rounded-full bg-primary shadow-sm" />
                </div>
              </div>
            </div>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ $t('ai.app_detail.embed.copy_code_tip') }}</span>
              <NButton text size="tiny" @click="copyToClipboard(embedFloatCode, $t('ai.app_detail.float_code'))">
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" class="text-xs" />
                </template>
              </NButton>
            </div>
            <div class="h-32 overflow-hidden rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
              <pre class="whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300">{{ embedFloatCode }}</pre>
            </div>
          </NCard>
        </div>
      </NTabPane>

      <!-- 高级嵌入 (Script) -->
      <NTabPane name="advanced" :tab="$t('ai.app_detail.embed.advanced')">
        <div class="pt-2 space-y-4">
          <NAlert type="info" :show-icon="true" :title="$t('ai.app_detail.embed.advanced')">
            {{ $t('ai.app_detail.embed.advanced_desc') }}
          </NAlert>

          <NCard size="small" :title="$t('ai.app_detail.embed.code')" class="border-gray-200 dark:border-gray-700">
            <template #header-extra>
              <NButton
                size="small"
                type="primary"
                secondary
                @click="copyToClipboard(advancedEmbedCode, $t('ai.app_detail.embed.code'))"
              >
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" />
                </template>
                {{ $t('common.copy') }}
              </NButton>
            </template>
            <div class="rounded bg-gray-900 p-4 text-xs font-mono">
              <pre class="whitespace-pre-wrap break-all text-gray-300">{{ advancedEmbedCode }}</pre>
            </div>
          </NCard>

          <NAlert type="warning" :show-icon="true">
            {{ $t('ai.app_detail.embed.advanced_tip') }}
          </NAlert>
        </div>
      </NTabPane>
    </NTabs>
  </NModal>
</template>

<style scoped>
pre {
  margin: 0;
  font-family: inherit;
}
</style>
