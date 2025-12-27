<script setup lang="ts">
import { ref } from 'vue';
import ProviderList from './modules/provider-list.vue';
import ModelList from './modules/model-list.vue';

const currentProviderId = ref<number | null>(null);
const currentProviderType = ref<'1' | '2' | null>('1');

function handleSelectProvider(data: { id: number | null; type: '1' | '2' | null }) {
  currentProviderId.value = data.id;
  currentProviderType.value = data.type;
}
</script>

<template>
  <TableSiderLayout default-expanded sider-title="供应商">
    <!-- 左侧供应商列表 -->
    <template #sider>
      <ProviderList @select="handleSelectProvider" />
    </template>

    <!-- 右侧模型列表 -->
    <ModelList :provider-id="currentProviderId" :provider-type="currentProviderType" />
  </TableSiderLayout>
</template>

<style scoped></style>
