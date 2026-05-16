import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useApiComposition } from '../hooks/useApiComposition';
import type { CompositionRoute } from '../types/api-composition.types';

export const CompositionRoutesPanel: React.FC = () => {
  const { useRoutes } = useApiComposition();
  const { data: response, isLoading } = useRoutes();

  const routes = response?.data || [
    { id: '1', path: '/api/v1/composed/patient-360/:id', method: 'GET', composition_id: 'Patient 360 Aggregate View' },
    { id: '2', path: '/api/v1/composed/exec/financials', method: 'GET', composition_id: 'Executive Financial Summary' }
  ];

  if (isLoading) return <div>Loading routing table...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Composition Route Map" />
      <CardBody>
        <div className="space-y-3">
          {routes.map((r: CompositionRoute) => (
            <div key={r.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                  {r.method}
                </span>
                <span className="text-sm font-mono text-gray-200">{r.path}</span>
              </div>
              <span className="text-[10px] text-gray-500 bg-black/40 px-2 py-1 rounded hidden md:block">
                → {r.composition_id}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
