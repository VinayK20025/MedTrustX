import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEdgeConnectivity } from '../hooks/useEdgeConnectivity';
import type { EdgeNode } from '../types/edge-connectivity.types';

export const EdgeNodesPanel: React.FC = () => {
  const { useNodes } = useEdgeConnectivity();
  const { data: response, isLoading } = useNodes();

  const nodes = response?.data || [
    { id: '1', name: 'PHC-Sector-12', location: 'District Primary Health Centre', status: 'online' },
    { id: '2', name: 'Remote-Lab-East', location: 'Regional Lab Facility', status: 'degraded' },
    { id: '3', name: 'Mobile-Unit-3', location: 'Field Ambulance', status: 'offline' }
  ];

  if (isLoading) return <div>Loading edge nodes...</div>;

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
      <CardHeader title="Edge Node Fleet" />
      <CardBody>
        <div className="space-y-4">
          {nodes.map((node: EdgeNode) => (
            <div key={node.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{node.name}</p>
                <p className="text-sm text-gray-400 mt-1">{node.location || 'Location unknown'}</p>
              </div>
              <Badge variant={statusVariant(node.status)}>
                {node.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
