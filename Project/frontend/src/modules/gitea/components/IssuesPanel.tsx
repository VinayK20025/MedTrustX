import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useGitea } from '../hooks/useGitea';
import type { Issue } from '../types/gitea.types';

export const IssuesPanel: React.FC = () => {
  const { useIssues } = useGitea();
  const { data: response, isLoading } = useIssues();

  const issues = response?.data || [
    { id: 'iss-890', repo_id: 'medtrustx-core-api', title: '500 error when fetching patient allergies', description: 'Endpoint throws KeyError if allergy list is empty', status: 'open' },
    { id: 'iss-889', repo_id: 'clinical-ui-components', title: 'Tooltip hidden behind modal z-index', description: null, status: 'closed' }
  ];

  if (isLoading) return <div>Loading issues...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Repository Issues Tracker" />
      <CardBody>
        <div className="space-y-4">
          {issues.map((iss: Issue) => (
            <div key={iss.id} className="p-3 border-l-4 rounded bg-white/5 border border-white/10"
              style={{ borderLeftColor: iss.status === 'open' ? '#10b981' : '#6b7280' }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-sm font-semibold ${iss.status === 'closed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {iss.title}
                </h3>
                <Badge variant={iss.status === 'open' ? 'success' : 'outline'}>
                  {iss.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {iss.description || <span className="italic">No description provided</span>}
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {iss.id} • {iss.repo_id}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
