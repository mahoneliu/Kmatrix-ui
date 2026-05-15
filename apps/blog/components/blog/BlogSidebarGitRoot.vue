<script setup lang="ts">
/**
 * GIT 类型顶层分类的侧边栏渲染组件
 * 直接展示 git 文件树，跳过顶层节点行（不显示分类名称行）
 *
 * git tree 数据通过 BlogLayout provide 的缓存 Map 共享，
 * 路由切换导致组件重新挂载时直接从缓存读取，不重新请求。
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

// 从 BlogLayout 注入的跨路由 git tree 缓存
const gitTreeCache = inject<Map<number, GitFileNode[]>>('gitTreeCache', new Map());

// 跨路由共享的展开状态缓存，路由切换重新挂载后恢复展开状态
const gitExpandedCache = useGitExpandedCache();

const gitNodes = ref<GitFileNode[]>([]);
const gitLoaded = ref(false);
const gitLoading = ref(false);

// 从缓存恢复展开状态，若无缓存则初始化为空 Set（loadGitTree 后再填充）
const gitExpandedPaths = ref<Set<string>>(gitExpandedCache.get(props.categoryId) ?? new Set());

async function loadGitTree() {
  if (gitLoaded.value || gitLoading.value) return;

  // 命中缓存，直接使用，不重新请求
  const cached = gitTreeCache.get(props.categoryId);
  if (cached) {
    gitNodes.value = cached;
    gitLoaded.value = true;
    // 若展开状态缓存也存在，直接用（已在 ref 初始化时恢复），否则默认展开第一层
    if (!gitExpandedCache.has(props.categoryId)) {
      const expanded = new Set<string>();
      for (const node of gitNodes.value) {
        if (node.type === 'tree') expanded.add(node.path);
      }
      gitExpandedPaths.value = expanded;
      gitExpandedCache.set(props.categoryId, expanded);
    }
    return;
  }

  gitLoading.value = true;
  try {
    const flat = await $fetch<GitFileNode[]>(`/api/git-tree?categoryId=${props.categoryId}`);
    gitNodes.value = buildTree(flat ?? []);
    gitLoaded.value = true;
    // 写入 tree 缓存
    gitTreeCache.set(props.categoryId, gitNodes.value);
    // 默认展开第一层目录，并写入展开状态缓存
    const expanded = new Set<string>();
    for (const node of gitNodes.value) {
      if (node.type === 'tree') expanded.add(node.path);
    }
    gitExpandedPaths.value = expanded;
    gitExpandedCache.set(props.categoryId, expanded);
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
  const next = new Set(gitExpandedPaths.value);
  if (next.has(path)) next.delete(path);
  else next.add(path);
  gitExpandedPaths.value = next;
  // 同步到跨路由缓存
  gitExpandedCache.set(props.categoryId, next);
}

function selectGitFile(filePath: string) {
  emit('selectGitFile', props.categoryId, filePath);
}

// 通过 provide 将回调注入所有子孙节点，避免逐层 emit 导致多次触发
provide('gitToggle', toggleGitDir);
provide('gitSelect', selectGitFile);

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
