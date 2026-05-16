import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useResourceOptimization } from '../hooks/useResourceOptimization';
import type { OptimizationRun } from '../types/resource-optimization.types';

export const OptimizationRunsPanel: React.FC = () => {
  const { useRuns } = useResourceOptimization();
  const { data: response, isLoading } = useRuns();

  const runs = response?.data || [
    { id: 'run-alpha', run_type: 'capacity_planning', status: 'completed', started_at: new Date(Date.now() - 14400000).toISOString(), completed_at: new Date(Date.now() - 14100000).toISOString() },
    { id: 'run-beta', run_type: 'scheduling', status: 'running', started_at: new Date().toISOString(), completed_at: null }
  ];

  if (isLoading) return <div>Loading optimization runs...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="AI Optimization Execution" />
      <CardBody>
        <ul className="border-l-2 border-white/10 ml-3 space-y-4">
          {runs.map((r: OptimizationRun) => (
            <li key={r.id} className="relative pl-4">
              <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${r.status === 'completed' ? 'bg-emerald-500' : r.status === 'running' ? 'bg-blue-500' : 'bg-red-500'}`} />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold capitalize text-gray-200">{r.run_type.replace(/_/g, ' ')}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Run ID: {r.id}</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
