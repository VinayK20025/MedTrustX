import { useAutoApi } from '@/hooks/useAutoApi';

export function useGitea() {
  const api = useAutoApi().giteaSourceControl;
  
  return {
    useRepositories: (params?: any) => api.useList({ ...params, type: 'repository' }),
    useCommits: (params?: any) => api.useList({ ...params, type: 'commit' }),
    usePullRequests: (params?: any) => api.useList({ ...params, type: 'pull_request' }),
    useIssues: (params?: any) => api.useList({ ...params, type: 'issue' }),
  };
}
