import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useGitea } from '../hooks/useGitea';
import type { Commit } from '../types/gitea.types';

export const CommitsPanel: React.FC = () => {
  const { useCommits } = useGitea();
  const { data: response, isLoading } = useCommits();

  const commits = response?.data || [
    { id: '1', repo_id: 'medtrustx-core-api', commit_hash: 'a1b2c3d', author_id: 'dev-jsmith', message: 'fix: resolve race condition in auth token refresh' },
    { id: '2', repo_id: 'clinical-ui-components', commit_hash: 'f9e8d7c', author_id: 'dev-tjones', message: 'feat: add vital signs trend chart component' }
  ];

  if (isLoading) return <div>Loading commits...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Recent Commit History" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {commits.map((c: Commit) => (
            <li key={c.id} className="relative pl-4">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{c.commit_hash}</span>
                <span className="text-xs text-gray-400">by {c.author_id}</span>
              </div>
              <p className="text-sm text-gray-200">{c.message}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Repo: {c.repo_id}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
