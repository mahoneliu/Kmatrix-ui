<script setup lang="ts">
interface GitTreeNode {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  name: string;
  depth: number;
  children: GitTreeNode[];
}

const props = defineProps<{
  node: GitTreeNode;
  expandedPaths: Set<string>;
}>();

const emit = defineEmits<{
  toggle: [path: string];
  select: [path: string];
}>();

const isExpanded = computed(() => props.expandedPaths.has(props.node.path));
const isDirectory = computed(() => props.node.type === 'tree');

function handleClick() {
  if (isDirectory.value) {
    emit('toggle', props.node.path);
  } else {
    emit('select', props.node.path);
  }
}

function onChildToggle(path: string) {
  emit('toggle', path);
}

function onChildSelect(path: string) {
  emit('select', path);
}
</script>

<template>
  <li class="tree-node">
    <div
      class="node-row"
      :class="{ 'node-dir': isDirectory, 'node-file': !isDirectory }"
      :style="{ paddingLeft: `${node.depth * 1}rem` }"
      @click="handleClick"
    >
      <!-- 目录图标 -->
      <span v-if="isDirectory" class="node-icon dir-icon">
        {{ isExpanded ? '📂' : '📁' }}
      </span>
      <!-- 文件图标 -->
      <span v-else class="node-icon file-icon">📄</span>

      <span class="node-name">{{ node.name }}</span>

      <!-- 目录展开箭头 -->
      <span v-if="isDirectory" class="expand-arrow" :class="{ expanded: isExpanded }">▶</span>
    </div>

    <!-- 子节点 -->
    <ul v-if="isDirectory && isExpanded && node.children.length > 0" class="tree-children">
      <BlogGitTreeViewerNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :expanded-paths="expandedPaths"
        @toggle="onChildToggle"
        @select="onChildSelect"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.node-row:hover {
  background: #f3f4f6;
}

.node-file:hover {
  background: #eff6ff;
  color: #2563eb;
}

.node-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  color: #374151;
}

.node-file .node-name {
  color: #4b5563;
}

.node-file:hover .node-name {
  color: #2563eb;
}

.expand-arrow {
  font-size: 0.5rem;
  color: #9ca3af;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-arrow.expanded {
  transform: rotate(90deg);
}

.tree-children {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
