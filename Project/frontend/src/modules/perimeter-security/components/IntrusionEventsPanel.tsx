import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePerimeterSecurity } from '../hooks/usePerimeterSecurity';
import type { IntrusionEvent } from '../types/perimeter-security.types';

export const IntrusionEventsPanel: React.FC = () => {
  const { useIntrusions } = usePerimeterSecurity();
  const { data: response, isLoading } = useIntrusions();

  const events = response?.data || [
    { id: '1', zone_id: '1', event_type: 'motion_detected', severity: 'warning' },
    { id: '2', zone_id: '3', event_type: 'fence_cut', severity: 'critical' }
  ];

  if (isLoading) return <div>Loading intrusion events...</div>;

  return (
    <Card className="h-full">
      <CardHeader title="Intrusion Alerts" />
      <CardBody>
        <div className="space-y-4">
          {events.map((e: IntrusionEvent) => (
            <div key={e.id} className="p-4 border border-white/10 rounded-lg bg-white/5 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold capitalize">{e.event_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 mt-1">Zone: {e.zone_id}</p>
                </div>
                <Badge variant={e.severity === 'critical' ? 'danger' : 'warning'}>
                  {e.severity.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
