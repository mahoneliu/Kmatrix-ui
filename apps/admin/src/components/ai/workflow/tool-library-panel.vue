<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NSpin } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchBuiltinToolList } from '@/service/api/ai/builtin-tool';
import { fetchGetSkillList } from '@/service/api/ai/skill';
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
const skills = ref<Api.Ai.Skill.Info[]>([]);

// 获取工具节点的基本定义（用于图标和颜色）
const toolNodeDef = computed(() => nodeDefinitionStore.getNodeDefinition('TOOL'));
const toolIcon = computed(() => toolNodeDef.value?.nodeIcon || 'mdi-tools');
const toolColor = computed(() => toolNodeDef.value?.nodeColor || '#0d9488');

const skillNodeDef = computed(() => nodeDefinitionStore.getNodeDefinition('SKILL'));
const skillIcon = computed(() => skillNodeDef.value?.nodeIcon || 'mdi-brain');
const skillColor = computed(() => skillNodeDef.value?.nodeColor || '#ef4444');

onMounted(async () => {
  loading.value = true;
  try {
    const builtinRes = await fetchBuiltinToolList();
    if (builtinRes.data) {
      builtinTools.value = builtinRes.data;
    }

    const skillRes = await fetchGetSkillList({ pageNum: 1, pageSize: 100, skillName: '', status: '0' });
    if (skillRes.data?.rows) {
      skills.value = skillRes.data.rows;
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

  // 先解析 initParams（启动参数），再解析 inputSchema（运行参数）；同名 key 以 inputSchema 为准
  const initParamMap = new Map<string, any>();
  if (!isMcp && toolRef.initParams) {
    try {
      const initArr = typeof toolRef.initParams === 'string' ? JSON.parse(toolRef.initParams) : toolRef.initParams;
      if (Array.isArray(initArr)) {
        initArr.forEach((p: any) => {
          const paramKey = p.name;
          const entry = {
            key: paramKey,
            label: p.displayName || p.name,
            type: p.type === 'integer' ? 'number' : p.type || 'string',
            required: Boolean(p.required),
            defaultValue: p.defaultValue,
            description: p.description || '',
            isInitParam: true
          };
          initParamMap.set(paramKey, entry);
        });
      }
    } catch {
      // ignore
    }
  }

  // 解析 inputSchema，结果保存到 map（覆盖同名 initParam）
  const inputSchemaMap = new Map<string, any>();
  if (!isMcp && toolRef.inputSchema) {
    try {
      const schema = JSON.parse(toolRef.inputSchema);
      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          const prop = schema.properties[key];
          inputSchemaMap.set(key, {
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

  // 合并：initParams 先放，inputSchema 覆盖同名
  const mergedMap = new Map<string, any>([...initParamMap, ...inputSchemaMap]);
  const parsedInputs: any[] = Array.from(mergedMap.values());

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
      emit('dragStart', { type: 'TOOL', x: startX, y: startY, extraData });
      cleanup();
    }
  };

  onUp = () => {
    if (!isDrag) {
      emit('select', 'TOOL', extraData);
    }
    cleanup();
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function handleSkillMouseDown(e: MouseEvent, skill: Api.Ai.Skill.Info) {
  const startX = e.clientX;
  const startY = e.clientY;
  let isDrag = false;

  const nodeColor = skillColor.value;
  const nodeIcon = skillIcon.value;
  const nodeLabel = skill.skillName;
  const description = skill.spec || '';

  const parsedInputs: any[] = [];
  if (skill.inputSchema) {
    try {
      const schema = typeof skill.inputSchema === 'string' ? JSON.parse(skill.inputSchema) : skill.inputSchema;
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
  if (skill.outputSchema) {
    try {
      const schema = typeof skill.outputSchema === 'string' ? JSON.parse(skill.outputSchema) : skill.outputSchema;
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
      skillId: skill.skillId,
      outputs: parsedOutputs
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
      emit('dragStart', { type: 'SKILL', x: startX, y: startY, extraData });
      cleanup();
    }
  };

  onUp = () => {
    if (!isDrag) {
      emit('select', 'SKILL', extraData);
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
      <div v-if="skills.length > 0" class="mb-4">
        <div class="mb-2 pl-1 text-3 c-gray-6 font-bold">{{ $t('ai.skill.label') }}</div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="skill in skills"
            :key="'skill-' + skill.skillId"
            class="hover:bg-primary-1 dark:hover:bg-primary-1 flex cursor-pointer select-none items-center gap-2.5 b-1 b-gray-2 rounded-2 b-solid bg-gray-1 px-1 py-1 transition-all dark:b-dark-3 hover:b-primary dark:bg-dark-2"
            @mousedown="handleSkillMouseDown($event, skill)"
          >
            <div
              class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-2"
              :style="{
                backgroundColor: getNodeIconBackground(skillColor),
                color: skillColor
              }"
            >
              <SvgIcon :local-icon="skillIcon" class="text-lg" />
            </div>
            <div class="flex-1 truncate text-3 c-gray-7 font-500 leading-tight dark:c-gray-2" :title="skill.skillName">
              {{ skill.skillName }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="builtinTools.length > 0" class="mb-4">
        <div class="mb-2 pl-1 text-3 c-gray-6 font-bold">{{ $t('ai.workflow.builtin_tools') }}</div>
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

      <div
        v-if="!loading && builtinTools.length === 0 && skills.length === 0"
        class="py-8 text-center text-sm c-gray-5"
      >
        {{ $t('ai.skill.noAvailableToolsOrSkills') }}
      </div>
    </NSpin>
  </div>
</template>
