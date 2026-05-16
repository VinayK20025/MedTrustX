import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useResourceOptimization } from '../hooks/useResourceOptimization';
import type { Resource } from '../types/resource-optimization.types';

export const ResourcesPanel: React.FC = () => {
  const { useResources } = useResourceOptimization();
  const { data: response, isLoading } = useResources();

  const resources = response?.data || [
    { id: '1', resource_type: 'bed', status: 'available', metadata: { ward: 'ICU', bed_number: 'B-12' } },
    { id: '2', resource_type: 'equipment', status: 'allocated', metadata: { type: 'Ventilator', model: 'Puritan Bennett 980' } },
    { id: '3', resource_type: 'staff', status: 'maintenance', metadata: { role: 'Charge Nurse', shift: 'Night' } }
  ];

  if (isLoading) return <div>Loading resources...</div>;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'available': return 'success';
      case 'allocated': return 'warning';
      case 'maintenance': return 'danger';
      default: return 'outline' as const;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Resource Inventory" />
      <CardBody>
        <div className="grid grid-cols-1 gap-3">
          {resources.map((r: Resource) => (
            <div key={r.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-bold capitalize text-blue-400 mb-1">{r.resource_type}</p>
                <div className="text-[10px] text-gray-400 font-mono flex gap-2">
                  {Object.entries(r.metadata).map(([k, v]) => (
                    <span key={k} className="bg-black/40 px-1.5 py-0.5 rounded">{v}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={statusVariant(r.status)}>
                  {r.status.toUpperCase()}
                </Badge>
                <p className="text-[10px] text-gray-600 mt-1">ID: {r.id.slice(0, 8)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
