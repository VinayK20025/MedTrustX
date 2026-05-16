import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkProvisioning } from '../hooks/useNetworkProvisioning';
import type { Subnet } from '../types/network-provisioning.types';

export const SubnetsPanel: React.FC = () => {
  const { useSubnets } = useNetworkProvisioning();
  const { data: response, isLoading } = useSubnets();

  const subnets = response?.data || [
    { id: '1', network_id: '1', cidr: '10.10.1.0/24', status: 'active' },
    { id: '2', network_id: '1', cidr: '10.10.2.0/24', status: 'active' },
    { id: '3', network_id: '3', cidr: '10.30.1.0/24', status: 'provisioning' }
  ];

  if (isLoading) return <div>Loading subnets...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Subnet Segments" />
      <CardBody>
        <ul className="space-y-3">
          {subnets.map((sub: Subnet) => (
            <li key={sub.id} className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-sm font-mono text-blue-400">{sub.cidr}</span>
              <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>
                {sub.status.toUpperCase()}
              </Badge>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};
