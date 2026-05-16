import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSonarQube } from '../hooks/useSonarQube';
import type { Project } from '../types/sonarqube.types';

export const ProjectsPanel: React.FC = () => {
  const { useProjects } = useSonarQube();
  const { data: response, isLoading } = useProjects();

  const projects = response?.data || [
    { id: '1', repo_id: 'auth-service-repo', name: 'Identity API' },
    { id: '2', repo_id: 'clinical-ui-repo', name: 'Clinical Dashboard' }
  ];

  if (isLoading) return <div>Loading SonarQube projects...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="SonarQube Projects" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p: Project) => (
            <div key={p.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex flex-col justify-center">
              <h3 className="text-sm font-bold text-gray-200 mb-2">{p.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {p.repo_id}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
