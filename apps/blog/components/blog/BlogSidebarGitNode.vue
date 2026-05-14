<script setup lang="ts">
interface GitFileNode {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  depth: number;
  children?: GitFileNode[];
}

const props = defineProps<{
  node: GitFileNode;
  depth: number;
  expandedPaths: Set<string>;
  activeFile?: string;
}>();

const emit = defineEmits<{
  toggle: [path: string];
  select: [path: string];
}>();

const isDir = computed(() => props.node.type === 'tree');
const isExpanded = computed(() => props.expandedPaths.has(props.node.path));
const isActive = computed(() => props.activeFile === props.node.path);

function handleClick(e: MouseEvent) {
  e.stopPropagation();
  if (isDir.value) emit('toggle', props.node.path);
  else emit('select', props.node.path);
}

function onChildToggle(path: string) {
  emit('toggle', path);
}
function onChildSelect(path: string) {
  emit('select', path);
}
</script>

<template>
  <li class="git-node-item">
    <div
      class="git-node-row"
      :class="{ 'is-dir': isDir, 'is-file': !isDir, active: isActive }"
      :style="{ paddingLeft: `${depth * 0.875}rem` }"
      @click="handleClick"
    >
      <!-- 目录：展开箭头 -->
      <span v-if="isDir" class="git-collapse-btn">
        <span class="git-collapse-icon" :class="{ open: isExpanded }">▶</span>
      </span>
      <!-- 文件：缩进占位 -->
      <span v-else class="git-file-indent" />

      <!-- <span class="git-node-icon">{{ isDir ? (isExpanded ? '📂' : '📁') : '📄' }}</span> -->
      <span class="git-node-name">{{ node.name }}</span>
    </div>

    <!-- 子节点 -->
    <ul v-if="isDir && isExpanded && node.children?.length" class="git-children">
      <BlogSidebarGitNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :expanded-paths="expandedPaths"
        :active-file="activeFile"
        @toggle="onChildToggle"
        @select="onChildSelect"
      />
    </ul>
  </li>
</template>

<style scoped>
.git-node-item {
  list-style: none;
  margin: 0;
}

.git-node-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.git-node-row:hover {
  background: #f3f4f6;
}
.git-node-row.is-file:hover {
  background: #eff6ff;
}
.git-node-row.active {
  background: #eff6ff;
  color: #2563eb;
}

.git-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  color: #9ca3af;
  font-size: 0.55rem;
}

.git-collapse-icon {
  display: inline-block;
  transition: transform 0.2s ease;
}

.git-collapse-icon.open {
  transform: rotate(90deg);
}

.git-file-indent {
  width: 16px;
  flex-shrink: 0;
}

.git-node-icon {
  font-size: 0.8rem;
  flex-shrink: 0;
}

.git-node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.git-node-row.active .git-node-name {
  color: #2563eb;
  font-weight: 500;
}
.git-node-row.is-dir .git-node-name {
  color: #374151;
  font-weight: 500;
}

.git-children {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
