import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useApiComposition } from '../hooks/useApiComposition';
import type { ApiComposition } from '../types/api-composition.types';

export const ApiCompositionsPanel: React.FC = () => {
  const { useCompositions } = useApiComposition();
  const { data: response, isLoading } = useCompositions();

  const compositions = response?.data || [
    { id: '1', name: 'Patient 360 Aggregate View', definition: { services: ['patient-service', 'billing-service', 'clinical-service'] } },
    { id: '2', name: 'Executive Financial Summary', definition: { services: ['billing-service', 'rcm-service'], cache_ttl: 300 } }
  ];

  if (isLoading) return <div>Loading compositions...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="API Compositions Registry" />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {compositions.map((c: ApiComposition) => (
            <div key={c.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <p className="text-sm font-semibold text-blue-400 mb-2">{c.name}</p>
              <div className="text-[11px] font-mono text-gray-300 bg-black/40 p-2 rounded">
                <span className="text-gray-500 mb-1 block">Orchestrates:</span>
                {c.definition.services?.map((svc: string) => (
                  <span key={svc} className="inline-block bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded mr-1 mb-1">
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
