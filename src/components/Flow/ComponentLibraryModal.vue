<script setup lang="ts">
import { NCard, NGrid, NGridItem, NModal } from 'naive-ui';
import { getAllNodeTypes } from '@/utils/workflow/node-registry';
import SvgIcon from '@/components/custom/svg-icon.vue';

interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', nodeType: Workflow.NodeType): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// 获取所有可用的节点类型(排除系统节点)
const availableNodeTypes = getAllNodeTypes().filter(n => !n.isSystem);

// 按分类组织节点类型
const nodeTypesByCategory = {
  basic: availableNodeTypes.filter(n => n.category === 'basic'),
  ai: availableNodeTypes.filter(n => n.category === 'ai'),
  logic: availableNodeTypes.filter(n => n.category === 'logic'),
  action: availableNodeTypes.filter(n => n.category === 'action')
};

function handleSelectNode(nodeType: Workflow.NodeType) {
  emit('select', nodeType);
  emit('update:visible', false);
}
</script>

<template>
  <NModal :show="visible" title="添加组件" preset="card" class="w-800px" @update:show="emit('update:visible', $event)">
    <div class="flex flex-col gap-6">
      <!-- 基础节点 -->
      <div v-if="nodeTypesByCategory.basic.length">
        <div class="mb-3 text-sm text-gray-700 font-bold">基础节点</div>
        <NGrid :cols="3" x-gap="12" y-gap="12">
          <NGridItem v-for="nodeType in nodeTypesByCategory.basic" :key="nodeType.type">
            <NCard
              :bordered="false"
              class="cursor-pointer transition-all hover:shadow-md"
              content-class="p-4"
              @click="handleSelectNode(nodeType.type)"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="h-12 w-12 flex items-center justify-center rounded-lg"
                  :style="{ backgroundColor: nodeType.color + '20' }"
                >
                  <SvgIcon :icon="nodeType.icon" class="text-2xl" :style="{ color: nodeType.color }" />
                </div>
                <div class="text-sm font-medium">{{ nodeType.label }}</div>
                <div class="text-xs text-gray-500">{{ nodeType.description }}</div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>

      <!-- AI 节点 -->
      <div v-if="nodeTypesByCategory.ai.length">
        <div class="mb-3 text-sm text-gray-700 font-bold">AI 节点</div>
        <NGrid :cols="3" x-gap="12" y-gap="12">
          <NGridItem v-for="nodeType in nodeTypesByCategory.ai" :key="nodeType.type">
            <NCard
              :bordered="false"
              class="cursor-pointer transition-all hover:shadow-md"
              content-class="p-4"
              @click="handleSelectNode(nodeType.type)"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="h-12 w-12 flex items-center justify-center rounded-lg"
                  :style="{ backgroundColor: nodeType.color + '20' }"
                >
                  <SvgIcon :icon="nodeType.icon" class="text-2xl" :style="{ color: nodeType.color }" />
                </div>
                <div class="text-sm font-medium">{{ nodeType.label }}</div>
                <div class="text-xs text-gray-500">{{ nodeType.description }}</div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>

      <!-- 逻辑节点 -->
      <div v-if="nodeTypesByCategory.logic.length">
        <div class="mb-3 text-sm text-gray-700 font-bold">逻辑节点</div>
        <NGrid :cols="3" x-gap="12" y-gap="12">
          <NGridItem v-for="nodeType in nodeTypesByCategory.logic" :key="nodeType.type">
            <NCard
              :bordered="false"
              class="cursor-pointer transition-all hover:shadow-md"
              content-class="p-4"
              @click="handleSelectNode(nodeType.type)"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="h-12 w-12 flex items-center justify-center rounded-lg"
                  :style="{ backgroundColor: nodeType.color + '20' }"
                >
                  <SvgIcon :icon="nodeType.icon" class="text-2xl" :style="{ color: nodeType.color }" />
                </div>
                <div class="text-sm font-medium">{{ nodeType.label }}</div>
                <div class="text-xs text-gray-500">{{ nodeType.description }}</div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>

      <!-- 动作节点 -->
      <div v-if="nodeTypesByCategory.action.length">
        <div class="mb-3 text-sm text-gray-700 font-bold">动作节点</div>
        <NGrid :cols="3" x-gap="12" y-gap="12">
          <NGridItem v-for="nodeType in nodeTypesByCategory.action" :key="nodeType.type">
            <NCard
              :bordered="false"
              class="cursor-pointer transition-all hover:shadow-md"
              content-class="p-4"
              @click="handleSelectNode(nodeType.type)"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="h-12 w-12 flex items-center justify-center rounded-lg"
                  :style="{ backgroundColor: nodeType.color + '20' }"
                >
                  <SvgIcon :icon="nodeType.icon" class="text-2xl" :style="{ color: nodeType.color }" />
                </div>
                <div class="text-sm font-medium">{{ nodeType.label }}</div>
                <div class="text-xs text-gray-500">{{ nodeType.description }}</div>
              </div>
            </NCard>
          </NGridItem>
        </NGrid>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.n-card:hover {
  border-color: var(--n-border-color-hover);
}
</style>
