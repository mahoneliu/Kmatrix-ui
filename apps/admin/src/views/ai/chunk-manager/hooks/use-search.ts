import { ref } from 'vue';

export function useSearch() {
  const searchField = ref<'title' | 'content'>('title');
  const searchKeyword = ref('');

  function clearSearch() {
    searchKeyword.value = '';
  }

  return {
    searchField,
    searchKeyword,
    clearSearch
  };
}
