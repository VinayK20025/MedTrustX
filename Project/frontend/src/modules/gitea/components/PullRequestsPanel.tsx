import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGitea } from '../hooks/useGitea';
import type { PullRequest } from '../types/gitea.types';

export const PullRequestsPanel: React.FC = () => {
  const { usePullRequests } = useGitea();
  const { data: response, isLoading } = usePullRequests();

  const prs = response?.data || [
    { id: 'pr-442', repo_id: 'medtrustx-core-api', source_branch: 'feature/rbac-roles', target_branch: 'main', status: 'open' },
    { id: 'pr-441', repo_id: 'clinical-ui-components', source_branch: 'bugfix/chart-tooltip', target_branch: 'main', status: 'merged' }
  ];

  if (isLoading) return <div>Loading pull requests...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'open': return 'success';
      case 'merged': return 'warning';
      case 'closed': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Active Pull Requests" />
      <CardBody>
        <div className="space-y-4">
          {prs.map((pr: PullRequest) => (
            <div key={pr.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-200">{pr.id}</span>
                  <span className="text-xs text-gray-500 font-mono">[{pr.repo_id}]</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{pr.source_branch}</span>
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">{pr.target_branch}</span>
                </div>
              </div>
              <Badge variant={statusVariant(pr.status)}>
                {pr.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
