import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSonarQube } from '../hooks/useSonarQube';
import type { QualityGate } from '../types/sonarqube.types';

export const QualityGatesPanel: React.FC = () => {
  const { useQualityGates } = useSonarQube();
  const { data: response, isLoading } = useQualityGates();

  const gates = response?.data || [
    { id: 'qg-1', project_id: 'Identity API', status: 'passed', evaluated_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'qg-2', project_id: 'Clinical Dashboard', status: 'failed', evaluated_at: new Date(Date.now() - 7200000).toISOString() }
  ];

  if (isLoading) return <div>Loading quality gates...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Quality Gate Evaluations" />
      <CardBody>
        <div className="space-y-4">
          {gates.map((g: QualityGate) => (
            <div key={g.id} className={`p-4 border rounded-lg bg-white/5 flex justify-between items-center ${
              g.status === 'passed' ? 'border-emerald-500/30' : g.status === 'failed' ? 'border-red-500/30' : 'border-white/10'
            }`}>
              <div>
                <p className="text-sm font-bold text-gray-200">{g.project_id}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">Evaluated: {new Date(g.evaluated_at).toLocaleString()}</p>
              </div>
              <div className={`px-4 py-2 rounded font-bold tracking-widest text-sm ${
                g.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' :
                g.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {g.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
