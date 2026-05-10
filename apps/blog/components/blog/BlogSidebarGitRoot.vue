<script setup lang="ts">
/**
 * GIT 类型顶层分类的侧边栏渲染组件
 * 直接展示 git 文件树，跳过顶层节点行（不显示分类名称行）
 */
interface GitFileNode {
  path: string;
  type: 'tree' | 'blob';
  name: string;
  depth: number;
  children?: GitFileNode[];
}

const props = defineProps<{
  categoryId: number;
  activeGitFile?: string;
}>();

const emit = defineEmits<{
  selectGitFile: [categoryId: number, filePath: string];
}>();

const gitNodes = ref<GitFileNode[]>([]);
const gitLoaded = ref(false);
const gitLoading = ref(false);
const gitExpandedPaths = ref<Set<string>>(new Set());

async function loadGitTree() {
  if (gitLoaded.value || gitLoading.value) return;
  gitLoading.value = true;
  try {
    const flat = await $fetch<GitFileNode[]>(`/api/git-tree?categoryId=${props.categoryId}`);
    gitNodes.value = buildTree(flat ?? []);
    gitLoaded.value = true;
    // 默认展开第一层目录
    for (const node of gitNodes.value) {
      if (node.type === 'tree') gitExpandedPaths.value.add(node.path);
    }
  } catch {
    // ignore
  } finally {
    gitLoading.value = false;
  }
}

function buildTree(flat: GitFileNode[]): GitFileNode[] {
  const roots: GitFileNode[] = [];
  const map = new Map<string, GitFileNode>();
  for (const n of flat) map.set(n.path, { ...n, children: [] });
  for (const n of flat) {
    const node = map.get(n.path)!;
    const slash = n.path.lastIndexOf('/');
    if (slash === -1) {
      roots.push(node);
    } else {
      const parent = map.get(n.path.slice(0, slash));
      if (parent) parent.children!.push(node);
      else roots.push(node);
    }
  }
  return roots;
}

function toggleGitDir(path: string) {
  if (gitExpandedPaths.value.has(path)) gitExpandedPaths.value.delete(path);
  else gitExpandedPaths.value.add(path);
}

function selectGitFile(filePath: string) {
  emit('selectGitFile', props.categoryId, filePath);
}

onMounted(() => {
  loadGitTree();
});
</script>

<template>
  <div class="git-root">
    <div v-if="gitLoading" class="git-loading">加载中…</div>
    <ul v-else-if="gitNodes.length > 0" class="git-tree-list">
      <BlogSidebarGitNode
        v-for="node in gitNodes"
        :key="node.path"
        :node="node"
        :depth="0"
        :expanded-paths="gitExpandedPaths"
        :active-file="activeGitFile"
        @toggle="toggleGitDir"
        @select="selectGitFile"
      />
    </ul>
    <div v-else-if="gitLoaded" class="git-empty">暂无文件</div>
  </div>
</template>

<style scoped>
.git-root {
  width: 100%;
}

.git-tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.git-loading,
.git-empty {
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 0.5rem 0;
}
</style>
