<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchModelProviders } from '@/service/api/ai/model';
import ProviderList from './modules/provider-list.vue';
import ModelList from './modules/model-list.vue';
import ProviderManageModal from './modules/provider-manage-modal.vue';

const currentProviderId = ref<CommonType.IdType | null>(null);
const currentProviderType = ref<'1' | '2' | null>(null);

const providers = ref<Api.AI.Admin.ModelProvider[]>([]);
const providersLoading = ref(false);

async function loadProviders() {
  providersLoading.value = true;
  const { data } = await fetchModelProviders();
  if (data) {
    providers.value = data;
  }
  providersLoading.value = false;
}

function handleSelectProvider(data: { id: CommonType.IdType | null; type: '1' | '2' | null }) {
  currentProviderId.value = data.id;
  currentProviderType.value = data.type;
}

const { bool: providerModalVisible, setTrue: openProviderModal, setFalse: closeProviderModal } = useBoolean();

function handleProviderManageSuccess() {
  loadProviders();
  closeProviderModal();
}

onMounted(() => {
  loadProviders();
});
</script>

<template>
  <TableSiderLayout default-expanded sider-title="供应商">
    <template #header-extra>
      <SvgIcon
        local-icon="mdi-settings"
        secondary
        ghost
        class="cursor-pointer"
        size="16"
        quaternary
        @click="openProviderModal"
      />
    </template>

    <!-- 左侧供应商列表 -->
    <template #sider>
      <ProviderList :list="providers" :loading="providersLoading" @select="handleSelectProvider" />
    </template>

    <!-- 右侧模型列表 -->
    <ModelList :provider-id="currentProviderId" :provider-type="currentProviderType" :providers="providers" />
  </TableSiderLayout>

  <ProviderManageModal v-model:visible="providerModalVisible" @success="handleProviderManageSuccess" />
</template>

<style scoped></style>
