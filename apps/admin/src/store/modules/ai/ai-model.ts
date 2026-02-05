import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchModelList } from '@/service/api/ai/model';

/**
 * AI 模型 Store
 * 用于缓存模型列表数据,避免重复请求
 */
export const useAiModelStore = defineStore('ai-model', () => {
  // 模型列表
  const models = ref<Api.AI.Admin.Model[]>([]);

  // 加载状态
  const loading = ref(false);

  // 是否已加载
  const loaded = ref(false);

  // 正在加载的 Promise (用于避免并发请求)
  let loadingPromise: Promise<Api.AI.Admin.Model[]> | null = null;

  /**
   * 加载模型列表
   * @param force 是否强制刷新
   */
  async function loadModels(force = false) {
    // 如果已加载且不强制刷新,直接返回
    if (loaded.value && !force) {
      return models.value;
    }

    // 如果正在加载中,返回同一个 Promise,避免重复请求
    if (loadingPromise) {
      return loadingPromise;
    }

    loading.value = true;
    loadingPromise = fetchModelList({ modelType: '1', status: '0' })
      .then(res => {
        if (res.data) {
          models.value = res.data;
          loaded.value = true;
        }
        return models.value;
      })
      .catch(error => {
        // console.error('加载模型列表失败:', error);
        throw error;
      })
      .finally(() => {
        loading.value = false;
        loadingPromise = null;
      });

    return loadingPromise;
  }

  /**
   * 获取模型选项(用于 NSelect)
   */
  function getModelOptions() {
    return models.value.map(m => ({
      label: m.modelName,
      value: m.modelId
    }));
  }

  /**
   * 根据 ID 获取模型
   */
  function getModelById(modelId: CommonType.IdType) {
    return models.value.find(m => m.modelId === modelId);
  }

  /**
   * 清空缓存
   */
  function clearCache() {
    models.value = [];
    loaded.value = false;
    loadingPromise = null;
  }

  return {
    models,
    loading,
    loaded,
    loadModels,
    getModelOptions,
    getModelById,
    clearCache
  };
});
