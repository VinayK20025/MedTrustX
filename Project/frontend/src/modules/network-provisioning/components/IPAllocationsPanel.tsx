import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkProvisioning } from '../hooks/useNetworkProvisioning';
import type { IPAllocation } from '../types/network-provisioning.types';

export const IPAllocationsPanel: React.FC = () => {
  const { useIPAllocations } = useNetworkProvisioning();
  const { data: response, isLoading } = useIPAllocations();

  const allocations = response?.data || [
    { id: '1', subnet_id: '1', ip_address: '10.10.1.10', assigned_to: 'ehr-service', status: 'allocated' },
    { id: '2', subnet_id: '1', ip_address: '10.10.1.11', assigned_to: 'pharmacy-service', status: 'allocated' },
    { id: '3', subnet_id: '2', ip_address: '10.10.2.5', assigned_to: 'billing-gateway', status: 'reserved' }
  ];

  if (isLoading) return <div>Loading IP allocations...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="IP Address Allocations" />
      <CardBody>
        <div className="space-y-3">
          {allocations.map((ip: IPAllocation) => (
            <div key={ip.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-mono font-bold text-emerald-400">{ip.ip_address}</p>
                <p className="text-xs text-gray-500 mt-1">{ip.assigned_to}</p>
              </div>
              <Badge variant={ip.status === 'allocated' ? 'success' : 'outline'}>
                {ip.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
