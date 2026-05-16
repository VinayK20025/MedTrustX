import { useAutoApi } from '@/hooks/useAutoApi';

export function useAssetTracking() {
  const api = useAutoApi().assetTrackingRtls;
  
  return {
    useAssets: (params?: any) => api.useList({ ...params, type: 'asset' }),
    useTags: (params?: any) => api.useList({ ...params, type: 'tag' }),
    useLocations: (params?: any) => api.useList({ ...params, type: 'location' }),
    useMovements: (params?: any) => api.useList({ ...params, type: 'movement' }),
  };
}
