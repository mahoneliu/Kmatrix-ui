<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { NAlert, NButton } from 'naive-ui';
import { ChatPanel } from '@km/shared';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

interface Props {
  visible: boolean;
  appId: string;
  appName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const nodeDefinitionStore = useNodeDefinitionStore();
const workflowStore = useWorkflowStore();

function getNodeDefinition(nodeType: string) {
  return nodeDefinitionStore.getNodeDefinition(nodeType);
}

onMounted(async () => {
  await nodeDefinitionStore.loadNodeDefinitions();
});

// 窗口状态
const isMinimized = ref(false);
const isMaximized = ref(false);

// 窗口样式
const dialogStyle = computed(() => {
  if (isMaximized.value) {
    return {
      right: '0px',
      top: '100px', // 避开顶部操作栏
      width: '50%',
      height: 'calc(100vh - 100px)',
      borderRadius: '0px'
    };
  }
  return {
    right: '20px',
    bottom: '20px',
    width: '500px',
    height: isMinimized.value ? '48px' : '800px'
  };
});

// 最小化/最大化
function toggleMinimize() {
  isMinimized.value = !isMinimized.value;
  if (isMinimized.value) isMaximized.value = false;
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;
  if (isMaximized.value) isMinimized.value = false;
}

// 关闭窗口
function handleClose() {
  emit('update:visible', false);
}

// 监听visible变化，重置状态
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      isMinimized.value = false;
      isMaximized.value = false;
    }
  }
);
</script>

<template>
  <div
    v-if="visible"
    class="fixed z-2000 flex flex-col overflow-hidden border border-[var(--n-divider-color)] rounded-12px bg-white shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 ease dark:bg-dark-1"
    :style="dialogStyle"
  >
    <!-- 标题栏：精致简约的蓝灰渐变设计 -->
    <div
      class="relative z-10 flex select-none items-center justify-between from-slate-100 to-zinc-200/60 bg-gradient-to-r px-16px py-10px shadow-sm dark:from-dark-2 dark:to-dark-1"
    >
      <div class="flex items-center text-slate-800 font-600 dark:text-white">
        <SvgIcon local-icon="mdi-bug-outline" class="mr-2 text-18px text-primary" />
        <span class="text-14px tracking-tight">{{ appName }} - 调试</span>
      </div>
      <div class="flex gap-4px">
        <NButton quaternary circle size="small" @click="toggleMinimize">
          <template #icon>
            <SvgIcon local-icon="mdi-minus" />
          </template>
        </NButton>
        <NButton quaternary circle size="small" @click="toggleMaximize">
          <template #icon>
            <SvgIcon :local-icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'" />
          </template>
        </NButton>
        <NButton quaternary circle size="small" @click="handleClose">
          <template #icon>
            <SvgIcon local-icon="mdi-close" />
          </template>
        </NButton>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-show="!isMinimized" class="flex flex-col flex-1 overflow-hidden bg-white p-0 dark:bg-dark-1">
      <div class="p-2">
        <NAlert type="info" size="medium" :bordered="false" closable>
          调试使用最新未发布版本，临时对话，数据不入库。
          <br />
          修改工作流保存即生效，无需重新打开窗口。
        </NAlert>
      </div>
      <ChatPanel
        mode="debug"
        is-admin
        :app-id="appId"
        :app-name="appName"
        :get-node-definition="getNodeDefinition"
        class="flex-1 overflow-hidden"
        @node-start="id => workflowStore.setRunningNodeId(id)"
        @node-end="() => workflowStore.setRunningNodeId(null)"
      />
    </div>
  </div>
</template>
