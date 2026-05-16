import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import type { FaultEvent } from '../types/network-management.types';

export const FaultEventsPanel: React.FC = () => {
  const { useFaults } = useNetworkManagement();
  const { data: response, isLoading } = useFaults();

  const faults = response?.data || [
    { id: '1', device_id: 'firewall-dmz', fault_type: 'high_cpu', severity: 'warning' },
    { id: '2', device_id: 'access-switch-ward3', fault_type: 'link_down', severity: 'critical' }
  ];

  if (isLoading) return <div>Loading fault events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Fault Events" />
      <CardBody>
        <div className="space-y-4">
          {faults.map((f: FaultEvent) => (
            <div key={f.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{f.fault_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">Device: {f.device_id}</p>
                </div>
                <Badge variant={f.severity === 'critical' ? 'danger' : 'warning'}>
                  {f.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
