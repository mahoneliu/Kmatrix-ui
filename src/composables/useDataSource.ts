/**
 * 数据源管理 Composable
 * 统一加载和管理数据源列表
 *
 * @author Mahone
 * @date 2026-01-24
 */
import { ref } from 'vue';
import { fetchDataSourceList } from '@/service/api/ai/datasource';

export interface DataSourceOption {
  label: string;
  value: number;
}

export function useDataSource() {
  const dataSourceOptions = ref<DataSourceOption[]>([]);
  const loading = ref(false);

  /**
   * 加载数据源列表
   */
  async function loadDataSources() {
    if (loading.value) return;

    loading.value = true;
    try {
      const result = await fetchDataSourceList();
      let data: any;
      if (result && typeof result === 'object' && 'data' in result) {
        data = (result as any).data;
      } else {
        data = result;
      }
      dataSourceOptions.value = (data || []).map((ds: any) => ({
        label: ds.dataSourceName,
        value: ds.dataSourceId
      }));
    } catch {
      // 静默处理错误
      dataSourceOptions.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    dataSourceOptions,
    loading,
    loadDataSources
  };
}
