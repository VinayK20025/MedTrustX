import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import type { ManagedDevice } from '../types/network-management.types';

export const ManagedDevicesPanel: React.FC = () => {
  const { useDevices } = useNetworkManagement();
  const { data: response, isLoading } = useDevices();

  const devices = response?.data || [
    { id: '1', device_type: 'router', ip_address: '10.0.0.1', status: 'online' },
    { id: '2', device_type: 'switch', ip_address: '10.0.1.1', status: 'online' },
    { id: '3', device_type: 'firewall', ip_address: '10.0.0.254', status: 'degraded' }
  ];

  if (isLoading) return <div>Loading devices...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'offline': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Managed Device Inventory" />
      <CardBody>
        <div className="space-y-4">
          {devices.map((dev: ManagedDevice) => (
            <div key={dev.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100 capitalize">{dev.device_type}</p>
                <p className="text-sm text-gray-400 font-mono mt-1">{dev.ip_address}</p>
              </div>
              <Badge variant={statusVariant(dev.status)}>
                {dev.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
