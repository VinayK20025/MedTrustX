import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGitea } from '../hooks/useGitea';
import type { Repository } from '../types/gitea.types';

export const RepositoriesPanel: React.FC = () => {
  const { useRepositories } = useGitea();
  const { data: response, isLoading } = useRepositories();

  const repos = response?.data || [
    { id: 'repo-1', name: 'medtrustx-core-api', owner_id: 'org-engineering', is_private: true },
    { id: 'repo-2', name: 'clinical-ui-components', owner_id: 'org-frontend', is_private: false }
  ];

  if (isLoading) return <div>Loading repositories...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Gitea Source Repositories" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((r: Repository) => (
            <div key={r.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  <h3 className="text-sm font-bold text-blue-400">{r.name}</h3>
                </div>
                <Badge variant={r.is_private ? 'outline' : 'success'}>
                  {r.is_private ? 'PRIVATE' : 'PUBLIC'}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                Owner: {r.owner_id}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
