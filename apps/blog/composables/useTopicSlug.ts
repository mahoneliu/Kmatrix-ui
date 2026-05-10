/**
 * 获取当前部署的专题 slug（多专题部署支持）
 * 当 NUXT_PUBLIC_TOPIC_SLUG 设置时，所有 API 请求附加 topicSlug 过滤参数
 */
export function useTopicSlug() {
  const config = useRuntimeConfig();
  const topicSlug = config.public.topicSlug as string;

  /**
   * 为 API URL 附加 topicSlug 参数（如果已配置）
   */
  function appendTopicSlug(params: URLSearchParams): URLSearchParams {
    if (topicSlug) {
      params.set('topicSlug', topicSlug);
    }
    return params;
  }

  return {
    topicSlug,
    appendTopicSlug,
    hasTopicFilter: Boolean(topicSlug)
  };
}
