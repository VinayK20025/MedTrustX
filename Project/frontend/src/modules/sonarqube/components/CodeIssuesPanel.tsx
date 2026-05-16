import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSonarQube } from '../hooks/useSonarQube';
import type { CodeIssue } from '../types/sonarqube.types';

export const CodeIssuesPanel: React.FC = () => {
  const { useIssues } = useSonarQube();
  const { data: response, isLoading } = useIssues();

  const issues = response?.data || [
    { id: '1', project_id: 'Identity API', severity: 'critical', type: 'vulnerability', description: 'Hardcoded JWT secret detected in environment loader.' },
    { id: '2', project_id: 'Clinical Dashboard', severity: 'major', type: 'code_smell', description: 'Cognitive complexity of handlePatientUpdate exceeds 15.' }
  ];

  if (isLoading) return <div>Loading code issues...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Identified Code Issues" />
      <CardBody>
        <div className="space-y-4">
          {issues.map((i: CodeIssue) => (
            <div key={i.id} className="p-4 border-l-4 rounded bg-white/5 border border-white/10"
              style={{ borderLeftColor: i.severity === 'blocker' || i.severity === 'critical' ? '#ef4444' : i.severity === 'major' ? '#f59e0b' : '#3b82f6' }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-200">{i.project_id}</span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-black/40 px-2 py-1 rounded text-gray-400 uppercase">{i.type.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${i.severity === 'blocker' || i.severity === 'critical' ? 'bg-red-500/20 text-red-400' : i.severity === 'major' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {i.severity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {i.description}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
