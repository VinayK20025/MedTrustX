import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSonarQube } from '../hooks/useSonarQube';
import type { Analysis } from '../types/sonarqube.types';

export const AnalysesPanel: React.FC = () => {
  const { useAnalyses } = useSonarQube();
  const { data: response, isLoading } = useAnalyses();

  const analyses = response?.data || [
    { id: 'an-100', project_id: 'Identity API', status: 'success', score: 98.5 },
    { id: 'an-099', project_id: 'Clinical Dashboard', status: 'failed', score: 72.0 }
  ];

  if (isLoading) return <div>Loading analyses...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      case 'running': return 'warning';
      case 'pending': return 'outline';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Recent Analysis Runs" />
      <CardBody>
        <div className="space-y-4">
          {analyses.map((an: Analysis) => (
            <div key={an.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-200">{an.project_id}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Run ID: {an.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Score</p>
                  <p className={`font-bold font-mono ${an.score >= 90 ? 'text-emerald-400' : an.score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                    {an.score.toFixed(1)}%
                  </p>
                </div>
                <Badge variant={statusVariant(an.status)}>
                  {an.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
