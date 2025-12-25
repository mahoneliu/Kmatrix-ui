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
  <div class="h-full flex gap-4 overflow-hidden">
    <!-- 左侧供应商列表 -->
    <div class="w-64 flex-shrink-0">
      <ProviderList @select="handleSelectProvider" />
    </div>

    <!-- 右侧模型列表 -->
    <div class="flex-1 overflow-hidden">
      <ModelList :provider-id="currentProviderId" :provider-type="currentProviderType" />
    </div>
  </div>
</template>

<style scoped></style>
