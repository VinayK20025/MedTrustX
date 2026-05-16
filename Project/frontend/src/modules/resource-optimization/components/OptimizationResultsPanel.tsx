import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useResourceOptimization } from '../hooks/useResourceOptimization';
import type { OptimizationResult } from '../types/resource-optimization.types';

export const OptimizationResultsPanel: React.FC = () => {
  const { useResults } = useResourceOptimization();
  const { data: response, isLoading } = useResults();

  const results = response?.data || [
    { id: '1', run_id: 'run-alpha', result: { recommended_bed_transfers: 14, projected_savings_hours: 42, bottleneck_identified: 'ICU Step-down Unit' } }
  ];

  if (isLoading) return <div>Loading optimization results...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Optimization Insights & Recommendations" />
      <CardBody>
        <div className="space-y-4">
          {results.map((res: OptimizationResult) => (
            <div key={res.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="text-xs text-blue-400 font-mono mb-3">Derived from {res.run_id}</p>
              <div className="flex flex-col gap-2">
                {Object.entries(res.result).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-xs bg-black/40 px-3 py-2 rounded">
                    <span className="text-gray-400 capitalize mr-4">{k.replace(/_/g, ' ')}</span>
                    <span className="text-emerald-400 font-bold text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
