import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useSlaHealth } from '../hooks/useSlaHealth';
import type { SlaDefinition } from '../types/sla-health.types';

export const SlaDefinitionsPanel: React.FC = () => {
  const { useDefinitions } = useSlaHealth();
  const { data: response, isLoading } = useDefinitions();

  const slas = response?.data || [
    { id: '1', service_name: 'Patient Record Service', uptime_target: 99.99, latency_target: 150.0 },
    { id: '2', service_name: 'Pharmacy Inventory', uptime_target: 99.9, latency_target: 250.0 }
  ];

  if (isLoading) return <div>Loading SLAs...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="SLA Configurations" />
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          {slas.map((sla: SlaDefinition) => (
            <div key={sla.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-200">{sla.service_name}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-emerald-400">Uptime Target: {sla.uptime_target}%</span>
                  <span className="text-blue-400">Latency Target: &lt;{sla.latency_target}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
