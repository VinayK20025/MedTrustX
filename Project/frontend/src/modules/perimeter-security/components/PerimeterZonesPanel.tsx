import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { usePerimeterSecurity } from '../hooks/usePerimeterSecurity';
import type { PerimeterZone } from '../types/perimeter-security.types';

export const PerimeterZonesPanel: React.FC = () => {
  const { useZones } = usePerimeterSecurity();
  const { data: response, isLoading } = useZones();

  const zones = response?.data || [
    { id: '1', name: 'North Perimeter Wall', boundary: { type: 'polygon', points: 48 } },
    { id: '2', name: 'Emergency Bay Entrance', boundary: { type: 'line', points: 12 } },
    { id: '3', name: 'Service Road Gate', boundary: { type: 'polygon', points: 24 } }
  ];

  if (isLoading) return <div>Loading perimeter zones...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Perimeter Boundary Zones" />
      <CardBody>
        <div className="space-y-4">
          {zones.map((zone: PerimeterZone) => (
            <div key={zone.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-100">{zone.name}</p>
                <p className="text-sm text-gray-400 mt-1 capitalize">{zone.boundary.type} · {zone.boundary.points} vertices</p>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">🛡️ ACTIVE</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
