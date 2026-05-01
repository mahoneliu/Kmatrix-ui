<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
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
  NSwitch,
  NTooltip,
  useDialog,
  useMessage
} from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { SvgIcon } from '@sa/materials';
import { copyToClipboard } from '@km/shared';
import { fetchAppDetail, publishApp, updateApp, updatePublicAccess } from '@/service/api/ai/app';
import { fetchAppTokenList, refreshAppToken } from '@/service/api/ai/app-token';
import { graphToDsl, validateGraph } from '@/utils/ai/dsl-converter';
import { formatValidationErrors, validateWorkflow } from '@/utils/ai/validation';
import AppOperateModal from '@/views/ai/app/app-manager/modules/app-operate-modal.vue';
import DebugChatDialog from '@/components/ai/chat/debug-chat-dialog.vue';
import SystemTemplateConfigPanel from './modules/system-template-config-panel.vue';
import UiSettingPanel from './modules/ui-setting-panel.vue';
import AppEmbedModal from './modules/app-embed-modal.vue';
import AppMonitorPanel from './modules/app-monitor-panel.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const message = useMessage();
const dialog = useDialog();

const appId = ref<string>(route.query.appId as string);
const appInfo = ref<Api.AI.Admin.App | null>(null);
const tokenList = ref<any[]>([]);
const loading = ref(false);
/** 应用配置折叠 */
const showConfigPanel = ref(false);
/** 对话界面 / 欢迎页配置折叠 */
const showUiWelcomePanel = ref(false);

function toggleConfigPanel() {
  showConfigPanel.value = !showConfigPanel.value;
  if (showConfigPanel.value) {
    showUiWelcomePanel.value = false;
  }
}

function toggleUiWelcomePanel() {
  showUiWelcomePanel.value = !showUiWelcomePanel.value;
  if (showUiWelcomePanel.value) {
    showConfigPanel.value = false;
  }
}

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
      const { error } = await updatePublicAccess(appInfo.value.appId, val ? '1' : '0');
      if (error) return;
      appInfo.value.publicAccess = val ? '1' : '0';
      message.success(val ? t('ai.app_detail.public_access_opened') : t('ai.app_detail.public_access_closed'));
    } catch {
      message.error(t('common.updateFailed'));
    }
  }
});

// 计算公开访问链接
const publicAccessUrl = computed(() => {
  if (!appInfo.value) return '';
  const token = tokenList.value.find(item => item.status === '1');
  if (!token) return '';
  return `${window.location.origin}/chat/${token.token}`;
});

// 系统模版组件 Ref
const systemTemplateConfigRef = ref<any>(null);

// 获取应用信息
async function loadAppInfo() {
  loading.value = true;
  try {
    const { data } = await fetchAppDetail(appId.value);
    if (data) {
      appInfo.value = data;
    }
  } catch {
    message.error(t('common.loadFailed'));
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
    const { error } = await refreshAppToken(tokenId);
    if (error) return;
    message.success(t('common.refreshSuccess'));
    await loadTokenList();
  } catch {
    message.error(t('common.refreshFailed'));
  }
}

// 跳转去对话
function handleGoToChat() {
  router.push({ name: 'ai_app_chat', query: { appId: appId.value } });
}

// 跳转工作流设置
function handleSettings() {
  if (!appInfo.value || appInfo.value.appType !== '2') return;
  router.push({
    name: 'ai_workflow_editor',
    query: { appId: appId.value }
  });
}

// 发布应用 - 复用 useWorkflowPersistence 的校验逻辑
async function handlePublish() {
  if (!appInfo.value) return;

  // 系统模版应用：只校验配置面板参数，跳过工作流校验
  if (isSystemTemplateApp.value) {
    if (systemTemplateConfigRef.value && !systemTemplateConfigRef.value.canSave) {
      message.warning(t('ai.workflow.please_fill_app_info'));
      return;
    }

    // 发布确认
    dialog.create({
      title: t('ai.app_detail.publish_btn'),
      content: t('ai.app_detail.publish_confirm_content'),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: async () => {
        try {
          if (systemTemplateConfigRef.value) {
            const success = await systemTemplateConfigRef.value.handleSave();
            if (!success) {
              message.error(t('ai.app_detail.config.save_failed'));
              return;
            }
          }

          const { error } = await publishApp(appId.value, t('ai.app_detail.publish_from_detail'));
          if (error) return;
          message.success(t('common.publishSuccess'));
          await loadAppInfo();
        } catch {
          message.error(t('common.publishFailed'));
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
      title: t('ai.app_detail.workflow_incomplete'),
      content: t('ai.app_detail.workflow_not_configured_yet_confirm'),
      positiveText: t('ai.app_detail.go_config'),
      negativeText: t('common.cancel'),
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
      title: t('ai.app_detail.workflow_incomplete'),
      content: t('ai.app_detail.workflow_config_error_confirm', { error: graphValidation.errors.join(', ') }),
      positiveText: t('ai.app_detail.go_config'),
      negativeText: t('common.cancel'),
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 4. 校验节点参数绑定
  const paramValidation = validateWorkflow(workflowNodes);
  if (!paramValidation.valid) {
    const errorMessage = formatValidationErrors(paramValidation);
    dialog.warning({
      title: t('ai.app_detail.workflow_incomplete'),
      content: t('ai.app_detail.workflow_config_error_confirm', { error: errorMessage }),
      positiveText: t('ai.app_detail.go_config'),
      negativeText: t('common.cancel'),
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 5. 校验应用基础配置（modelId）
  if (!appInfo.value.modelId) {
    dialog.warning({
      title: t('ai.app_detail.workflow_incomplete'),
      content: t('ai.app_detail.workflow_missing_model_confirm'),
      positiveText: t('ai.app_detail.go_config'),
      negativeText: t('common.cancel'),
      onPositiveClick: () => handleSettings()
    });
    return;
  }

  // 6. 发布确认
  dialog.create({
    title: t('ai.app_detail.publish_btn'),
    content: t('ai.app_detail.publish_confirm_content'),
    positiveText: t('common.confirm'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        // 先调用保存操作避免“工作流配置无变更”
        const dsl = graphToDsl(graphData, appInfo.value?.appName || '');
        const { error: saveError } = await updateApp({
          appId: appId.value,
          modelId: appInfo.value?.modelId,
          graphData: appInfo.value?.graphData,
          dslData: JSON.stringify(dsl),
          parameters: appInfo.value?.parameters,
          appName: appInfo.value?.appName,
          description: appInfo.value?.description,
          icon: appInfo.value?.icon,
          prologue: appInfo.value?.prologue,
          uiSetting: appInfo.value?.uiSetting
        });
        if (saveError) return;

        const { error } = await publishApp(appId.value, t('ai.app_detail.publish_from_detail'));
        if (error) return;
        message.success(t('common.publishSuccess'));
        await loadAppInfo();
      } catch {
        message.error(t('common.publishFailed'));
      }
    }
  });
}

// 调试应用
function handleDebug() {
  if (!appInfo.value) return;
  showDebugDialog.value = true;
}

// 嵌入模式弹窗
const showEmbedModal = ref(false);
const currentAppToken = computed(() => {
  if (!tokenList.value.length) return '';
  const token = tokenList.value.find(item => item.status === '1') || tokenList.value[0];
  return token?.token || '';
});

// 运行菜单选项
const runOptions = computed(() => {
  return [
    {
      label: t('ai.app_detail.embed.title'),
      key: 'embed',
      icon: () => h(SvgIcon, { localIcon: 'mdi-code-tags' })
    },
    {
      label: t('ai.app_manager.go_to_chat'),
      key: 'chat',
      icon: () => h(SvgIcon, { localIcon: 'carbon-chat' })
    },
    {
      type: 'divider',
      key: 'd1'
    },
    {
      label:
        appInfo.value?.enableExecutionDetail === '1'
          ? t('ai.app_detail.disable_execution_detail')
          : t('ai.app_detail.enable_execution_detail'),
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
    const { error } = await updateApp({
      appId: appId.value,
      appName: appInfo.value.appName,
      enableExecutionDetail: newValue
    });
    if (!error) {
      appInfo.value.enableExecutionDetail = newValue;
      message.success(
        newValue === '1'
          ? t('ai.app_detail.enable_execution_detail_success')
          : t('ai.app_detail.disable_execution_detail_success')
      );
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
});
</script>

<template>
  <div class="h-full flex flex-col overflow-auto">
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
              <NTag :type="isPublished ? 'success' : 'error'">
                {{ isPublished ? $t('ai.app_manager.status_published') : $t('ai.app_manager.status_unpublished') }}
              </NTag>
            </div>
          </div>

          <div v-if="isPublished && publicAccessEnabled" class="mt-2 flex items-center gap-2">
            <NInputGroup>
              <NInput :value="publicAccessUrl" readonly size="small" placeholder="" class="min-w-60 flex-1" />
              <NButton size="small" @click="copyToClipboard(publicAccessUrl, $t('ai.app_detail.public_link'))">
                <template #icon>
                  <SvgIcon local-icon="mdi-content-copy" />
                </template>
              </NButton>
            </NInputGroup>
            <NTooltip>
              <template #trigger>
                <NButton size="small" @click="handleRefreshToken(tokenList[0]?.tokenId)">
                  {{ $t('ai.app_detail.refresh') }}
                </NButton>
              </template>
              {{ $t('ai.app_detail.refresh_token_tip') }}
            </NTooltip>
          </div>
          <!-- 操作按钮组 -->
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <!-- 系统模版应用配置按钮（放在最左边） -->
            <NButton v-if="isSystemTemplateApp" size="small" @click="toggleConfigPanel">
              <template #icon>
                <SvgIcon :icon="showConfigPanel ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
              </template>
              {{ $t('ai.app_detail.app_config') }}
            </NButton>

            <NButton v-else size="small" @click="handleSettings">
              <template #icon>
                <SvgIcon local-icon="mdi-settings" />
              </template>
              {{ $t('ai.app_detail.workflow_settings') }}
            </NButton>

            <!-- 对话界面 / 欢迎页配置按钮 -->
            <NButton v-if="appInfo" size="small" @click="toggleUiWelcomePanel">
              <template #icon>
                <SvgIcon :icon="showUiWelcomePanel ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
              </template>
              {{ $t('ai.app_detail.ui_setting.card_title') }}
            </NButton>

            <!-- 调试按钮 -->
            <NButton v-if="appInfo?.appType === '1'" size="small" @click="handleDebug">
              <template #icon>
                <SvgIcon local-icon="mdi-bug-outline" />
              </template>
              {{ $t('ai.app_detail.debug') }}
            </NButton>

            <!-- 显示发布按钮 -->
            <NButton size="small" @click="handlePublish">
              <template #icon>
                <SvgIcon local-icon="mdi-rocket-launch" />
              </template>
              {{ $t('ai.app_detail.publish_btn') }}
            </NButton>

            <!-- 已发布时显示运行下拉菜单 -->
            <template v-if="isPublished">
              <NDropdown trigger="hover" :options="runOptions" @select="handleRunSelect">
                <NButton size="small" type="primary">
                  <template #icon>
                    <SvgIcon local-icon="mdi-play" />
                  </template>
                  {{ $t('ai.app_detail.run') }}
                </NButton>
              </NDropdown>
            </template>

            <div v-if="isPublished">
              <NSwitch v-model:value="publicAccessEnabled" class="rounded-none" size="large">
                <template #checked>{{ $t('ai.app_detail.public_access') }}</template>
                <template #unchecked>{{ $t('ai.app_detail.public_access') }}</template>
              </NSwitch>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置面板区域 -->
      <div
        v-if="(isSystemTemplateApp && showConfigPanel) || showUiWelcomePanel"
        class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700"
      >
        <NGrid :cols="1" x-gap="16" responsive="screen">
          <!-- 系统模版应用配置面板 -->
          <NGridItem v-if="isSystemTemplateApp">
            <NCollapseTransition :show="showConfigPanel">
              <SystemTemplateConfigPanel
                v-if="appInfo"
                ref="systemTemplateConfigRef"
                :app-id="appId"
                :app-name="appInfo.appName"
                :model-id="appInfo.modelId"
                :knowledge-ids="appInfo.knowledgeIds"
                :model-setting="appInfo.modelSetting"
                :graph-data="appInfo.graphData"
                @update="loadAppInfo"
              />
            </NCollapseTransition>
          </NGridItem>

          <!-- 对话界面 / 欢迎页配置面板 -->
          <NGridItem>
            <NCollapseTransition :show="showUiWelcomePanel">
              <UiSettingPanel
                v-if="appInfo"
                :app-id="appId"
                :app-name="appInfo.appName"
                :ui-setting="appInfo.uiSetting"
                @update="loadAppInfo"
              />
            </NCollapseTransition>
          </NGridItem>
        </NGrid>
      </div>
    </NCard>

    <!-- 监控统计区域 -->
    <AppMonitorPanel v-if="appId" :app-id="appId" />
    <AppOperateModal v-model:visible="modalVisible" :app-type="appType" @success="id => onModalClose(id, appType)" />
    <DebugChatDialog v-model:visible="showDebugDialog" :app-id="appId" :app-name="appInfo?.appName || ''" />

    <AppEmbedModal v-model:show="showEmbedModal" :app-id="appId" :app-token="currentAppToken" />
  </div>
</template>
