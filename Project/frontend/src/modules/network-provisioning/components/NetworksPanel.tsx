import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkProvisioning } from '../hooks/useNetworkProvisioning';
import type { Network } from '../types/network-provisioning.types';

export const NetworksPanel: React.FC = () => {
  const { useNetworks } = useNetworkProvisioning();
  const { data: response, isLoading } = useNetworks();

  const networks = response?.data || [
    { id: '1', name: 'Clinical VLAN', cidr: '10.10.0.0/16', status: 'active' },
    { id: '2', name: 'Admin Network', cidr: '10.20.0.0/16', status: 'active' },
    { id: '3', name: 'IoT Segment', cidr: '10.30.0.0/16', status: 'provisioning' }
  ];

  if (isLoading) return <div>Loading networks...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Provisioned Networks" />
      <CardBody>
        <div className="space-y-4">
          {networks.map((net: Network) => (
            <div key={net.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{net.name}</p>
                <p className="text-sm text-gray-400 font-mono mt-1">{net.cidr}</p>
              </div>
              <Badge variant={net.status === 'active' ? 'success' : 'warning'}>
                {net.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
