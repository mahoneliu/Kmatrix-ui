<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { NAlert, NButton } from 'naive-ui';
import { ChatPanel } from '@km/shared';
import { fetchGetAllSkillList } from '@/service/api/ai/skill';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';
import { useWorkflowStore } from '@/store/modules/ai/workflow';
import { useAiModelStore } from '@/store/modules/ai/ai-model';

interface AvailableSkill {
  skillId: string;
  skillName: string;
  spec: string;
}

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
const aiModelStore = useAiModelStore();

function getNodeDefinition(nodeType: string) {
  return nodeDefinitionStore.getNodeDefinition(nodeType);
}

const skills = ref<AvailableSkill[]>([]);

async function loadSkills() {
  try {
    const { data } = await fetchGetAllSkillList({ status: '0', skillName: '' });
    if (data) {
      skills.value = data.map((item: any) => ({
        skillId: String(item.skillId),
        skillName: item.skillName,
        spec: item.spec || ''
      }));
    }
  } catch {
    // Failed to load skills
  }
}

onMounted(async () => {
  await Promise.all([nodeDefinitionStore.loadNodeDefinitions(), aiModelStore.loadModels(), loadSkills()]);
});

// 计算当前应用模型的能力 (Multimodal Capabilities)
const capabilities = computed(() => {
  const caps = new Set<string>();

  // 遍历所有工作流节点收集多模态能力
  workflowStore.nodes.forEach(node => {
    const nodeType = node.data?.nodeType as string | undefined;

    // 根据节点类型直接补充对应能力
    if (nodeType === 'FILE_STORAGE') caps.add('file-storage');
    if (nodeType === 'FILE_PARSE') caps.add('file-parse');
    if (nodeType === 'AUDIO_ASR') caps.add('audio-asr');
    if (nodeType === 'IMAGE_OCR') caps.add('image-ocr');

    // 获取每个节点的 modelId（无论是 APP_INFO、大模型节点，还是图像识别节点）
    const modelId = node.data?.config?.modelId;
    if (modelId) {
      const model = aiModelStore.getModelById(modelId);
      if (model?.abilities) {
        let abilitiesArr: string[] = [];
        // 后端 KmModelVo 中 abilities 是 List<String>，前端对应 string[]
        if (Array.isArray(model.abilities)) {
          abilitiesArr = model.abilities.map(s => String(s).trim().toLowerCase());
        } else if (typeof (model.abilities as unknown) === 'string') {
          // 防御性：如果是逗号分隔的字符串
          abilitiesArr = (model.abilities as unknown as string).split(',').map((s: string) => s.trim().toLowerCase());
        }
        abilitiesArr.forEach(a => caps.add(a));
      }

      // 隐式补充由 modelType 带来的能力
      if (model?.modelType === '4') caps.add('audio');
      if (model?.modelType === '5') caps.add('vision');
      if (model?.modelType === '6') caps.add('video');
    }
  });

  return Array.from(caps);
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
    height: isMinimized.value ? '48px' : 'min(800px, calc(100vh - 120px))'
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
        <span class="text-14px tracking-tight">{{ appName }} - {{ $t('ai.chat.debug') }}</span>
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
          {{ $t('ai.chat.debug_tip1') }}
          <br />
          {{ $t('ai.chat.debug_tip2') }}
        </NAlert>
      </div>
      <ChatPanel
        mode="debug"
        is-admin
        :app-id="appId"
        :app-name="appName"
        :get-node-definition="getNodeDefinition"
        :available-skills="skills"
        :capabilities="capabilities"
        class="flex-1 overflow-hidden"
        @node-start="id => workflowStore.setRunningNodeId(id)"
        @node-end="() => workflowStore.setRunningNodeId(null)"
      />
    </div>
  </div>
</template>
