<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { NButton, NDrawer, NDrawerContent, NForm, NFormItem, NGrid, NGridItem, NInputNumber, NSpace } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { fetchUpdateUserConfig } from '@/service/api/ai/rate-limit';

defineOptions({ name: 'RateLimitFormDrawer' });

const { t } = useI18n();

interface Props {
  /**
   * 抽屉可见性
   */
  visible: boolean;

  /**
   * 行数据(包含 user 信息与 rateLimitConfig)
   */
  rowData?: Api.Ai.RateLimit.UserInfo | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  }
});

const title = computed(() => {
  if (props.rowData) {
    return t('page.ai_rateLimit.form.editUserConfig', { userName: props.rowData.userName });
  }
  return '';
});

const selectedUserId = ref<number | null>(null);

const formRef = ref<HTMLElement | null>(null);

type Model = Api.Ai.RateLimit.Config;

const model = reactive<Model>({
  minute: { requests: null, tokens: null },
  hour: { requests: null, tokens: null },
  day: { requests: null, tokens: null }
});

function handleInitModel() {
  selectedUserId.value = props.rowData?.userId || null;
  if (props.rowData?.rateLimitConfig) {
    try {
      const parsed = JSON.parse(props.rowData.rateLimitConfig);
      model.minute = parsed.minute || { requests: null, tokens: null };
      model.hour = parsed.hour || { requests: null, tokens: null };
      model.day = parsed.day || { requests: null, tokens: null };
    } catch {
      // ignore
    }
  } else {
    Object.assign(model, {
      minute: { requests: null, tokens: null },
      hour: { requests: null, tokens: null },
      day: { requests: null, tokens: null }
    });
  }
}

watch(visible, val => {
  if (val) {
    handleInitModel();
  }
});

function closeDrawer() {
  visible.value = false;
}

const submitting = ref(false);

async function handleSubmit() {
  if (!selectedUserId.value) {
    window.$message?.warning(t('common.pleaseCheckValue'));
    return;
  }
  submitting.value = true;
  try {
    const { error } = await fetchUpdateUserConfig(selectedUserId.value, model);
    if (!error) {
      window.$message?.success(t('page.ai_rateLimit.msg.userUpdateSuccess'));
      closeDrawer();
      emit('submitted');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <NDrawer v-model:show="visible" :width="450" placement="right">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" label-placement="top" class="mt-4">
        <NGrid :cols="1" :y-gap="24">
          <!-- 分钟 -->
          <NGridItem>
            <div class="text-md mb-2 font-bold">{{ t('page.ai_rateLimit.quota.minute') }}</div>
            <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
              <NInputNumber
                v-model:value="model.minute!.requests"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
              />
            </NFormItem>
            <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
              <NInputNumber
                v-model:value="model.minute!.tokens"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
              />
            </NFormItem>
          </NGridItem>

          <!-- 小时 -->
          <NGridItem>
            <div class="text-md mb-2 font-bold">{{ t('page.ai_rateLimit.quota.hour') }}</div>
            <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
              <NInputNumber
                v-model:value="model.hour!.requests"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
              />
            </NFormItem>
            <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
              <NInputNumber
                v-model:value="model.hour!.tokens"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
              />
            </NFormItem>
          </NGridItem>

          <!-- 天 -->
          <NGridItem>
            <div class="text-md mb-2 font-bold">{{ t('page.ai_rateLimit.quota.day') }}</div>
            <NFormItem :label="t('page.ai_rateLimit.quota.requests')">
              <NInputNumber
                v-model:value="model.day!.requests"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.reqPlaceholder')"
              />
            </NFormItem>
            <NFormItem :label="t('page.ai_rateLimit.quota.tokens')">
              <NInputNumber
                v-model:value="model.day!.tokens"
                class="w-full"
                clearable
                min="1"
                :placeholder="t('page.ai_rateLimit.form.tokenPlaceholder')"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>
      </NForm>

      <NSpace justify="center" class="mt-8">
        <NButton @click="closeDrawer">{{ t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</NButton>
      </NSpace>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
