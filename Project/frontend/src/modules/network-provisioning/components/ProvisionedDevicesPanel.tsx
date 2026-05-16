import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkProvisioning } from '../hooks/useNetworkProvisioning';
import type { NetworkDevice } from '../types/network-provisioning.types';

export const ProvisionedDevicesPanel: React.FC = () => {
  const { useDevices } = useNetworkProvisioning();
  const { data: response, isLoading } = useDevices();

  const devices = response?.data || [
    { id: '1', device_id: 'sw-core-01', config: { vlan_count: 12, stp: 'rstp', firmware: '16.12.8' }, status: 'provisioned' },
    { id: '2', device_id: 'rt-edge-02', config: { bgp_peers: 3, ospf_area: '0.0.0.0', firmware: '7.8.1' }, status: 'pending' }
  ];

  if (isLoading) return <div>Loading devices...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Provisioned Appliances" />
      <CardBody>
        <div className="space-y-4">
          {devices.map((dev: NetworkDevice) => (
            <div key={dev.id} className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-200">{dev.device_id}</span>
                <Badge variant={dev.status === 'provisioned' ? 'success' : 'warning'}>
                  {dev.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(dev.config).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-gray-500 capitalize">{k.replace('_', ' ')}:</span>{' '}
                    <span className="text-white font-medium">{String(v)}</span>
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
