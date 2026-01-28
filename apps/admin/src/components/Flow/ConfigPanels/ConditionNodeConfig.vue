<script setup lang="ts">
/**
 * 条件节点配置面板
 *
 * @author Mahone
 * @date 2026-01-19
 */
import { ref, watch } from 'vue';
import { NButton, NCard, NForm, NFormItem, NInput, NSwitch } from 'naive-ui';
import type { Node } from '@vue-flow/core';
import ConditionBuilder from '../ConditionBuilder.vue';

const props = defineProps<{
  node: Node;
}>();

const emit = defineEmits<{
  update: [config: Workflow.ConditionConfig];
}>();

// 创建默认空分支
function createDefaultBranch(index: number): Workflow.ConditionBranch {
  return {
    name: `分支 ${index + 1}`,
    handleId: `condition-${index}`,
    condition: {
      type: 'group',
      logicalOperator: 'AND',
      conditions: []
    }
  };
}

// 配置数据
const config = ref<Workflow.ConditionConfig>({
  branches: props.node.data.config?.branches || [createDefaultBranch(0)],
  hasDefaultBranch: props.node.data.config?.hasDefaultBranch ?? true
});

// 添加分支
function addBranch() {
  const index = config.value.branches.length;
  config.value.branches.push(createDefaultBranch(index));
}

// 删除分支
function removeBranch(index: number) {
  config.value.branches.splice(index, 1);
  // 重新分配 handleId
  config.value.branches.forEach((branch, i) => {
    branch.handleId = `condition-${i}`;
  });
}

// 监听配置变化
watch(
  config,
  newConfig => {
    emit('update', newConfig);
  },
  { deep: true }
);
</script>

<template>
  <NForm label-placement="top" :show-feedback="false">
    <div class="bg-primary-1 dark:c-primary-1 mb-4 rounded p-3 text-sm c-primary dark:bg-primary/10">
      <div class="mb-1 font-bold">条件节点说明:</div>
      <ul class="mt-1 list-disc list-inside">
        <li>可以添加多个条件分支 (IF / ELSE IF)</li>
        <li>每个分支可以配置多个条件规则</li>
        <li>支持 AND/OR 逻辑组合和嵌套</li>
        <li>默认分支 (ELSE) 在所有条件都不满足时执行</li>
      </ul>
    </div>

    <!-- 默认分支开关 -->
    <NFormItem label="启用默认分支 (ELSE)">
      <NSwitch v-model:value="config.hasDefaultBranch" />
    </NFormItem>

    <!-- 分支管理 -->
    <div class="mb-4">
      <NButton type="primary" size="small" @click="addBranch">
        <template #icon>
          <SvgIcon icon="mdi:plus" />
        </template>
        添加分支
      </NButton>
    </div>

    <!-- 分支列表 -->
    <div v-for="(branch, index) in config.branches" :key="index" class="mb-4">
      <NCard :title="`分支 ${index + 1}`" size="small">
        <template #header-extra>
          <NButton text type="error" size="small" @click="removeBranch(index)">
            <template #icon>
              <SvgIcon icon="mdi:delete" />
            </template>
          </NButton>
        </template>

        <NFormItem label="分支名称">
          <NInput v-model:value="branch.name" placeholder="输入分支名称" />
        </NFormItem>

        <NFormItem label="条件配置">
          <ConditionBuilder v-model="branch.condition" :node-id="node.id" />
        </NFormItem>
      </NCard>
    </div>

    <!-- 空状态 -->
    <div
      v-if="config.branches.length === 0"
      class="border border-gray-3 rounded-2 border-dashed p-6 text-center c-gray-4"
    >
      <SvgIcon icon="mdi:information-outline" class="mb-2 text-2xl" />
      <div>暂无条件分支</div>
      <div class="mt-1 text-xs">点击上方按钮添加分支</div>
    </div>
  </NForm>
</template>
