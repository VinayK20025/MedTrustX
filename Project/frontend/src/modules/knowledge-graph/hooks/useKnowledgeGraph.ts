import { useAutoApi } from '@/hooks/useAutoApi';

export function useKnowledgeGraph() {
  const api = useAutoApi().knowledgeGraphEngine;
  
  return {
    useNodes: (params?: any) => api.useList({ ...params, type: 'node' }),
    useEdges: (params?: any) => api.useList({ ...params, type: 'edge' }),
    useQueries: (params?: any) => api.useList({ ...params, type: 'query' }),
    useInferences: (params?: any) => api.useList({ ...params, type: 'inference' }),
  };
}
