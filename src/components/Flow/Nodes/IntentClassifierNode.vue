<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { NButton, NInput, NSelect, useMessage } from 'naive-ui';
import type { NodeProps } from '@vue-flow/core';
import { Handle, Position } from '@vue-flow/core';
import { fetchModelList } from '@/service/api/ai/admin/model';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const props = defineProps<NodeProps>();
const emit = defineEmits<{
  sourceHandleClick: [event: MouseEvent, id: string];
}>();

const workflowStore = useWorkflowStore();
const message = useMessage();

// 防止循环更新的标志位
let isUpdating = false;

// 本地配置状态
const localConfig = ref<Workflow.IntentClassifierConfig>({
  modelId: props.data.config?.modelId,
  intents: props.data.config?.intents || []
});

// 模型选项
const modelOptions = ref<Array<{ label: string; value: CommonType.IdType }>>([]);
const loading = ref(false);

// 加载模型列表
async function loadModels() {
  loading.value = true;
  try {
    const res = await fetchModelList({ modelType: '1' });
    console.log('res:', res);
    if (res.data) {
      modelOptions.value = res.data.map((m: Api.AI.Admin.Model) => ({
        label: m.modelName,
        value: m.modelId
      }));
    }
  } catch {
    message.error('加载模型列表失败');
  } finally {
    loading.value = false;
  }
}

// 监听 props 变化同步到本地
watch(
  () => props.data.config,
  newVal => {
    if (isUpdating) return; // 防止循环
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(localConfig.value)) {
      isUpdating = true;
      // 深度合并或替换
      localConfig.value = {
        modelId: newVal.modelId,
        intents: newVal.intents || []
      };
      isUpdating = false;
    }
  },
  { deep: true, immediate: true }
);

// 监听本地配置变化,同步到 Store
watch(
  localConfig,
  newVal => {
    if (isUpdating) return; // 防止循环
    isUpdating = true;
    workflowStore.updateNodeConfig(props.id, JSON.parse(JSON.stringify(newVal)));
    isUpdating = false;
  },
  { deep: true }
);

// 添加意图
function addIntent() {
  const newIndex = localConfig.value.intents.length + 1;
  localConfig.value.intents.push(`意图${newIndex}`);
}

// 删除意图
function removeIntent(index: number) {
  // 删除与该意图 Handle 相关的边
  const handleId = `intent-${index}`;
  workflowStore.edges = workflowStore.edges.filter(e => !(e.source === props.id && e.sourceHandle === handleId));

  // 删除意图配置
  localConfig.value.intents.splice(index, 1);
}

// 处理 Handle 点击
function handleSourceHandleClick(e: MouseEvent, _index: number) {
  // 阻止冒泡，避免触发节点点击
  e.stopPropagation();
  // 触发 BaseNode 约定的事件，传递 ID 和事件对象
  // 注意：这里我们需要构建一个符合 BaseNode 预期的行为
  // index.vue 中监听的是 @source-handle-click="(e, id) => ..."
  // IntentClassifierNode 需要将此事件向上传递
  emit('sourceHandleClick', e, props.id);
}

onMounted(() => {
  loadModels();
});
</script>

<template>
  <!-- hide-source-handle="true" 隐藏 BaseNode 默认的输出点 -->
  <BaseNode
    v-slot="{ showHandles, isHandleConnected }"
    v-bind="props"
    :data="{ ...data, icon: 'mdi:brain' }"
    :hide-source-handle="true"
    class="intent-classifier-node"
  >
    <div class="min-w-60 flex flex-col gap-3">
      <!-- 模型选择 -->
      <div class="flex flex-col gap-1">
        <label class="text-xs c-gray-5">模型</label>
        <NSelect
          v-model:value="localConfig.modelId"
          :options="modelOptions"
          :loading="loading"
          placeholder="请选择推理模型"
          size="small"
          clearable
        />
      </div>

      <!-- 意图列表 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-xs c-gray-5">定义意图分支</label>
          <NButton dashed size="tiny" class="mr-5" @click="addIntent">
            <template #icon>
              <SvgIcon icon="mdi:plus" />
            </template>
          </NButton>
        </div>
        <div
          v-for="(intent, index) in localConfig.intents"
          :key="index"
          class="relative flex items-center justify-between gap-2"
        >
          <!-- 意图名称输入 -->
          <NInput v-model:value="localConfig.intents[index]" placeholder="意图名称" size="small" class="mr-2 flex-1" />

          <!-- 删除按钮 -->
          <NButton text type="error" size="tiny" @click="removeIntent(index)">
            <!-- <template #icon><div class="i-mdi:close" /></template> -->
            <SvgIcon icon="carbon:trash-can" class="mr-4 h-4 w-4 c-gray-5" />
          </NButton>

          <!-- 右侧输出点 (Handle) -->
          <!-- 使用 BaseNode 样式类 custom-handle custom-handle-source 以保持一致性 -->
          <!-- 使用 !static 让 handle 居中于 wrapper -->
          <!-- wrapper 使用 absolute positioning 手动对齐 (p-3 = 12px, handle 20px -> center at 0 -> wrapper right at -22px) -->
          <div class="right-1 h-full flex items-center justify-center">
            <Handle
              :id="`intent-${index}`"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source"
              :class="[
                { connected: isHandleConnected(`intent-${index}`) },
                { 'show-plus': !isHandleConnected(`intent-${index}`) && showHandles }
              ]"
              @mousedown="(e: MouseEvent) => handleSourceHandleClick(e, index)"
            />
          </div>
        </div>

        <!-- 默认/其他 分支 -->
        <div class="relative mt-1 flex items-center justify-between gap-2">
          <!-- <div class="flex-1 text-sm c-gray-5 pl-2">其他 (Else)</div> -->
          <NInput value="其他 (Else)" size="small" disabled class="mr-12 flex-1" />
          <div class="right-1 h-full flex items-center justify-center">
            <Handle
              id="else"
              type="source"
              :position="Position.Right"
              class="custom-handle custom-handle-source !bg-gray-2"
              :class="[{ 'show-plus': !isHandleConnected('else') }, { 'handles-visible': showHandles || selected }]"
              @click="(e: MouseEvent) => handleSourceHandleClick(e, -1)"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped>
/* 确保 Handle 在 hover 时才显示或一直显示，这里为了操作方便，建议一直显示或者适配 BaseNode 的逻辑 */
/* 为了简单起见，我们在 inline style 中强制了一部分样式，也可以在这里定义 */
:deep(.vue-flow__handle) {
  z-index: 10;
}
</style>
