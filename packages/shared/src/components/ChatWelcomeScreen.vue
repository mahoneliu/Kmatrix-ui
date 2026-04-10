<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { baseURL } from '../api/request';

const props = withDefaults(
  defineProps<{
    /** 与后台 AppUiSetting / 管理端配置一致 */
    uiSetting: Api.AI.Admin.AppUiSetting;
    /** 无头图时用于中间展示的 Logo（与 ChatPanel logo 同源） */
    logo?: string;
  }>(),
  {
    logo: undefined
  }
);

const emit = defineEmits<{
  /** 点击示例问题或功能卡片时，将文案填入输入框 */
  selectQuestion: [text: string];
}>();

const { t } = useI18n();

function resolveAssetUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) {
    return url;
  }
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function svgIconBind(icon: string) {
  if (!icon?.trim()) {
    return { icon: 'mdi:view-grid-outline' as const };
  }
  const s = icon.trim();
  return s.includes(':') ? { icon: s } : { localIcon: s };
}

const hero = computed(() => ({
  title: props.uiSetting.hero?.title?.trim() || '',
  subtitle: props.uiSetting.hero?.subtitle?.trim() || '',
  imageUrl: props.uiSetting.hero?.imageUrl?.trim() || ''
}));

const heroImageSrc = computed(() => resolveAssetUrl(hero.value.imageUrl));

const features = computed(() =>
  (props.uiSetting.features ?? []).filter(f => f?.title?.trim() || f?.description?.trim() || f?.icon?.trim())
);

const questions = computed(() =>
  (props.uiSetting.suggestedQuestions ?? []).map(q => String(q).trim()).filter(Boolean)
);

function onFeatureClick(f: NonNullable<Api.AI.Admin.AppUiSetting['features']>[0]) {
  const prompt = f.inputPrompt?.trim();
  const text = prompt || f.title?.trim() || f.description?.trim() || '';
  if (text) emit('selectQuestion', text);
}

function onQuestionClick(q: string) {
  emit('selectQuestion', q);
}
</script>

<template>
  <div class="chat-welcome-screen mx-auto w-full max-w-2xl shrink-0 px-2 py-4">
    <!-- 头部 -->
    <div class="mb-8 text-center">
      <div v-if="heroImageSrc" class="mb-4 flex justify-center">
        <img :src="heroImageSrc" alt="" class="max-h-44 max-w-full object-contain" />
      </div>
      <div v-else-if="logo" class="mb-4 flex justify-center">
        <div
          class="h-24 w-24 flex items-center justify-center overflow-hidden rounded-2xl bg-primary/5 shadow-sm ring-1 ring-gray-100 dark:bg-primary/10 dark:ring-gray-700"
        >
          <img :src="logo" class="h-full w-full object-contain p-2" alt="" />
        </div>
      </div>
      <h1 v-if="hero.title" class="text-2xl text-gray-900 font-bold tracking-tight dark:text-gray-100">
        {{ hero.title }}
      </h1>
      <p v-if="hero.subtitle" class="mt-2 text-base text-gray-500 dark:text-gray-400">
        {{ hero.subtitle }}
      </p>
    </div>

    <!-- 功能卡片：固定一行两个（与常见 2×2 欢迎区一致） -->
    <div v-if="features.length > 0" class="mb-8 grid grid-cols-2 gap-2.5 sm:gap-3">
      <button
        v-for="(f, idx) in features"
        :key="idx"
        type="button"
        class="min-w-0 border border-gray-100 rounded-xl bg-white p-3 text-left shadow-sm transition-colors sm:p-4 hover:border-primary/30 hover:shadow dark:border-gray-700 dark:bg-gray-900/40"
        @click="onFeatureClick(f)"
      >
        <div class="flex items-start gap-3">
          <div
            class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15"
          >
            <SvgIcon class="text-xl" v-bind="svgIconBind(f.icon || '')" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm text-gray-900 font-medium dark:text-gray-100">
              {{ f.title || t('ai.chat.welcome_feature', '快捷入口') }}
            </div>
            <div v-if="f.description" class="mt-1 text-xs text-gray-500 leading-relaxed dark:text-gray-400">
              {{ f.description }}
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- 示例问题：同一行内横向排列，宽度随文字（w-fit），排不下则自动换行 -->
    <div v-if="questions.length > 0">
      <div class="mb-3 flex items-center gap-2 text-sm text-gray-600 font-medium dark:text-gray-300">
        <SvgIcon local-icon="mdi-comment-question-outline" class="text-lg opacity-80" />
        <span>{{ t('ai.chat.welcome_try_questions', '试试这些问题') }}</span>
      </div>
      <div class="flex flex-wrap content-start gap-x-2.5 gap-y-2">
        <button
          v-for="(q, i) in questions"
          :key="i"
          type="button"
          class="max-w-full min-h-10 w-fit shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-800 leading-snug shadow-sm transition-colors hover:border-primary/35 hover:bg-gray-50/90 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-primary/45 dark:hover:bg-gray-800"
          @click="onQuestionClick(q)"
        >
          <span class="block whitespace-normal break-words">{{ q }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
