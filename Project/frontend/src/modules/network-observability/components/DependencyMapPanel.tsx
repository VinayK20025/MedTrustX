import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNetworkObservability } from '../hooks/useNetworkObservability';
import type { Dependency } from '../types/network-observability.types';

export const DependencyMapPanel: React.FC = () => {
  const { useDependencies } = useNetworkObservability();
  const { data: response, isLoading } = useDependencies();

  const deps = response?.data || [
    { id: '1', source_service: 'api-gateway', destination_service: 'clinical-service', latency: 4.2 },
    { id: '2', source_service: 'clinical-service', destination_service: 'diagnostics-service', latency: 8.1 },
    { id: '3', source_service: 'billing-service', destination_service: 'insurance-integration-service', latency: 22.5 }
  ];

  if (isLoading) return <div>Loading dependency map...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Service Dependency Map" />
      <CardBody>
        <div className="space-y-3">
          {deps.map((dep: Dependency) => (
            <div key={dep.id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-400">{dep.source_service}</span>
                <span className="text-xs text-gray-500">&rarr;</span>
                <span className="text-sm font-semibold text-teal-400">{dep.destination_service}</span>
              </div>
              <span className={`text-sm font-bold ${dep.latency < 10 ? 'text-emerald-400' : dep.latency < 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                {dep.latency.toFixed(1)}ms
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
