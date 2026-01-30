<script setup lang="ts">
/**
 * 变量提及组件
 * 支持 / 触发变量选择,用于工作流节点配置
 * 使用分组下拉菜单,与 ParamSelector 保持一致的视觉效果
 */
import { computed, h, nextTick, ref } from 'vue';
import { NInput, NPopover } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { PARAM_GLOBAL_COLORS, PARAM_GLOBAL_NODE_COLORS } from '@/constants/workflow';
import { useWorkflowStore } from '@/store/modules/workflow';
import { getAvailableParamsForNode } from '@/utils/workflow/param-resolver';
import { getNodeIconBackground } from '@/utils/color';

interface Props {
  /** 当前节点ID (用于获取可用参数) */
  nodeId?: string;
  modelValue: string;
  placeholder?: string | undefined;
  rows?: number | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  nodeId: undefined,
  placeholder: '输入 / 选择变量',
  rows: 3
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const workflowStore = useWorkflowStore();

// 下拉菜单状态
const showDropdown = ref(false);
const textareaRef = ref<any>(null);
const cursorPosition = ref(0);
const searchQuery = ref('');

// 构建分组选项 (复用 ParamSelector 的逻辑)
const groupedOptions = computed(() => {
  const groups: Array<{
    label: string;
    icon: string;
    color: string;
    options: Array<{ label: string; value: string }>;
  }> = [];

  if (!props.nodeId) return groups;

  const sources = getAvailableParamsForNode(props.nodeId, workflowStore.nodes, workflowStore.edges);

  sources.forEach(source => {
    if (!source.params?.length) return;

    // 确定图标和颜色
    let icon = 'mdi:earth';
    let color = PARAM_GLOBAL_COLORS;

    if (source.sourceKey === 'app') {
      icon = 'mdi:application';
      color = PARAM_GLOBAL_NODE_COLORS.app;
    } else if (source.sourceKey === 'interface') {
      icon = 'mdi:api';
      color = PARAM_GLOBAL_NODE_COLORS.interface;
    } else if (source.sourceKey === 'session') {
      icon = 'mdi:message-text';
      color = PARAM_GLOBAL_NODE_COLORS.session;
    } else if (source.type === 'node') {
      const node = workflowStore.nodes.find(n => n.id === source.sourceKey);
      if (node?.data?.nodeIcon) icon = node.data.nodeIcon;
      color = node?.data?.nodeColor || PARAM_GLOBAL_COLORS;
    }

    const options = source.params.map(param => {
      const value = source.type === 'global' ? `\${${param.key}}` : `\${${source.sourceKey}.${param.key}}`;
      return {
        label: `${param.label} - ${param.type}`,
        value
      };
    });

    groups.push({
      label: source.sourceName,
      icon,
      color,
      options
    });
  });

  return groups;
});

// 过滤后的分组选项
const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupedOptions.value;

  return groupedOptions.value
    .map(group => ({
      ...group,
      options: group.options.filter(opt => opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
    }))
    .filter(group => group.options.length > 0);
});

// 监听输入变化
function handleInput(value: string) {
  emit('update:modelValue', value);

  // 检查是否输入了 /
  const textarea = textareaRef.value?.textareaElRef;
  if (!textarea) return;

  const pos = textarea.selectionStart;
  const textBeforeCursor = value.substring(0, pos);
  const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

  if (lastSlashIndex !== -1 && pos - lastSlashIndex <= 20) {
    // 在 / 后面,显示下拉菜单
    cursorPosition.value = pos;
    searchQuery.value = textBeforeCursor.substring(lastSlashIndex + 1);
    showDropdown.value = true;
  } else {
    showDropdown.value = false;
  }
}

// 选择变量
function selectVariable(value: string) {
  const textarea = textareaRef.value?.textareaElRef;
  if (!textarea) return;

  const text = props.modelValue;
  const pos = cursorPosition.value;
  const textBeforeCursor = text.substring(0, pos);
  const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

  // 替换 / 及其后面的搜索文本为选中的变量
  const before = text.substring(0, lastSlashIndex);
  const after = text.substring(pos);
  const newValue = before + value + after;

  emit('update:modelValue', newValue);
  showDropdown.value = false;
  searchQuery.value = '';

  // 恢复焦点
  nextTick(() => {
    textarea.focus();
    const newPos = lastSlashIndex + value.length;
    textarea.setSelectionRange(newPos, newPos);
  });
}

// 渲染分组标题
function renderGroupLabel(group: (typeof groupedOptions.value)[0]) {
  return h('div', { class: 'flex items-center gap-2 px-3 py-2 text-xs font-500 c-gray-6' }, [
    h(
      'div',
      {
        class: 'h-5 w-5 flex flex-shrink-0 items-center justify-center rounded-1',
        style: {
          backgroundColor: getNodeIconBackground(group.color),
          color: group.color
        }
      },
      h(SvgIcon, { icon: group.icon, class: 'text-12px' })
    ),
    h('span', group.label)
  ]);
}

// 渲染选项
function renderOption(option: { label: string; value: string }) {
  return h(
    'div',
    {
      class: 'cursor-pointer px-4 py-2 text-xs hover:bg-gray-1 transition-colors',
      onClick: () => selectVariable(option.value)
    },
    option.label
  );
}
</script>

<template>
  <NPopover
    :show="showDropdown"
    trigger="manual"
    placement="bottom-start"
    :show-arrow="false"
    :flip="false"
    raw
    @clickoutside="showDropdown = false"
  >
    <template #trigger>
      <NInput
        ref="textareaRef"
        :value="modelValue"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder"
        size="small"
        @update:value="handleInput"
      />
    </template>

    <div class="variable-mention-dropdown max-h-80 w-96 overflow-y-auto rounded-2 bg-white shadow-lg">
      <div v-if="filteredGroups.length === 0" class="py-4 text-center text-xs c-gray-4">无匹配变量</div>
      <div v-for="group in filteredGroups" :key="group.label" class="py-1">
        <component :is="renderGroupLabel(group)" />
        <component :is="renderOption(option)" v-for="option in group.options" :key="option.value" />
      </div>
    </div>
  </NPopover>
</template>

<style scoped>
.variable-mention-dropdown {
  border: 1px solid #e5e7eb;
}
</style>
