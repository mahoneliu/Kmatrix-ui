<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  fetchConnectionRuleList,
  fetchEnabledNodeTypes,
  saveConnectionRuleInbound,
  saveConnectionRuleMatrix
} from '@/service/api/ai/connection-rule';
import { useNodeDefinitionStore } from '@/store/modules/ai/node-definition';

defineOptions({ name: 'ConnectionRuleMatrixView' });

interface Props {
  mode: 'whitelist' | 'blacklist';
}

const props = defineProps<Props>();

const nodeTypes = ref<Api.AI.ConnectionRule.NodeType[]>([]);
const selectedNodeType = ref<string>('');
const loadingRules = ref(false);
const saving = ref(false);
const savingInbound = ref(false);

// 入边：可编辑
const inboundChecked = ref<string[]>([]);
// 出边：可编辑，保存时全量替换
const outboundChecked = ref<string[]>([]);

// 可连入来源候选：排除 END（END 无出边）
const inboundCandidates = computed(() => nodeTypes.value.filter(n => n.nodeType !== 'END'));
// 可连出目标候选：排除 START（START 无入边）
const outboundCandidates = computed(() => nodeTypes.value.filter(n => n.nodeType !== 'START'));

const currentRuleType = computed(() => (props.mode === 'whitelist' ? '0' : '1'));
const modeLabel = computed(() => (props.mode === 'whitelist' ? '白名单（勾选=允许）' : '黑名单（勾选=禁止）'));

const inboundLabel = computed(() => (props.mode === 'whitelist' ? '可连入来源' : '禁止连入来源'));
const outboundLabel = computed(() => (props.mode === 'whitelist' ? '可连出目标' : '禁止连出目标'));
const inboundTooltip = computed(() =>
  props.mode === 'whitelist'
    ? `哪些节点可以连接到 ${selectedNodeType.value}（由对应节点的出边规则决定）`
    : `哪些节点禁止连接到 ${selectedNodeType.value}（由对应节点的出边规则决定）`
);
const outboundTooltip = computed(() =>
  props.mode === 'whitelist'
    ? `${selectedNodeType.value} 可以连接到哪些节点`
    : `${selectedNodeType.value} 禁止连接到哪些节点`
);

const nodeDefinitionStore = useNodeDefinitionStore();

async function loadNodeTypes() {
  const { data } = await fetchEnabledNodeTypes();
  if (data) nodeTypes.value = data;
}

async function loadRulesForNode(nodeType: string) {
  if (!nodeType) return;
  loadingRules.value = true;
  try {
    const { data: inData } = await fetchConnectionRuleList({ targetNodeType: nodeType, pageSize: 200 });
    const { data: outData } = await fetchConnectionRuleList({ sourceNodeType: nodeType, pageSize: 200 });

    const ruleType = currentRuleType.value;
    // 入边：其他节点出边规则中 target=当前节点 的 source 列表
    inboundChecked.value = (inData?.rows || [])
      .filter((r: Api.AI.ConnectionRule.Rule) => r.ruleType === ruleType)
      .map((r: Api.AI.ConnectionRule.Rule) => r.sourceNodeType);
    // 出边可编辑
    outboundChecked.value = (outData?.rows || [])
      .filter((r: Api.AI.ConnectionRule.Rule) => r.ruleType === ruleType)
      .map((r: Api.AI.ConnectionRule.Rule) => r.targetNodeType);
  } finally {
    loadingRules.value = false;
  }
}

async function selectNode(nodeType: string) {
  selectedNodeType.value = nodeType;
  await loadRulesForNode(nodeType);
}

async function handleSaveInbound() {
  if (!selectedNodeType.value) return;
  savingInbound.value = true;
  try {
    const { error } = await saveConnectionRuleInbound({
      targetNodeType: selectedNodeType.value,
      inboundSources: inboundChecked.value,
      ruleType: currentRuleType.value
    });
    if (!error) {
      window.$message?.success('入边规则保存成功');
      await loadRulesForNode(selectedNodeType.value);
      nodeDefinitionStore.reloadConnectionRules();
    }
  } finally {
    savingInbound.value = false;
  }
}

async function handleSave() {
  if (!selectedNodeType.value) return;
  saving.value = true;
  try {
    const { error } = await saveConnectionRuleMatrix({
      sourceNodeType: selectedNodeType.value,
      outboundTargets: outboundChecked.value,
      ruleType: currentRuleType.value
    });
    if (!error) {
      window.$message?.success('保存成功');
      await loadRulesForNode(selectedNodeType.value);
      // 刷新 store，让已打开的工作流编辑器立即生效
      nodeDefinitionStore.reloadConnectionRules();
    }
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.mode,
  () => {
    if (selectedNodeType.value) {
      loadRulesForNode(selectedNodeType.value);
    }
  }
);

async function reload() {
  if (selectedNodeType.value) {
    await loadRulesForNode(selectedNodeType.value);
  }
}
defineExpose({ reload });

onMounted(async () => {
  await loadNodeTypes();
  if (nodeTypes.value.length > 0) {
    await selectNode(nodeTypes.value[0].nodeType);
  }
});
</script>

<template>
  <div class="h-full min-h-0 flex gap-16px overflow-hidden">
    <!-- 左侧节点列表 -->
    <div class="min-h-0 w-160px flex flex-col flex-shrink-0 overflow-hidden card-wrapper">
      <div
        class="flex-shrink-0 border-b border-gray-100 px-12px py-6px text-xs text-gray-500 font-bold tracking-wider uppercase dark:border-dark-3"
      >
        节点列表
      </div>
      <NScrollbar class="min-h-0 flex-1">
        <NList hoverable clickable :show-divider="false">
          <NListItem
            v-for="node in nodeTypes"
            :key="node.nodeType"
            :class="{ 'node-item-selected': selectedNodeType === node.nodeType }"
            class="node-item"
            @click="selectNode(node.nodeType)"
          >
            <div class="w-full">
              <NTooltip trigger="hover" placement="right">
                <template #trigger>
                  <span
                    class="cursor-help truncate border-b border-gray-200 border-dashed text-sm font-medium dark:border-gray-600"
                  >
                    {{ node.nodeLabel }}
                  </span>
                </template>
                {{ node.nodeType }}
              </NTooltip>
            </div>
          </NListItem>
        </NList>
      </NScrollbar>
    </div>
    <!-- 右侧规则编辑区 -->
    <div class="min-h-0 min-w-0 flex flex-col flex-1 overflow-hidden card-wrapper">
      <!-- header -->
      <div
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-12px py-10px dark:border-dark-3"
      >
        <span class="text-sm font-medium">
          {{ selectedNodeType ? `${selectedNodeType} 的连接规则` : '请选择节点' }}
        </span>
        <NSpace align="center">
          <NTag :type="mode === 'whitelist' ? 'success' : 'warning'" size="small">
            {{ modeLabel }}
          </NTag>
        </NSpace>
      </div>
      <!-- content -->
      <div class="min-h-0 flex flex-1 gap-16px overflow-hidden p-12px">
        <template v-if="selectedNodeType">
          <!-- 连入来源 -->
          <div
            class="min-w-0 flex flex-col flex-1 overflow-hidden border border-blue-200 rounded-8px dark:border-blue-800"
          >
            <div class="flex flex-shrink-0 items-center justify-between bg-blue-50 px-12px py-8px dark:bg-blue-900/20">
              <div class="flex items-center gap-6px text-sm text-blue-700 font-medium dark:text-blue-300">
                <icon-ic-round-login class="text-base" />
                {{ inboundLabel }}
                <NTooltip>
                  <template #trigger>
                    <icon-ic-round-info class="cursor-help text-blue-400" />
                  </template>
                  {{ inboundTooltip }}
                </NTooltip>
                <NSpin v-if="loadingRules" size="small" />
              </div>
              <NButton
                type="primary"
                size="tiny"
                :loading="savingInbound"
                :disabled="loadingRules"
                @click="handleSaveInbound"
              >
                保存
              </NButton>
            </div>
            <NScrollbar class="min-h-0 flex-1" content-style="padding: 10px 12px;">
              <NCheckboxGroup v-model:value="inboundChecked">
                <div class="flex flex-col gap-4px">
                  <NCheckbox
                    v-for="node in inboundCandidates"
                    :key="node.nodeType"
                    :value="node.nodeType"
                    :disabled="node.nodeType === selectedNodeType"
                  >
                    <span class="text-sm">{{ node.nodeLabel }}</span>
                    <span class="ml-4px text-xs text-gray-400">({{ node.nodeType }})</span>
                  </NCheckbox>
                </div>
              </NCheckboxGroup>
            </NScrollbar>
          </div>

          <!-- 连出目标 -->
          <div
            class="min-w-0 flex flex-col flex-1 overflow-hidden border border-green-200 rounded-8px dark:border-green-800"
          >
            <div
              class="flex flex-shrink-0 items-center justify-between bg-green-50 px-12px py-8px dark:bg-green-900/20"
            >
              <div class="flex items-center gap-6px text-sm text-green-700 font-medium dark:text-green-300">
                <icon-ic-round-logout class="text-base" />
                {{ outboundLabel }}
                <NTooltip>
                  <template #trigger>
                    <icon-ic-round-info class="cursor-help text-green-400" />
                  </template>
                  {{ outboundTooltip }}
                </NTooltip>
                <NSpin v-if="loadingRules" size="small" />
              </div>
              <NButton type="primary" size="tiny" :loading="saving" :disabled="loadingRules" @click="handleSave">
                保存
              </NButton>
            </div>
            <NScrollbar class="min-h-0 flex-1" content-style="padding: 10px 12px;">
              <NCheckboxGroup v-model:value="outboundChecked">
                <div class="flex flex-col gap-4px">
                  <NCheckbox
                    v-for="node in outboundCandidates"
                    :key="node.nodeType"
                    :value="node.nodeType"
                    :disabled="node.nodeType === selectedNodeType"
                  >
                    <span class="text-sm">{{ node.nodeLabel }}</span>
                    <span class="ml-4px text-xs text-gray-400">({{ node.nodeType }})</span>
                  </NCheckbox>
                </div>
              </NCheckboxGroup>
            </NScrollbar>
          </div>
        </template>

        <NEmpty v-else description="请从左侧选择一个节点" class="m-auto" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.node-item {
  margin: 2px 8px;
  border-radius: 6px;
  border: 1.5px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

/* 覆盖 naive-ui 默认的列表项内边距，达到极致紧凑的效果 */
:deep(.n-list-item) {
  padding: 4px 10px !important;
}

.node-item:hover {
  border-color: rgba(24, 160, 88, 0.3);
  background-color: rgba(24, 160, 88, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.node-item-selected {
  border-color: #18a058 !important;
  background-color: rgba(24, 160, 88, 0.08) !important;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.15);
}

/* 选中状态的小装饰：右侧点缀 */
.node-item-selected::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 12px;
  background-color: #18a058;
  border-radius: 2px;
}

/* 适配暗黑模式 */
:deep(.dark) .node-item:hover {
  background-color: rgba(24, 160, 88, 0.12);
}

:deep(.dark) .node-item-selected {
  background-color: rgba(24, 160, 88, 0.2) !important;
}
</style>
