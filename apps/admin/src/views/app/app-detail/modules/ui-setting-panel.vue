<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { UploadCustomRequestOptions } from 'naive-ui';
import {
  NButton,
  NDynamicInput,
  NFormItem,
  NImage,
  NInput,
  NP,
  NRadioButton,
  NRadioGroup,
  NSwitch,
  NTabPane,
  NTabs,
  NUpload,
  useMessage
} from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { useI18n } from 'vue-i18n';
import { updateApp } from '@/service/api/ai/app';
import { fetchAiUploadFile } from '@/service/api/ai/storage';

interface Props {
  appId: string;
  appName: string;
  uiSetting?: Api.AI.Admin.AppUiSetting | null;
}

interface Emits {
  (e: 'update'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const message = useMessage();

const activeTab = ref<'form' | 'json'>('form');
const saving = ref(false);
const heroUploading = ref(false);

/** 功能卡片数量上限（与常见 2×2 欢迎区一致，可按需调整） */
const MAX_FEATURE_CARDS = 8;

/** 示例问题条数上限 */
const MAX_SUGGESTED_QUESTIONS = 16;

function createEmptySuggestedQuestion() {
  return '';
}

/** 预设图标（存库仍为字符串，与 SvgIcon iconify / 本地名兼容） */
const FEATURE_ICON_PRESETS = [
  'mdi:camera',
  'mdi:water',
  'mdi:magnify',
  'mdi:sprout',
  'mdi:book-open-variant',
  'mdi:lightbulb-outline',
  'mdi:chat-question-outline',
  'mdi:leaf',
  'mdi:heart-outline',
  'mdi:weather-sunny',
  'mdi:help-circle-outline',
  'mdi:star-outline'
] as const;

const jsonText = ref('');

function svgIconBind(icon: string) {
  if (!icon?.trim()) {
    return { icon: 'mdi:view-grid-outline' as const };
  }
  const s = icon.trim();
  return s.includes(':') ? { icon: s } : { localIcon: s };
}

function normalize(raw: Api.AI.Admin.AppUiSetting | null | undefined): Api.AI.Admin.AppUiSetting {
  const r = raw || {};
  return {
    enabled: r.enabled ?? false,
    hero: {
      title: r.hero?.title ?? '',
      subtitle: r.hero?.subtitle ?? '',
      imageUrl: r.hero?.imageUrl ?? ''
    },
    features: Array.isArray(r.features)
      ? r.features.map(f => ({
          icon: f?.icon ?? '',
          title: f?.title ?? '',
          description: f?.description ?? '',
          inputPrompt: f?.inputPrompt ?? ''
        }))
      : [],
    suggestedQuestions: Array.isArray(r.suggestedQuestions) ? [...r.suggestedQuestions] : [],
    hidePrologueBubble: r.hidePrologueBubble ?? false
  };
}

const form = ref<Api.AI.Admin.AppUiSetting>(normalize(props.uiSetting));

watch(
  () => props.uiSetting,
  v => {
    form.value = normalize(v);
    if (activeTab.value === 'json') {
      jsonText.value = JSON.stringify(form.value, null, 2);
    }
  },
  { deep: true }
);

watch(activeTab, tab => {
  if (tab === 'json') {
    jsonText.value = JSON.stringify(form.value, null, 2);
  }
});

const canSave = computed(() => Boolean(props.appId && props.appName?.trim()));

const canAddFeature = computed(() => (form.value.features?.length ?? 0) < MAX_FEATURE_CARDS);

function addFeature() {
  if (!canAddFeature.value) {
    message.warning(t('ai.app_detail.ui_setting.features_max', { n: MAX_FEATURE_CARDS }));
    return;
  }
  form.value.features = [
    ...(form.value.features || []),
    { icon: FEATURE_ICON_PRESETS[0], title: '', description: '', inputPrompt: '' }
  ];
}

function removeFeature(index: number) {
  const list = [...(form.value.features || [])];
  list.splice(index, 1);
  form.value.features = list;
}

function moveFeature(index: number, delta: -1 | 1) {
  const list = [...(form.value.features || [])];
  const j = index + delta;
  if (j < 0 || j >= list.length) return;
  const temp = list[index]!;
  list[index] = list[j]!;
  list[j] = temp;
  form.value.features = list;
}

function pickFeatureIcon(idx: number, icon: string) {
  const list = [...(form.value.features || [])];
  const row = list[idx];
  if (!row) return;
  row.icon = icon;
  form.value.features = list;
}

const hasHeroImage = computed(() => Boolean(form.value.hero?.imageUrl?.trim()));

async function handleHeroImageUpload(options: UploadCustomRequestOptions) {
  const raw = options.file.file;
  if (!raw) {
    options.onError();
    return;
  }
  if (!raw.type.startsWith('image/')) {
    message.warning(t('ai.app_detail.ui_setting.hero_upload_image_only'));
    options.onError();
    return;
  }
  heroUploading.value = true;
  try {
    const { data, error } = await fetchAiUploadFile(raw);
    if (error || !data?.url) {
      message.error(t('ai.app_detail.ui_setting.hero_upload_failed'));
      options.onError();
      return;
    }
    form.value.hero!.imageUrl = data.url;
    message.success(t('ai.app_detail.ui_setting.hero_upload_success'));
    options.onFinish();
  } catch {
    message.error(t('ai.app_detail.ui_setting.hero_upload_failed'));
    options.onError();
  } finally {
    heroUploading.value = false;
  }
}

function clearHeroImage() {
  form.value.hero!.imageUrl = '';
}

function parseJsonToForm(): boolean {
  try {
    const parsed = JSON.parse(jsonText.value) as Api.AI.Admin.AppUiSetting;
    form.value = normalize(parsed);
    return true;
  } catch {
    message.error(t('ai.app_detail.ui_setting.json_invalid'));
    return false;
  }
}

function compactSuggestedQuestions(list: string[] | undefined) {
  return (list ?? []).map(s => String(s).trim()).filter(Boolean);
}

async function handleSave() {
  if (!canSave.value) {
    message.warning(t('ai.app_detail.ui_setting.save_need_name'));
    return;
  }

  let payload = form.value;
  if (activeTab.value === 'json') {
    if (!parseJsonToForm()) return;
    payload = form.value;
  }

  payload = {
    ...payload,
    suggestedQuestions: compactSuggestedQuestions(payload.suggestedQuestions)
  };

  saving.value = true;
  try {
    const { error } = await updateApp({
      appId: props.appId,
      appName: props.appName.trim(),
      uiSetting: payload
    });
    if (!error) {
      message.success(t('ai.app_detail.ui_setting.save_success'));
      emit('update');
    }
  } catch {
    message.error(t('ai.app_detail.ui_setting.save_failed'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="ui-setting-panel relative">
    <div class="absolute right-0 top-0 z-50">
      <NRadioGroup v-model:value="activeTab" size="small">
        <NRadioButton value="form">
          <div class="flex items-center gap-1">
            <SvgIcon local-icon="mdi-format-list-bulleted" />
            <span>{{ t('ai.app_detail.ui_setting.tab_form') }}</span>
          </div>
        </NRadioButton>
        <NRadioButton value="json">
          <div class="flex items-center gap-1">
            <SvgIcon local-icon="mdi-code-json" />
            <span>{{ t('ai.app_detail.ui_setting.tab_json') }}</span>
          </div>
        </NRadioButton>
      </NRadioGroup>
    </div>

    <NTabs v-model:value="activeTab" type="line" size="small">
      <NTabPane name="form" :tab="t('ai.app_detail.ui_setting.landing_page_config')">
        <div class="mt-3 space-y-4">
          <NFormItem :label="t('ai.app_detail.ui_setting.enabled')" label-placement="left" :show-feedback="false">
            <NSwitch v-model:value="form.enabled" />
          </NFormItem>
          <NFormItem :label="t('ai.app_detail.ui_setting.hide_prologue')" label-placement="left" :show-feedback="false">
            <NSwitch v-model:value="form.hidePrologueBubble" />
          </NFormItem>

          <div class="border border-gray-100 rounded-lg p-3 space-y-3 dark:border-gray-700">
            <div class="text-sm font-medium">{{ t('ai.app_detail.ui_setting.hero') }}</div>
            <NFormItem :label="t('ai.app_detail.ui_setting.hero_title')" label-placement="top">
              <NInput v-model:value="form.hero!.title" :placeholder="t('ai.app_detail.ui_setting.hero_title_ph')" />
            </NFormItem>
            <NFormItem :label="t('ai.app_detail.ui_setting.hero_subtitle')" label-placement="top">
              <NInput
                v-model:value="form.hero!.subtitle"
                :placeholder="t('ai.app_detail.ui_setting.hero_subtitle_ph')"
              />
            </NFormItem>
            <NFormItem :label="t('ai.app_detail.ui_setting.hero_image')" label-placement="top">
              <div class="space-y-3">
                <div v-if="hasHeroImage" class="flex flex-wrap items-start gap-3">
                  <div
                    class="relative overflow-hidden border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <NImage
                      width="200"
                      height="120"
                      object-fit="contain"
                      :src="form.hero!.imageUrl"
                      :alt="t('ai.app_detail.ui_setting.hero_image')"
                      preview-disabled
                      class="block"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <NUpload
                      :show-file-list="false"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                      :custom-request="handleHeroImageUpload"
                      :disabled="heroUploading"
                    >
                      <NButton size="small" :loading="heroUploading">
                        {{ t('ai.app_detail.ui_setting.hero_replace') }}
                      </NButton>
                    </NUpload>
                    <NButton size="small" quaternary type="error" @click="clearHeroImage">
                      {{ t('ai.app_detail.ui_setting.hero_remove') }}
                    </NButton>
                  </div>
                </div>
                <div v-else class="flex flex-col gap-2">
                  <NUpload
                    :show-file-list="false"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    :custom-request="handleHeroImageUpload"
                    :disabled="heroUploading"
                  >
                    <NButton type="primary" dashed :loading="heroUploading">
                      {{ t('ai.app_detail.ui_setting.hero_upload') }}
                    </NButton>
                  </NUpload>
                  <NP depth="3" class="text-xs !mt-0">
                    {{ t('ai.app_detail.ui_setting.hero_upload_tip') }}
                  </NP>
                </div>
              </div>
            </NFormItem>
          </div>

          <div class="border border-gray-100 rounded-lg p-3 space-y-3 dark:border-gray-700">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div class="text-sm font-medium">{{ t('ai.app_detail.ui_setting.features') }}</div>
                <NP depth="3" class="text-xs !mt-0.5">
                  {{ t('ai.app_detail.ui_setting.features_hint') }}
                </NP>
              </div>
              <NButton size="small" :disabled="!canAddFeature" @click="addFeature">
                {{ t('ai.app_detail.ui_setting.add_feature') }}
              </NButton>
            </div>
            <div
              v-if="!form.features?.length"
              class="border border-gray-200 rounded-lg border-dashed py-8 text-center text-xs text-gray-400 dark:border-gray-600"
            >
              {{ t('ai.app_detail.ui_setting.features_empty') }}
            </div>
            <div v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div
                v-for="(f, idx) in form.features"
                :key="idx"
                class="border border-gray-100 rounded-lg bg-gray-50/50 p-3 shadow-sm dark:border-gray-600 dark:bg-gray-800/40"
              >
                <div class="mb-3 flex items-start justify-between gap-2">
                  <div class="min-w-0 flex items-center gap-2">
                    <div
                      class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-600"
                    >
                      <SvgIcon class="text-xl" v-bind="svgIconBind(f.icon || '')" />
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ t('ai.app_detail.ui_setting.feature_card_label', { n: idx + 1 }) }}
                      </div>
                      <div class="truncate text-sm font-medium">
                        {{ f.title || t('ai.app_detail.ui_setting.feature_title_placeholder') }}
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-shrink-0 flex-wrap items-center justify-end gap-1">
                    <NButton
                      size="tiny"
                      quaternary
                      :disabled="idx === 0"
                      :title="t('ai.app_detail.ui_setting.move_up')"
                      @click="moveFeature(idx, -1)"
                    >
                      <template #icon>
                        <SvgIcon icon="mdi:arrow-up" class="text-16px" />
                      </template>
                    </NButton>
                    <NButton
                      size="tiny"
                      quaternary
                      :disabled="idx === (form.features?.length ?? 0) - 1"
                      :title="t('ai.app_detail.ui_setting.move_down')"
                      @click="moveFeature(idx, 1)"
                    >
                      <template #icon>
                        <SvgIcon icon="mdi:arrow-down" class="text-16px" />
                      </template>
                    </NButton>
                    <NButton size="tiny" quaternary type="error" @click="removeFeature(idx)">
                      {{ t('ai.app_detail.ui_setting.remove') }}
                    </NButton>
                  </div>
                </div>

                <div class="mb-2 text-xs text-gray-500">{{ t('ai.app_detail.ui_setting.feature_icon_pick') }}</div>
                <div class="mb-3 flex flex-wrap gap-1.5">
                  <button
                    v-for="preset in FEATURE_ICON_PRESETS"
                    :key="preset"
                    type="button"
                    class="h-9 w-9 flex items-center justify-center border rounded-md transition-colors"
                    :class="
                      f.icon === preset
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-white hover:border-primary/50 dark:border-gray-600 dark:bg-gray-900'
                    "
                    :title="preset"
                    @click="pickFeatureIcon(idx, preset)"
                  >
                    <SvgIcon class="text-lg" v-bind="svgIconBind(preset)" />
                  </button>
                </div>

                <NFormItem
                  :label="t('ai.app_detail.ui_setting.feature_icon_custom')"
                  label-placement="top"
                  :show-feedback="false"
                >
                  <NInput
                    v-model:value="f.icon"
                    size="small"
                    :placeholder="t('ai.app_detail.ui_setting.feature_icon_custom_ph')"
                  />
                </NFormItem>
                <NFormItem :label="t('ai.app_detail.ui_setting.feature_title')" label-placement="top">
                  <NInput
                    v-model:value="f.title"
                    size="small"
                    :placeholder="t('ai.app_detail.ui_setting.feature_title_ph')"
                  />
                </NFormItem>
                <NFormItem :label="t('ai.app_detail.ui_setting.feature_desc')" label-placement="top">
                  <NInput
                    v-model:value="f.description"
                    size="small"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    :placeholder="t('ai.app_detail.ui_setting.feature_desc_ph')"
                  />
                </NFormItem>
                <NFormItem :label="t('ai.app_detail.ui_setting.feature_input_prompt')" label-placement="top">
                  <NInput
                    v-model:value="f.inputPrompt"
                    size="small"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 6 }"
                    :placeholder="t('ai.app_detail.ui_setting.feature_input_prompt_ph')"
                  />
                </NFormItem>
              </div>
            </div>
          </div>

          <div class="border border-gray-100 rounded-lg p-3 dark:border-gray-700">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span class="text-sm font-medium">{{ t('ai.app_detail.ui_setting.suggested_questions') }}</span>
            </div>
            <NP depth="3" class="text-xs !mb-3">
              {{ t('ai.app_detail.ui_setting.suggested_questions_hint', { n: MAX_SUGGESTED_QUESTIONS }) }}
            </NP>
            <NDynamicInput
              v-model:value="form.suggestedQuestions"
              preset="input"
              :on-create="createEmptySuggestedQuestion"
              :max="MAX_SUGGESTED_QUESTIONS"
              :placeholder="t('ai.app_detail.ui_setting.suggested_question_input_ph')"
            >
              <template #create-button-default>{{ t('ai.app_detail.ui_setting.suggested_add') }}</template>
            </NDynamicInput>
          </div>
        </div>
      </NTabPane>

      <NTabPane name="json" :tab="t('ai.app_detail.ui_setting.tab_json')">
        <template #tab>
          <div class="flex items-center gap-1">
            <SvgIcon local-icon="mdi-code-json" />
            <span>{{ t('ai.app_detail.ui_setting.tab_json') }}</span>
          </div>
        </template>
        <div class="pt-3">
          <NInput
            v-model:value="jsonText"
            class="text-xs font-mono"
            type="textarea"
            :autosize="{ minRows: 16, maxRows: 28 }"
            :placeholder="t('ai.app_detail.ui_setting.json_placeholder')"
            @update:value="parseJsonToForm"
          />
        </div>
      </NTabPane>
    </NTabs>

    <div class="mt-4 flex justify-end">
      <NButton type="primary" :loading="saving" :disabled="!canSave" @click="handleSave">
        {{ t('ai.app_detail.ui_setting.save_btn') }}
      </NButton>
    </div>
  </div>
</template>
