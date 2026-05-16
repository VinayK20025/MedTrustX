import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useClinicalPathway } from '../hooks/useClinicalPathway';
import type { PathwayVariance } from '../types/clinical-pathway.types';

export const PathwayVariancesPanel: React.FC = () => {
  const { useVariances } = useClinicalPathway();
  const { data: response, isLoading } = useVariances();

  const variances = response?.data || [
    { id: '1', journey_id: 'Journey-PT-8820', expected_step: 3, actual_step: 4, variance_reason: 'Antibiotics delayed due to IV access issues.' },
    { id: '2', journey_id: 'Journey-PT-9941', expected_step: 5, actual_step: 2, variance_reason: 'Patient refused catheterization, reverted to medical management.' }
  ];

  if (isLoading) return <div>Loading pathway variances...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Clinical Pathway Deviations" />
      <CardBody>
        <div className="space-y-4">
          {variances.map((v: PathwayVariance) => (
            <div key={v.id} className="p-4 border-l-4 border-l-amber-500 rounded bg-white/5 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-gray-200">{v.journey_id}</span>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Expected: Step {v.expected_step}</span>
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Actual: Step {v.actual_step}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic border-t border-white/5 pt-2">
                "{v.variance_reason || 'No reason provided.'}"
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
