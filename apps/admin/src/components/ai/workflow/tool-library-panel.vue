<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NSpin } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { getNodeIconBackground } from '@/utils/color';

interface Emits {
  (e: 'select', nodeType: Workflow.NodeType, extraData?: Partial<Workflow.NodeData>): void;
  (
    e: 'dragStart',
    data: { type: Workflow.NodeType; x: number; y: number; extraData?: Partial<Workflow.NodeData> }
  ): void;
}

const emit = defineEmits<Emits>();

const nodeDefinitionStore = useNodeDefinitionStore();
const loading = ref(false);
const builtinTools = ref<Api.Ai.BuiltinToolVo[]>([]);

// 获取工具节点的基本定义（用于图标和颜色）
const toolNodeDef = computed(() => nodeDefinitionStore.getNodeDefinition('TOOL'));
const toolIcon = computed(() => toolNodeDef.value?.nodeIcon || 'mdi-tools');
const toolColor = computed(() => toolNodeDef.value?.nodeColor || '#0d9488');

// MCP 默认配置（如果需要区分，也可以在定义里加，暂时使用固定图标）
// const mcpIcon = 'mdi-api';
// const mcpColor = '#8a2be2';

onMounted(async () => {
  loading.value = true;
  try {
    const builtinRes = await fetchBuiltinToolList();

    if (builtinRes.data) {
      builtinTools.value = builtinRes.data;
    }
  } finally {
    loading.value = false;
  }
});

function handleMouseDown(e: MouseEvent, toolRef: any, isMcp: boolean) {
  const startX = e.clientX;
  const startY = e.clientY;
  let isDrag = false;

  const nodeColor = toolColor.value;
  const nodeIcon = toolIcon.value;
  const nodeLabel = isMcp ? toolRef.serverName : toolRef.toolName;
  const description = toolRef.spec || toolRef.description || '';

  const parsedInputs: any[] = [];
  if (!isMcp && toolRef.inputSchema) {
    try {
      const schema = JSON.parse(toolRef.inputSchema);
      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          const prop = schema.properties[key];
          parsedInputs.push({
            key,
            label: prop.description || key,
            type: prop.type === 'integer' ? 'number' : prop.type || 'string',
            required: schema.required ? schema.required.includes(key) : false,
            description: prop.description || ''
          });
        });
      }
    } catch {
      // ignore
    }
  }

  const parsedOutputs: any[] = [];
  if (!isMcp && toolRef.outputSchema) {
    try {
      const schema = JSON.parse(toolRef.outputSchema);
      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          const prop = schema.properties[key];
          parsedOutputs.push({
            key,
            label: prop.description || key,
            type: prop.type === 'integer' ? 'number' : prop.type || 'string',
            required: schema.required ? schema.required.includes(key) : false,
            description: prop.description || ''
          });
        });
      }
    } catch {
      // ignore
    }
  }

  const extraData: Partial<Workflow.NodeData> = {
    nodeLabel,
    nodeColor,
    nodeIcon,
    description,
    customInputParams: parsedInputs,
    config: {
      tool: {
        type: isMcp ? 'mcp' : 'builtin',
        id: isMcp ? toolRef.serverId : toolRef.toolId,
        outputs: parsedOutputs
      }
    }
  };

  let onMove: (mv: MouseEvent) => void;
  let onUp: () => void;

  const cleanup = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };

  onMove = (mv: MouseEvent) => {
    if (!isDrag && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 5) {
      isDrag = true;
      // 注意：这里的类型强制使用 'TOOL' 节点去渲染工具
      emit('dragStart', { type: 'TOOL' as any, x: startX, y: startY, extraData });
      cleanup();
    }
  };

  onUp = () => {
    if (!isDrag) {
      emit('select', 'TOOL' as any, extraData);
    }
    cleanup();
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
</script>

<template>
  <div class="h-full w-full overflow-y-auto">
    <NSpin :show="loading">
      <div v-if="builtinTools.length > 0" class="mb-4">
        <div class="mb-2 pl-1 text-3 c-gray-6 font-bold">{{ $t('ai.workflow.builtin_tools', '内置工具') }}</div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="tool in builtinTools"
            :key="'builtin-' + tool.toolId"
            class="hover:bg-primary-1 dark:hover:bg-primary-1 flex cursor-pointer select-none items-center gap-2.5 b-1 b-gray-2 rounded-2 b-solid bg-gray-1 px-1 py-1 transition-all dark:b-dark-3 hover:b-primary dark:bg-dark-2"
            @mousedown="handleMouseDown($event, tool, false)"
          >
            <div
              class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-2"
              :style="{
                backgroundColor: getNodeIconBackground(toolColor),
                color: toolColor
              }"
            >
              <SvgIcon :local-icon="toolIcon" class="text-lg" />
            </div>
            <div class="flex-1 truncate text-3 c-gray-7 font-500 leading-tight dark:c-gray-2" :title="tool.toolName">
              {{ tool.toolName }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && builtinTools.length === 0" class="py-8 text-center text-sm c-gray-5">暂无可用的工具</div>
    </NSpin>
  </div>
</template>
