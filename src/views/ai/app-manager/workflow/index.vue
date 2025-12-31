<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NCard, NLayout, NLayoutContent, NLayoutSider, NSpace, useMessage } from 'naive-ui';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { fetchWorkflowList, saveWorkflow } from '@/service/api/ai-app';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

const route = useRoute();
const message = useMessage();
const appId = Number(route.query.appId);

const { toObject, addNodes, setNodes, setEdges } = useVueFlow();

const flowId = ref<number | null>(null);
const loading = ref(false);

// Mock Nodes for Drag & Drop
const nodeTypes = [
  { label: '开始', type: 'input', class: 'custom-node-start' },
  { label: 'LLM', type: 'default', class: 'custom-node-llm' },
  { label: '知识检索', type: 'default', class: 'custom-node-rag' },
  { label: '结束', type: 'output', class: 'custom-node-end' }
];

async function loadWorkflow() {
  if (!appId) return;
  loading.value = true;
  try {
    const { data } = await fetchWorkflowList({ appId, pageNo: 1, pageSize: 1 });
    if (data && data.rows && data.rows.length > 0) {
      const workflow = data.rows[0];
      flowId.value = workflow.flowId;
      if (workflow.graphData) {
        const graph = JSON.parse(workflow.graphData);
        setNodes(graph.nodes || []);
        setEdges(graph.edges || []);
      }
    } else {
      // Initialize empty
      addNodes([{ id: '1', type: 'input', label: 'Start', position: { x: 250, y: 5 } }]);
    }
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  if (!appId) {
    message.error('参数错误：缺少AppId');
    return;
  }
  const flowObject = toObject();
  const graphData = JSON.stringify(flowObject);

  // NOTE: Generate DSL from Graph
  const dslData = JSON.stringify({ nodes: flowObject.nodes, edges: flowObject.edges });

  try {
    await saveWorkflow({
      flowId: flowId.value || undefined,
      appId,
      graphData,
      dslData,
      version: 1, // logic handled by backend?
      isActive: 'Y'
    });
    message.success('保存成功');
    // Refresh to get ID if new
    loadWorkflow();
  } catch {
    //
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData('application/vueflow');
  if (!type) return;

  // project logic to convert screen coords to flow coords ...
  // For simplicity, just add at random or center
  const id = `node_${Date.now()}`;
  const newNode = {
    id,
    type: 'default', // simplified
    label: `${type} Node`,
    position: { x: event.offsetX, y: event.offsetY } // approximate
  };
  addNodes([newNode]);
}

function onDragStart(event: DragEvent, nodeType: any) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType.label);
    event.dataTransfer.effectAllowed = 'move';
  }
}

onMounted(() => {
  loadWorkflow();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <NCard :bordered="false" class="mb-2">
      <NSpace align="center" justify="space-between">
        <div class="text-lg font-bold">工作流编排</div>
        <NSpace>
          <NButton type="primary" @click="handleSave">保存</NButton>
        </NSpace>
      </NSpace>
    </NCard>

    <NLayout class="flex-1 overflow-hidden border border-gray-200 rounded-lg" has-sider>
      <NLayoutSider bordered content-style="padding: 16px;" width="200">
        <div class="mb-4 text-sm font-bold">组件库</div>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in nodeTypes"
            :key="item.label"
            class="flex cursor-move items-center justify-center border rounded bg-white p-2 shadow-sm hover:bg-gray-50"
            draggable="true"
            @dragstart="onDragStart($event, item)"
          >
            {{ item.label }}
          </div>
        </div>
      </NLayoutSider>

      <NLayoutContent class="relative bg-gray-50">
        <VueFlow class="h-full w-full" @dragover="onDragOver" @drop="onDrop">
          <Background />
          <Controls />
          <MiniMap />
        </VueFlow>
      </NLayoutContent>

      <NLayoutSider bordered content-style="padding: 16px;" width="240">
        <div class="mb-4 text-sm font-bold">属性配置</div>
        <div class="text-xs text-gray-400">选中节点配置属性...</div>
      </NLayoutSider>
    </NLayout>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
