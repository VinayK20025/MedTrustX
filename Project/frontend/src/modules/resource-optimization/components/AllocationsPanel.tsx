import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useResourceOptimization } from '../hooks/useResourceOptimization';
import type { Allocation } from '../types/resource-optimization.types';

export const AllocationsPanel: React.FC = () => {
  const { useAllocations } = useResourceOptimization();
  const { data: response, isLoading } = useAllocations();

  const allocations = response?.data || [
    { id: '1', resource_id: 'Bed B-12', assigned_to: 'PT-9941', start_time: new Date(Date.now() - 3600000).toISOString(), end_time: null, status: 'active' },
    { id: '2', resource_id: 'Ventilator PB-980', assigned_to: 'PT-9941', start_time: new Date(Date.now() - 7200000).toISOString(), end_time: new Date(Date.now() - 1800000).toISOString(), status: 'completed' }
  ];

  if (isLoading) return <div>Loading allocations...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'active': return 'success';
      case 'completed': return 'outline';
      case 'cancelled': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Current Resource Allocations" />
      <CardBody>
        <div className="space-y-4">
          {allocations.map((a: Allocation) => (
            <div key={a.id} className="p-4 border-l-4 border-l-blue-500 rounded bg-white/5 border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-sm font-semibold text-gray-200">{a.resource_id}</span>
                  <span className="text-xs text-gray-500 mx-2">assigned to</span>
                  <span className="text-sm font-bold text-emerald-400">{a.assigned_to}</span>
                </div>
                <Badge variant={statusVariant(a.status)}>
                  {a.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-3">
                <span>Started: {new Date(a.start_time).toLocaleTimeString()}</span>
                <span>{a.end_time ? `Ended: ${new Date(a.end_time).toLocaleTimeString()}` : 'Ongoing...'}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
