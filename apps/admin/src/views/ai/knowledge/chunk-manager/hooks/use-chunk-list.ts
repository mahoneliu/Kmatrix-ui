import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { fetchChunksByPage } from '@/service/api/ai/knowledge';

interface UseChunkListOptions {
  documentId: Ref<string | undefined>;
  searchField: Ref<'title' | 'content'>;
  searchKeyword: Ref<string>;
}

export function useChunkList(options: UseChunkListOptions) {
  const { documentId, searchField, searchKeyword } = options;

  const chunks = ref<Api.AI.KB.DocumentChunk[]>([]);
  const loading = ref(false);
  const total = ref(0);

  // 分页相关
  const pageNum = ref(1);
  const pageSize = ref(20);
  const hasMore = ref(true);
  const loadingMore = ref(false);

  async function loadChunks() {
    if (!documentId.value || loading.value) return;
    loading.value = true;
    try {
      const params: Api.AI.KB.ChunkPageQuery = {
        documentId: documentId.value,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      };

      // 根据搜索字段添加搜索参数
      if (searchKeyword.value.trim()) {
        if (searchField.value === 'title') {
          params.title = searchKeyword.value.trim();
        } else {
          params.content = searchKeyword.value.trim();
        }
      }

      const { data } = await fetchChunksByPage(params);

      if (data) {
        chunks.value = data.rows || [];
        total.value = data.total || 0;
        const totalPages = Math.ceil(data.total / pageSize.value);
        hasMore.value = pageNum.value < totalPages;
      }
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreChunks() {
    if (!documentId.value || loadingMore.value || !hasMore.value) return;

    loadingMore.value = true;
    try {
      pageNum.value += 1;
      const { data } = await fetchChunksByPage({
        documentId: documentId.value,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      });

      if (data && data.rows) {
        chunks.value.push(...data.rows);
        const totalPages = Math.ceil(data.total / pageSize.value);
        hasMore.value = pageNum.value < totalPages;
      }
    } finally {
      loadingMore.value = false;
    }
  }

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 距离底部 50px 时触发加载
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadMoreChunks();
    }
  }

  function resetPagination() {
    pageNum.value = 1;
    hasMore.value = true;
    chunks.value = [];
  }

  // 监听 documentId 变化
  watch(documentId, async val => {
    if (val) {
      resetPagination();
      await loadChunks();
    } else {
      chunks.value = [];
    }
  });

  return {
    chunks,
    loading,
    total,
    pageNum,
    hasMore,
    loadingMore,
    loadChunks,
    loadMoreChunks,
    handleScroll,
    resetPagination
  };
}
