import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNetworkManagement } from '../hooks/useNetworkManagement';
import type { NetworkTopology } from '../types/network-management.types';

export const NetworkTopologyPanel: React.FC = () => {
  const { useTopology } = useNetworkManagement();
  const { data: response, isLoading } = useTopology();

  const edges = response?.data || [
    { id: '1', source_device: 'core-router-01', target_device: 'dist-switch-A', link_status: 'active' },
    { id: '2', source_device: 'dist-switch-A', target_device: 'access-switch-ward3', link_status: 'active' },
    { id: '3', source_device: 'core-router-01', target_device: 'firewall-dmz', link_status: 'degraded' }
  ];

  if (isLoading) return <div>Loading topology...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Network Topology Map" />
      <CardBody>
        <div className="space-y-3">
          {edges.map((edge: NetworkTopology) => (
            <div key={edge.id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-400">{edge.source_device}</span>
                <span className="text-xs text-gray-500">&rarr;</span>
                <span className="text-sm font-semibold text-teal-400">{edge.target_device}</span>
              </div>
              <Badge variant={edge.link_status === 'active' ? 'success' : 'warning'}>
                {edge.link_status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
