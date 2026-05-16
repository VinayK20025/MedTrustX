import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePerimeterSecurity } from '../hooks/usePerimeterSecurity';
import type { Sensor } from '../types/perimeter-security.types';

export const SensorsPanel: React.FC = () => {
  const { useSensors } = usePerimeterSecurity();
  const { data: response, isLoading } = useSensors();

  const sensors = response?.data || [
    { id: '1', zone_id: '1', sensor_type: 'lidar', status: 'active' },
    { id: '2', zone_id: '1', sensor_type: 'fence_vibration', status: 'active' },
    { id: '3', zone_id: '2', sensor_type: 'radar', status: 'offline' }
  ];

  if (isLoading) return <div>Loading sensors...</div>;

  const typeIcon = (t: string) => {
    switch (t) {
      case 'lidar': return '🔴';
      case 'fence_vibration': return '〰️';
      case 'radar': return '📡';
      default: return '📍';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader title="Boundary Sensors" />
      <CardBody>
        <div className="space-y-3">
          {sensors.map((s: Sensor) => (
            <div key={s.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span>{typeIcon(s.sensor_type)}</span>
                <span className="text-sm font-semibold capitalize">{s.sensor_type.replace('_', ' ')}</span>
              </div>
              <Badge variant={s.status === 'active' ? 'success' : 'danger'}>
                {s.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
