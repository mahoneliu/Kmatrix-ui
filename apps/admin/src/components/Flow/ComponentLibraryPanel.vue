<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { NPopover } from 'naive-ui';
import { NODE_CATEGORY_LIST } from '@/constants/workflow';
import { useNodeDefinitionStore } from '@/store/modules/node-definition';
import { isValidConnection } from '@/utils/workflow/connection-rules';
import { getNodeIconBackground } from '@/utils/color';

interface Emits {
  (e: 'select', nodeType: Workflow.NodeType): void;
  (e: 'dragStart', data: { type: Workflow.NodeType; x: number; y: number }): void;
}

const props = defineProps<{
  sourceNode?: any;
}>();

const emit = defineEmits<Emits>();

// 使用 store
const nodeDefinitionStore = useNodeDefinitionStore();

// 在组件挂载时加载节点定义
onMounted(async () => {
  if (!nodeDefinitionStore.loaded) {
    await nodeDefinitionStore.loadNodeDefinitions();
  }
});

// 获取所有可用的节点类型(排除系统节点) - 使用 computed 确保响应式
const availableNodeTypes = computed(() => {
  const allNodes = nodeDefinitionStore.getAllNodeTypes();
  let filteredNodes = allNodes.filter(n => n.isSystem !== '1');

  // 如果有源节点，过滤掉不允许连接的节点
  if (props.sourceNode) {
    const sourceType = props.sourceNode.data.nodeType as Workflow.NodeType;
    filteredNodes = filteredNodes.filter(n => isValidConnection(sourceType, n.nodeType));
  }
  return filteredNodes;
});

// 定义分类配置
// 定义分类配置
const categories = NODE_CATEGORY_LIST;

// 按分类组织节点类型
const nodeTypesByCategory = computed(() =>
  categories
    .map(category => ({
      ...category,
      nodes: availableNodeTypes.value.filter(n => n.category === category.key)
    }))
    .filter(category => category.nodes.length > 0)
);

// 处理鼠标按下，检测拖拽或点击
function handleMouseDown(e: MouseEvent, nodeType: Workflow.NodeType) {
  const startX = e.clientX;
  const startY = e.clientY;
  let isDrag = false;

  // eslint-disable-next-line prefer-const
  let onMove: (mv: MouseEvent) => void;
  // eslint-disable-next-line prefer-const
  let onUp: () => void;

  const cleanup = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };

  onMove = (mv: MouseEvent) => {
    // 移动超过 5px 视为拖拽
    if (!isDrag && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 5) {
      isDrag = true;
      emit('dragStart', { type: nodeType, x: startX, y: startY });
      cleanup();
    }
  };

  onUp = () => {
    if (!isDrag) {
      emit('select', nodeType);
    }
    cleanup();
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
</script>

<template>
  <div class="max-h-125 w-110 overflow-y-auto rounded-2 bg-container p-4 shadow-lg">
    <!-- 循环渲染所有分类 -->
    <div
      v-for="(category, index) in nodeTypesByCategory"
      :key="category.key"
      :class="{ 'mb-4': index < nodeTypesByCategory.length - 1 }"
    >
      <div class="mb-2 pl-1 text-3 c-gray-6 font-bold">{{ category.label }}</div>
      <div class="grid grid-cols-2 gap-2">
        <!-- 循环渲染分类下的节点 -->
        <NPopover
          v-for="categoryNodes in category.nodes"
          :key="categoryNodes.nodeType"
          placement="right"
          trigger="hover"
          :show-arrow="false"
          :delay="1000"
          raw
        >
          <template #trigger>
            <div
              class="hover:bg-primary-1 dark:hover:bg-primary-1 flex cursor-pointer select-none items-center gap-2.5 b-1 b-gray-2 rounded-2 b-solid bg-white px-3 py-2 transition-all dark:b-dark-3 hover:b-primary dark:bg-dark-2"
              @mousedown="handleMouseDown($event, categoryNodes.nodeType)"
            >
              <div
                class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-2"
                :style="{
                  backgroundColor: getNodeIconBackground(categoryNodes.nodeColor),
                  color: categoryNodes.nodeColor
                }"
              >
                <SvgIcon :icon="categoryNodes.nodeIcon" class="text-lg" />
              </div>
              <div class="flex-1 text-3.5 c-gray-7 font-500 leading-tight dark:c-gray-2">
                {{ categoryNodes.nodeLabel }}
              </div>
            </div>
          </template>
          <!-- Popover 详情 -->
          <div class="max-w-65 rounded-2 bg-container p-3 shadow-md">
            <!-- 上部：图标 + 标题 -->
            <div class="mb-2 flex items-center gap-2.5">
              <div
                class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-2"
                :style="{
                  backgroundColor: getNodeIconBackground(categoryNodes.nodeColor),
                  color: categoryNodes.nodeColor
                }"
              >
                <SvgIcon :icon="categoryNodes.nodeIcon" class="text-xl" />
              </div>
              <div class="text-3.75 c-base-text font-600">{{ categoryNodes.nodeLabel }}</div>
            </div>
            <!-- 下部：描述 -->
            <div class="text-3.25 c-base-text leading-normal op-70">{{ categoryNodes.description }}</div>
          </div>
        </NPopover>
      </div>
    </div>
    <div v-if="nodeTypesByCategory.length < 1" class="text-ms c-gray-5">
      <SvgIcon icon="carbon:close-filled" class="mr-2 inline-block text-5 text-red-4" />
      没有节点可添加
    </div>
  </div>
</template>
