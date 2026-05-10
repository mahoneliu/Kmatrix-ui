<script setup lang="ts">
interface GitTreeNode {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  name: string;
  depth: number;
}

interface TreeNodeWithChildren extends GitTreeNode {
  children: TreeNodeWithChildren[];
}

const props = defineProps<{
  categoryId: number;
}>();

const emit = defineEmits<{
  select: [path: string];
}>();

// 获取目录树数据（不使用 await，避免在普通组件中顶层 await 导致注册失败）
const { data, pending, error, refresh } = useFetch<GitTreeNode[]>(() => `/api/git-tree?categoryId=${props.categoryId}`);

const flatNodes = computed(() => data.value ?? []);

/**
 * 将扁平节点列表转为层级树结构
 */
function buildTreeFromFlat(nodes: GitTreeNode[]): TreeNodeWithChildren[] {
  const roots: TreeNodeWithChildren[] = [];
  const nodeMap = new Map<string, TreeNodeWithChildren>();

  // 先建立 map
  for (const node of nodes) {
    nodeMap.set(node.path, { ...node, children: [] });
  }

  // 建立父子关系
  for (const node of nodes) {
    const treeNode = nodeMap.get(node.path)!;
    const lastSlash = node.path.lastIndexOf('/');
    if (lastSlash === -1) {
      // 根节点
      roots.push(treeNode);
    } else {
      const parentPath = node.path.slice(0, lastSlash);
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children.push(treeNode);
      } else {
        // 父节点不存在（可能被过滤掉了），作为根节点
        roots.push(treeNode);
      }
    }
  }

  return roots;
}

const treeData = computed(() => buildTreeFromFlat(flatNodes.value));

// 展开/折叠状态
const expandedPaths = ref<Set<string>>(new Set());

function toggleExpand(path: string) {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path);
  } else {
    expandedPaths.value.add(path);
  }
}

function onSelectFile(path: string) {
  emit('select', path);
}

// 初始展开第一层目录
watch(
  treeData,
  nodes => {
    for (const node of nodes) {
      if (node.type === 'tree') {
        expandedPaths.value.add(node.path);
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="git-tree-viewer">
    <div class="tree-header">
      <span class="tree-title">📁 文件目录</span>
      <button class="refresh-btn" title="刷新" @click="refresh">↻</button>
    </div>

    <!-- 加载中 -->
    <div v-if="pending" class="tree-loading">
      <div v-for="i in 5" :key="i" class="tree-skeleton" :style="{ width: `${60 + i * 8}%` }" />
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="tree-error">
      <p>加载目录树失败</p>
      <p class="tree-error-detail">{{ (error as any)?.data?.message || error?.message || '未知错误' }}</p>
      <button class="retry-btn" @click="refresh">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="treeData.length === 0" class="tree-empty">
      <p>暂无文件</p>
    </div>

    <!-- 目录树 -->
    <ul v-else class="tree-list">
      <BlogGitTreeViewerNode
        v-for="node in treeData"
        :key="node.path"
        :node="node"
        :expanded-paths="expandedPaths"
        @toggle="toggleExpand"
        @select="onSelectFile"
      />
    </ul>
  </div>
</template>

<style scoped>
.git-tree-viewer {
  font-size: 0.875rem;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tree-title {
  font-weight: 600;
  color: #374151;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 1rem;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
}

.refresh-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.tree-loading {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.tree-skeleton {
  height: 0.875rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.tree-error,
.tree-empty {
  text-align: center;
  padding: 1.5rem 0;
  color: #9ca3af;
}

.tree-error-detail {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  word-break: break-all;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
}

.tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
