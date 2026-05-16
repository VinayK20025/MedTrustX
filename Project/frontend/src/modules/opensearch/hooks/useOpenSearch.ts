import { useAutoApi } from '@/hooks/useAutoApi';

export function useOpenSearch() {
  const api = useAutoApi().opensearchSearch;
  
  return {
    useIndices: (params?: any) => api.useList({ ...params, type: 'search_index' }),
    useDocuments: (params?: any) => api.useList({ ...params, type: 'indexed_document' }),
    useQueries: (params?: any) => api.useList({ ...params, type: 'search_query' }),
  };
}
