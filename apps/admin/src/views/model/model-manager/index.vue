<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NAlert } from 'naive-ui';
import { useBoolean as useBool } from '@sa/hooks';
import { fetchModelProviders } from '@/service/api/ai/model';
import { fetchKnowledgeBaseConfig } from '@/service/api/ai/knowledge';
import ProviderList from './modules/provider-list.vue';
import ModelList from './modules/model-list.vue';
import ProviderManageModal from './modules/provider-manage-modal.vue';

const currentProviderId = ref<CommonType.IdType | null>(null);
const currentProviderType = ref<'1' | '2' | null>(null);

const providers = ref<Api.AI.Admin.ModelProvider[]>([]);
const providersLoading = ref(false);
const showMissingModelAlert = ref(false);

async function loadProviders() {
  providersLoading.value = true;
  const { data } = await fetchModelProviders();
  if (data) {
    providers.value = data;
  }
  providersLoading.value = false;
}

async function checkDefaultEmbeddingModel() {
  try {
    const { data } = await fetchKnowledgeBaseConfig();
    if (data && data.unifiedEmbeddingModel === true && data.hasDefaultEmbeddingModel === false) {
      showMissingModelAlert.value = true;
    }
  } catch {
    // ignore
  }
}

function handleSelectProvider(data: { id: CommonType.IdType | null; type: '1' | '2' | null }) {
  currentProviderId.value = data.id;
  currentProviderType.value = data.type;
}

const { bool: providerModalVisible, setTrue: openProviderModal, setFalse: closeProviderModal } = useBool();

function handleProviderManageSuccess() {
  loadProviders();
  closeProviderModal();
}

onMounted(() => {
  checkDefaultEmbeddingModel();
  loadProviders();
});
</script>

<template>
  <TableSiderLayout default-expanded :sider-title="undefined">
    <!-- 统一向量模型模式下，缺少全局默认向量模型的警告 -->
    <NAlert v-if="showMissingModelAlert" type="warning" class="mb-3" title="考试默认向量模型">
      当前已开启「统一向量模型」模式，但确认尚未设置默认向量模型。请尽快为某个向量模型点击「设为默认」，否则向量化功能可能无法正常工作。
    </NAlert>

    <!-- 左侧供应商列表 -->
    <template #sider>
      <ProviderList :list="providers" :loading="providersLoading" @select="handleSelectProvider">
        <template #extra>
          <SvgIcon
            local-icon="mdi-settings"
            secondary
            ghost
            class="cursor-pointer"
            size="18"
            quaternary
            @click="openProviderModal"
          />
        </template>
      </ProviderList>
    </template>

    <!-- 右侧模型列表 -->
    <ModelList :provider-id="currentProviderId" :provider-type="currentProviderType" :providers="providers" />

    <ProviderManageModal v-model:visible="providerModalVisible" @success="handleProviderManageSuccess" />
  </TableSiderLayout>
</template>
